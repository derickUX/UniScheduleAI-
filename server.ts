import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import {
  extractScheduleFromDocument,
  extractScheduleFromText,
} from "./src/lib/geminiParser";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limit for PDF and image base64 uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health check route
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development",
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
  });
});

// Parse COR (Certificate of Registration) endpoint
app.post("/api/parse-cor", async (req, res) => {
  try {
    const { base64Data, mimeType, filename } = req.body || {};

    console.log(`[API /api/parse-cor] Received request for file: ${filename || "unnamed"}, mime: ${mimeType}`);

    if (!base64Data) {
      return res.status(400).json({
        error: "Missing document or image data in request",
      });
    }

    const result = await extractScheduleFromDocument({
      base64Data,
      mimeType,
      filename,
    });

    console.log(`[API /api/parse-cor] Successfully extracted ${result.courses.length} courses`);

    return res.json({
      success: true,
      data: result,
      ...result,
    });
  } catch (error: any) {
    console.error("[API /api/parse-cor] Error:", error);
    const statusCode = error.status === 429 ? 429 : 500;
    return res.status(statusCode).json({
      error: error?.message || "Failed to parse schedule document",
    });
  }
});

// Parse Schedule Text copied from School Portal endpoint
app.post("/api/parse-schedule-text", async (req, res) => {
  try {
    const { text } = req.body || {};
    console.log(`[API /api/parse-schedule-text] Received text of length: ${text?.length || 0}`);

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({
        error: "Please provide schedule text copied from your school website or portal.",
      });
    }

    const result = await extractScheduleFromText(text);
    console.log(`[API /api/parse-schedule-text] Extracted ${result.courses.length} courses from text`);

    return res.json({
      success: true,
      data: result,
      ...result,
    });
  } catch (error: any) {
    console.error("[API /api/parse-schedule-text] Error:", error);
    const statusCode = error.status === 429 ? 429 : 500;
    return res.status(statusCode).json({
      error: error?.message || "Failed to parse schedule text from school website",
    });
  }
});

// Vite dev server & production static handler
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
