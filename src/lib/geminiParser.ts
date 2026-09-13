import { GoogleGenAI, Type } from "@google/genai";

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;

export function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not configured in the environment variables. Please configure GEMINI_API_KEY."
      );
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export function normalizeMimeType(mime?: string, filename?: string): string {
  let clean = (mime || "").toLowerCase().trim().split(";")[0];
  if (clean === "image/jpg" || clean === "image/pjpeg" || clean === "image/jfif") return "image/jpeg";
  if (clean === "image/x-png") return "image/png";
  if (!clean || clean === "application/octet-stream") {
    const ext = (filename || "").toLowerCase().split(".").pop();
    if (ext === "png") return "image/png";
    if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
    if (ext === "webp") return "image/webp";
    if (ext === "pdf") return "application/pdf";
    return "image/jpeg";
  }
  return clean;
}

export function isUnscheduledToken(val: any): boolean {
  if (!val || typeof val !== "string") return false;
  const s = val.trim().toLowerCase();
  return (
    s === "tba" ||
    s.includes("tba") ||
    s.includes("arr") ||
    s.includes("arranged") ||
    s.includes("online") ||
    s.includes("async") ||
    s.includes("virtual") ||
    s.includes("off-campus") ||
    s.includes("off campus") ||
    s.includes("tbd")
  );
}

export function normalizeCourseDays(rawDays: any, courseTitle: string = ""): DayOfWeek[] {
  if (isUnscheduledToken(rawDays) || isUnscheduledToken(courseTitle)) {
    return [];
  }

  const result: Set<DayOfWeek> = new Set();

  const parseDayToken = (token: string) => {
    if (!token || typeof token !== "string") return;
    const t = token.trim().toUpperCase();
    if (!t) return;

    if (t === "M" || t === "MON" || t === "MONDAY") result.add("Monday");
    else if (t === "T" || t === "TU" || t === "TUE" || t === "TUES" || t === "TUESDAY") result.add("Tuesday");
    else if (t === "W" || t === "WED" || t === "WEDNESDAY") result.add("Wednesday");
    else if (
      t === "TH" ||
      t === "THU" ||
      t === "THUR" ||
      t === "THURS" ||
      t === "THURSDAY" ||
      t === "H" ||
      t === "R"
    )
      result.add("Thursday");
    else if (t === "F" || t === "FRI" || t === "FRIDAY") result.add("Friday");
    else if (t === "S" || t === "SA" || t === "SAT" || t === "SATURDAY") result.add("Saturday");
    else if (t === "SU" || t === "SUN" || t === "SUNDAY") result.add("Sunday");
    else if (t === "DAILY" || t === "D" || t === "MTWTHF") {
      result.add("Monday");
      result.add("Tuesday");
      result.add("Wednesday");
      result.add("Thursday");
      result.add("Friday");
    } else if (t === "MWF") {
      result.add("Monday");
      result.add("Wednesday");
      result.add("Friday");
    } else if (t === "TTH" || t === "T-TH" || t === "T/TH" || t === "TT") {
      result.add("Tuesday");
      result.add("Thursday");
    } else if (t === "MW" || t === "M-W" || t === "M/W") {
      result.add("Monday");
      result.add("Wednesday");
    } else if (t === "TF" || t === "T-F") {
      result.add("Tuesday");
      result.add("Friday");
    } else if (t === "WS" || t === "W-S") {
      result.add("Wednesday");
      result.add("Saturday");
    } else if (t === "FS" || t === "F-S") {
      result.add("Friday");
      result.add("Saturday");
    } else if (t === "MTH" || t === "M-TH") {
      result.add("Monday");
      result.add("Thursday");
    } else {
      if (t.includes("MWF")) {
        result.add("Monday");
        result.add("Wednesday");
        result.add("Friday");
      } else if (t.includes("TTH")) {
        result.add("Tuesday");
        result.add("Thursday");
      } else {
        let i = 0;
        while (i < t.length) {
          if (t.substring(i, i + 2) === "TH") {
            result.add("Thursday");
            i += 2;
          } else if (t.substring(i, i + 2) === "SA") {
            result.add("Saturday");
            i += 2;
          } else if (t.substring(i, i + 2) === "SU") {
            result.add("Sunday");
            i += 2;
          } else {
            const char = t[i];
            if (char === "M") result.add("Monday");
            else if (char === "T") result.add("Tuesday");
            else if (char === "W") result.add("Wednesday");
            else if (char === "H" || char === "R") result.add("Thursday");
            else if (char === "F") result.add("Friday");
            else if (char === "S") result.add("Saturday");
            i++;
          }
        }
      }
    }
  };

  if (Array.isArray(rawDays)) {
    rawDays.forEach((d) => {
      if (typeof d === "string") parseDayToken(d);
    });
  } else if (typeof rawDays === "string") {
    const tokens = rawDays.split(/[,/\s]+/);
    tokens.forEach((tok) => parseDayToken(tok));
    if (result.size === 0) parseDayToken(rawDays);
  }

  if (result.size === 0) {
    const upperTitle = courseTitle.toUpperCase();
    if (upperTitle.includes("NSTP") || upperTitle.includes("ROTC") || upperTitle.includes("CWTS")) {
      return ["Saturday"];
    }
    if (isUnscheduledToken(courseTitle)) {
      return [];
    }
    return ["Monday", "Wednesday"];
  }

  const order: DayOfWeek[] = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  return order.filter((d) => result.has(d));
}

export function normalizeTimeStr(timeRaw: any, isEnd: boolean = false): string {
  if (!timeRaw || typeof timeRaw !== "string") return isEnd ? "10:00" : "08:30";
  if (isUnscheduledToken(timeRaw)) return "TBA";

  let t = timeRaw.trim().toUpperCase();

  if (t.includes(" - ") || t.includes(" TO ") || (t.includes("-") && !t.startsWith("-"))) {
    const rangeParts = t.split(/\s*-\s*|\s+TO\s+/i);
    if (rangeParts.length >= 2) {
      t = isEnd ? rangeParts[1].trim() : rangeParts[0].trim();
    }
  }

  const isPM = t.includes("P") || t.includes("PM");
  const isAM = t.includes("A") || t.includes("AM");
  t = t.replace(/[^\d:]/g, "");

  let h = 0;
  let m = 0;
  if (t.includes(":")) {
    const parts = t.split(":");
    h = parseInt(parts[0], 10) || 0;
    m = parseInt(parts[1], 10) || 0;
  } else if (t.length === 3 || t.length === 4) {
    h = parseInt(t.slice(0, -2), 10) || 0;
    m = parseInt(t.slice(-2), 10) || 0;
  } else {
    h = parseInt(t, 10) || 0;
    m = 0;
  }

  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;

  if (!isPM && !isAM && h >= 1 && h <= 6) {
    h += 12;
  }

  if (h < 0 || h > 23 || m < 0 || m > 59) {
    return isEnd ? "10:00" : "08:30";
  }
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function parseGeminiJson(raw: string): any {
  if (!raw) return { courses: [] };
  let text = String(raw).trim();

  // 1. Direct parse
  try {
    const res = JSON.parse(text);
    return Array.isArray(res) ? { courses: res } : res;
  } catch {}

  // 2. Extract code block if markdown present
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      const res = JSON.parse(codeBlockMatch[1].trim());
      return Array.isArray(res) ? { courses: res } : res;
    } catch {
      text = codeBlockMatch[1].trim();
    }
  }

  // 3. Clean comments, trailing commas
  let cleaned = text
    .replace(/\/\/[^\n\r]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/,\s*([\}\]])/g, "$1")
    .replace(/,\s*$/, "");

  cleaned = cleaned.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (match) => {
    return match.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
  });

  try {
    const res = JSON.parse(cleaned);
    return Array.isArray(res) ? { courses: res } : res;
  } catch {}

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const slice = cleaned.substring(firstBrace, lastBrace + 1);
    try {
      const res = JSON.parse(slice);
      return Array.isArray(res) ? { courses: res } : res;
    } catch {}
    try {
      const res = JSON.parse(slice.replace(/,\s*([\}\]])/g, "$1"));
      return Array.isArray(res) ? { courses: res } : res;
    } catch {}
  }

  const firstBracket = cleaned.indexOf("[");
  const lastBracket = cleaned.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    const slice = cleaned.substring(firstBracket, lastBracket + 1);
    try {
      const arr = JSON.parse(slice);
      return { courses: arr };
    } catch {}
  }

  // Fallback regex course extractor
  const courses: any[] = [];
  const courseRegex = /\{[^{}]*?"(?:code|title|subject)"\s*:\s*"[^"]+?"[^{}]*?\}/g;
  let match;
  while ((match = courseRegex.exec(raw)) !== null) {
    try {
      const chunk = match[0].replace(/,\s*([\}\]])/g, "$1");
      const item = JSON.parse(chunk);
      if (item.code || item.title || item.subject) {
        courses.push(item);
      }
    } catch {}
  }

  return { courses };
}

export const COR_SYSTEM_INSTRUCTION = `You are a world-class academic registrar and document vision AI specializing in accurately reading class schedules, Certificates of Registration (COR), Enrollment Assessment Forms (EAF), student portal screenshots, and university timetables.

YOUR NUMBER ONE DIRECTIVE: EXHAUSTIVE AND COMPLETE EXTRACTION. ZERO ENROLLED COURSES MUST BE MISSED.

1. CRITICAL EXTRACTION RULES:
   - Scan EVERY row of the course/subject table from the very top header to the absolute bottom row of the document.
   - Do NOT skip any subject, no matter where it appears.
   - Extract ALL Physical Education / PATHFIT courses (PATHFIT 1-4, PE 1-4).
   - Extract ALL National Service / ROTC / CWTS courses (often Saturday).
   - Extract ALL General Education, Philosophy, Theology, and Elective courses.
   - Extract ALL Practicum, Thesis, Capstone, Fieldwork, and Seminar courses.
   - For subjects with Online, Asynchronous, TBA, or blank room/time columns: extract them with their real title/code and set startTime: "TBA", endTime: "TBA", room: "Online / Arranged", and days: [].

2. COLOR EXTRACTION:
   - If the schedule table or subjects are visually color-coded (e.g. blue cells, purple headers, green lab indicators), extract that color as "colorTag" (e.g., 'indigo', 'emerald', 'cyan', 'violet', 'amber', 'rose', 'teal', 'blue', 'purple', 'green', 'orange').
   - If no distinct color is present in the document, provide a harmonious color tag.

3. MULTI-ROW / LECTURE & LABORATORY SPLIT COURSES:
   - If a course has both Lecture and Laboratory rows, extract BOTH as distinct items with proper types.

4. DAY & TIME FORMATS:
   - Normalize days to standard full names: "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday".
   - Times in 24-hour HH:MM (e.g., "08:30", "13:00", "17:30"). If TBA, set "TBA". Never invent false meeting times.
   - If room or instructor cannot be identified with certainty, set to null or "Room TBA" rather than guessing.`;

export async function extractScheduleFromDocument(params: {
  base64Data: string;
  mimeType: string;
  filename?: string;
}) {
  const { base64Data, mimeType: rawMime, filename } = params;

  if (!base64Data) {
    throw new Error("Missing document or image data in request");
  }

  const mimeType = normalizeMimeType(rawMime, filename);
  const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, "").trim();

  const ai = getGenAI();

  const promptText = `Please perform an exhaustive extraction of this Certificate of Registration / Class Schedule document (${filename || "schedule file"}).
Extract EVERY SINGLE enrolled course, laboratory, PE, NSTP, and lecture row. Do NOT skip or omit any subject.
If the schedule uses color codes for courses, extract the course color in colorTag.
Return structured JSON matching the schema.`;

  const inlineData = {
    mimeType,
    data: cleanBase64,
  };

  const requestPayload = {
    contents: {
      parts: [{ inlineData }, { text: promptText }],
    },
    config: {
      systemInstruction: COR_SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      temperature: 0.1,
      maxOutputTokens: 4096,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          studentName: { type: Type.STRING },
          studentId: { type: Type.STRING },
          program: { type: Type.STRING },
          university: { type: Type.STRING },
          academicYear: { type: Type.STRING },
          semester: { type: Type.STRING },
          totalUnits: { type: Type.NUMBER },
          courses: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                code: { type: Type.STRING },
                title: { type: Type.STRING },
                section: { type: Type.STRING },
                type: {
                  type: Type.STRING,
                  description: "'Lecture', 'Laboratory', 'Seminar', or 'Studio'",
                },
                units: { type: Type.NUMBER },
                room: {
                  type: Type.STRING,
                  description: "Room assigned or laboratory location, or null if unlisted",
                },
                instructor: { type: Type.STRING },
                days: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Full day names e.g. Monday, Wednesday",
                },
                startTime: {
                  type: Type.STRING,
                  description: "24-hour format HH:MM (e.g. 08:30) or 'TBA'",
                },
                endTime: {
                  type: Type.STRING,
                  description: "24-hour format HH:MM (e.g. 10:00) or 'TBA'",
                },
                colorTag: {
                  type: Type.STRING,
                  description: "Color name e.g. indigo, emerald, cyan, violet, amber, rose, teal",
                },
              },
              required: ["code", "title"],
            },
          },
        },
        required: ["courses"],
      },
    },
  };

  const candidateModels = ["gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.8-flash"];
  let response: any = null;
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      response = await ai.models.generateContent({
        ...requestPayload,
        model,
      });

      if (response && response.text && response.text.trim().length > 0) {
        break;
      }
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || "";
      const isTransient =
        err?.status === 503 ||
        err?.status === 429 ||
        errMsg.includes("503") ||
        errMsg.includes("429") ||
        errMsg.includes("UNAVAILABLE") ||
        errMsg.includes("high demand") ||
        errMsg.includes("overloaded");

      if (isTransient) {
        try {
          await new Promise((r) => setTimeout(r, 600));
          response = await ai.models.generateContent({
            ...requestPayload,
            model,
          });
          if (response && response.text && response.text.trim().length > 0) {
            break;
          }
        } catch (retryErr: any) {
          lastError = retryErr || lastError;
        }
      }
    }
  }

  // Schema-less fallback if necessary
  if (!response || !response.text) {
    try {
      response = await ai.models.generateContent({
        contents: {
          parts: [
            { inlineData },
            {
              text: `${promptText}\n\nReturn a valid JSON object: {"studentName":"","program":"","semester":"","academicYear":"","courses":[{"code":"","title":"","type":"Lecture","room":"","instructor":"","days":["Monday"],"startTime":"08:30","endTime":"10:00","colorTag":"indigo"}]}`,
            },
          ],
        },
        config: {
          systemInstruction: COR_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          temperature: 0.1,
          maxOutputTokens: 4096,
        },
        model: "gemini-3.1-flash-lite",
      });
    } catch (fallbackErr: any) {
      lastError = fallbackErr || lastError;
    }
  }

  if (!response || !response.text) {
    throw lastError || new Error("Failed to extract schedule from document.");
  }

  const parsed = parseGeminiJson(response.text);

  const colorPalette = ["indigo", "emerald", "cyan", "violet", "amber", "rose", "teal", "slate"];
  let rawCourses: any[] = [];

  if (Array.isArray(parsed)) {
    rawCourses = parsed;
  } else if (Array.isArray(parsed?.courses)) {
    rawCourses = parsed.courses;
  } else if (Array.isArray(parsed?.schedule)) {
    rawCourses = parsed.schedule;
  } else if (Array.isArray(parsed?.classes)) {
    rawCourses = parsed.classes;
  } else if (Array.isArray(parsed?.subjects)) {
    rawCourses = parsed.subjects;
  } else if (parsed && typeof parsed === "object") {
    for (const val of Object.values(parsed)) {
      if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object") {
        rawCourses = val;
        break;
      }
    }
  }

  if (rawCourses.length === 0) {
    throw new Error(
      "No enrolled courses or subjects could be detected in this document. Please ensure the upload is clear and readable."
    );
  }

  const courses = rawCourses.map((c: any, idx: number) => {
    const code = c.code || c.subjectCode || `SUBJ ${idx + 1}`;
    const title = c.title || c.subject || code;
    const isLab = /lab/i.test(title) || /lab/i.test(c.room || "") || c.type === "Laboratory";
    const type = c.type || (isLab ? "Laboratory" : "Lecture");
    const room =
      c.room && String(c.room).trim() && !isUnscheduledToken(c.room)
        ? String(c.room).trim()
        : isLab
        ? "Lab Room TBA"
        : "Room TBA";
    const days = normalizeCourseDays(c.days || c.day, title || code);
    const startTime = normalizeTimeStr(c.startTime, false);
    const endTime = normalizeTimeStr(c.endTime, true);

    // Map extracted colors or use palette
    let colorTag = c.colorTag || colorPalette[idx % colorPalette.length];
    if (colorTag === "blue") colorTag = "indigo";
    if (colorTag === "green") colorTag = "emerald";
    if (colorTag === "purple") colorTag = "violet";
    if (colorTag === "orange") colorTag = "amber";
    if (colorTag === "red") colorTag = "rose";

    return {
      id: `course-${Date.now()}-${idx}`,
      code,
      title,
      section: c.section || "",
      type,
      units: typeof c.units === "number" ? c.units : 3,
      room,
      instructor: c.instructor || null,
      days,
      startTime,
      endTime,
      colorTag,
    };
  });

  return {
    studentName: parsed.studentName || null,
    studentId: parsed.studentId || null,
    program: parsed.program || null,
    university: parsed.university || null,
    academicYear: parsed.academicYear || null,
    semester: parsed.semester || null,
    totalUnits: parsed.totalUnits || courses.reduce((s: number, c: any) => s + (c.units || 0), 0),
    courses,
    schedule: courses, // also include schedule key for strict compatibility
  };
}

export async function extractScheduleFromText(text: string) {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    throw new Error("Please provide schedule text copied from your school website or portal.");
  }

  const ai = getGenAI();

  const promptText = `Extract all enrolled courses and timetable information from this schedule provided by a school website/portal:\n\n${text.slice(0, 12000)}\n\nReturn structured JSON matching the schema.`;

  const requestPayload = {
    contents: promptText,
    config: {
      systemInstruction: COR_SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      temperature: 0.1,
      maxOutputTokens: 4096,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          studentName: { type: Type.STRING },
          studentId: { type: Type.STRING },
          program: { type: Type.STRING },
          university: { type: Type.STRING },
          academicYear: { type: Type.STRING },
          semester: { type: Type.STRING },
          totalUnits: { type: Type.NUMBER },
          courses: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                code: { type: Type.STRING },
                title: { type: Type.STRING },
                section: { type: Type.STRING },
                type: { type: Type.STRING },
                units: { type: Type.NUMBER },
                room: { type: Type.STRING },
                instructor: { type: Type.STRING },
                days: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                startTime: { type: Type.STRING },
                endTime: { type: Type.STRING },
                colorTag: { type: Type.STRING },
              },
              required: ["code", "title"],
            },
          },
        },
        required: ["courses"],
      },
    },
  };

  const candidateModels = ["gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.8-flash"];
  let response: any = null;
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      response = await ai.models.generateContent({
        ...requestPayload,
        model,
      });

      if (response && response.text && response.text.trim().length > 0) {
        break;
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  if (!response || !response.text) {
    throw lastError || new Error("Failed to extract schedule from text.");
  }

  const parsed = parseGeminiJson(response.text);
  const colorPalette = ["indigo", "emerald", "cyan", "violet", "amber", "rose", "teal", "slate"];

  let rawCourses: any[] = [];
  if (Array.isArray(parsed)) {
    rawCourses = parsed;
  } else if (Array.isArray(parsed?.courses)) {
    rawCourses = parsed.courses;
  } else if (Array.isArray(parsed?.schedule)) {
    rawCourses = parsed.schedule;
  } else if (Array.isArray(parsed?.classes)) {
    rawCourses = parsed.classes;
  }

  if (rawCourses.length === 0) {
    throw new Error("No enrolled courses were detected in the provided text.");
  }

  const courses = rawCourses.map((c: any, idx: number) => {
    const code = c.code || `SUBJ ${idx + 1}`;
    const title = c.title || code;
    const isLab = /lab/i.test(title) || /lab/i.test(c.room || "") || c.type === "Laboratory";
    const type = c.type || (isLab ? "Laboratory" : "Lecture");
    const room = c.room && c.room.trim() ? c.room.trim() : isLab ? "Lab Room TBA" : "Room TBA";
    const days = normalizeCourseDays(c.days, title || code);
    const startTime = normalizeTimeStr(c.startTime, false);
    const endTime = normalizeTimeStr(c.endTime, true);

    let colorTag = c.colorTag || colorPalette[idx % colorPalette.length];
    if (colorTag === "blue") colorTag = "indigo";
    if (colorTag === "green") colorTag = "emerald";
    if (colorTag === "purple") colorTag = "violet";
    if (colorTag === "orange") colorTag = "amber";

    return {
      id: `course-${Date.now()}-${idx}`,
      code,
      title,
      section: c.section || "",
      type,
      units: typeof c.units === "number" ? c.units : 3,
      room,
      instructor: c.instructor || null,
      days,
      startTime,
      endTime,
      colorTag,
    };
  });

  return {
    studentName: parsed.studentName || null,
    program: parsed.program || null,
    semester: parsed.semester || null,
    academicYear: parsed.academicYear || null,
    courses,
    schedule: courses,
  };
}
