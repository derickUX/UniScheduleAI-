import { extractScheduleFromDocument } from "../src/lib/geminiParser";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "35mb",
    },
  },
};

export default async function handler(req: any, res: any) {
  // Enable CORS if needed
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { base64Data, mimeType, filename } = req.body || {};

    if (!base64Data) {
      return res.status(400).json({
        error: "Missing document or image data (base64Data).",
      });
    }

    const result = await extractScheduleFromDocument({
      base64Data,
      mimeType,
      filename,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("API /api/parse-cor error:", error);
    const statusCode = error.status === 429 ? 429 : 500;
    return res.status(statusCode).json({
      error: error.message || "Failed to analyze document schedule",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}
