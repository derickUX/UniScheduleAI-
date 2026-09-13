# UniScheduleAI - Astranova Philippines 🇵🇭

> **Modern, intelligent class schedule and timetable management system designed for university and college students.**

UniScheduleAI transforms academic Certificates of Registration (COR), schedule assessment forms, and school portal timetables into clean interactive calendars, beautiful smartphone lockscreen wallpapers, and synchronized Google Calendar events.

---

## 🌟 Key Features

- 📑 **Multimodal COR & Timetable Extraction**: Upload PDF COR documents, camera photos, or screenshots of your enrollment forms. Powered by Gemini Multimodal AI for subject codes, section names, time blocks, rooms, and instructor extraction.
- 📋 **School Portal Text Importer**: Directly paste raw course rows, tab-separated tables, or text from student portals.
- 📅 **Responsive Weekly Timetable**: Interactive desktop grid and fluid mobile card switcher with live class status (e.g. *Ongoing*, *Upcoming*, *Break*).
- 📱 **Lockscreen Wallpaper Studio**: Generate crisp custom smartphone wallpapers (1080×2400 / 1170×2532 / 1290×2796) styled with custom dark/light themes, subject accent badges, and lockscreen clocks.
- ⚡ **Google Calendar Export**: Export `.ics` calendar files or sync schedule events directly with Google Calendar via OAuth.
- ✏️ **Full Course Editor**: Manually add, edit, or adjust courses, time slots, days, rooms, units, and custom accent tags.
- 🌓 **Dark & Light Mode Support**: Minimalist interface built with clean neutral typography.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons, Canvas Confetti
- **Backend**: Express.js, TypeScript (`tsx`), esbuild
- **AI / Multimodal**: Google GenAI SDK (`@google/genai`)
- **Build / Tooling**: Vite 6, Vercel Serverless compatibility

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or 20+
- npm, yarn, or pnpm
- Gemini API Key (`GEMINI_API_KEY`)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/derickUX/UniScheduleAI-.git
   cd UniScheduleAI-
   ```

2. **Ensure you are on the `main` branch**:
   ```bash
   git checkout main
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and set your API keys:
   ```bash
   cp .env.example .env
   ```
   Add your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The application will be running at `http://localhost:3000`.

6. **Production Build**:
   ```bash
   npm run build
   npm start
   ```

---

## 📂 Project Structure

```text
├── api/                   # Vercel serverless function entrypoints
├── public/                # Static assets and icons
├── src/
│   ├── components/        # UI components (ScheduleGrid, WallpaperStudio, CORUploader, etc.)
│   ├── data/              # University sample schedules
│   ├── lib/               # Gemini schedule parsers and utilities
│   ├── types.ts           # TypeScript interfaces & types
│   ├── App.tsx            # Main application layout & state
│   └── index.css          # Styling & Tailwind design system
├── server.ts              # Express API server & Vite development middleware
└── package.json           # Dependencies and scripts
```

---

## 📄 License

MIT License. Designed and engineered for students by Astranova.
