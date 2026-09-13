import { extractScheduleFromText } from "../src/lib/geminiParser";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default async function handler(req: any, res: any) {
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
    const { text } = req.body || {};
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({
        error: "Please provide schedule text copied from your school website or portal.",
      });
    }

    const result = await extractScheduleFromText(text);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("API /api/parse-schedule-text error:", error);
    const statusCode = error.status === 429 ? 429 : 500;
    return res.status(statusCode).json({
      error: error.message || "Failed to analyze schedule text",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}
