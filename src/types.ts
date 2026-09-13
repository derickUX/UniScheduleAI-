export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export type CourseType = 'Lecture' | 'Laboratory' | 'Seminar' | 'Studio' | 'Other';

export interface CourseSchedule {
  id: string;
  code: string;
  title: string;
  section?: string;
  type: CourseType;
  units?: number;
  room: string; // Room assigned or laboratory location
  instructor?: string;
  days: DayOfWeek[];
  startTime: string; // "08:30" 24-hr format
  endTime: string;   // "10:00" 24-hr format
  colorTag: string;  // e.g. "indigo", "emerald", "amber", "rose", "cyan", "violet"
}

export interface ParsedCORData {
  studentName?: string;
  studentId?: string;
  program?: string;
  university?: string;
  academicYear?: string;
  semester?: string;
  totalUnits?: number;
  courses: CourseSchedule[];
}

export type AspectRatio =
  | 'android-2400' // 1080 x 2400 (20:9 Modern Android - Recommended)
  | 'android-2340' // 1080 x 2340 (19.5:9 Flagship Android)
  | 'iphone-2532'  // 1170 x 2532 (19.5:9 iOS Super Retina)
  | '9:16'         // 1080 x 1920 (Classic 16:9 Mobile)
  | '16:9'         // 1920 x 1080 (Desktop / Laptop)
  | '4:3'          // 1600 x 1200 (Tablet)
  | '1:1'          // 1200 x 1200 (Square / Widget)
  | 'custom';      // User-defined resolution

export type WallpaperThemeId =
  | 'minimal-dark'
  | 'paper-editorial'
  | 'tokyo-cyber'
  | 'nordic-forest'
  | 'monochrome-bold'
  | 'sunset-warmth'
  | 'deep-ocean';

export interface WallpaperTheme {
  id: WallpaperThemeId;
  name: string;
  subtitle: string;
  bg: string;
  bgSecondary: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentBadge: string;
  accentBadgeText: string;
  gridLine: string;
  isDark: boolean;
}

export interface WallpaperConfig {
  aspectRatio: AspectRatio;
  customWidth?: number;
  customHeight?: number;
  themeId: WallpaperThemeId;
  phoneSafeZone: boolean; // reserves top space for phone lockscreen clock
  showAstranovaLogo?: boolean; // Show Astranova Philippines watermark
  showRoom: boolean;
  showInstructor: boolean;
  showCourseCode: boolean;
  showUnits: boolean;
  showDayHeaders: boolean;
  use24Hour: boolean;
  title: string;
  subtitle: string;
  studentInfo: boolean;
  activeDays: DayOfWeek[];
  fontScale?: 'normal' | 'large' | 'xlarge';
  layoutDensity?: 'comfortable' | 'compact';
}

export interface CalendarSyncOptions {
  termStartDate: string; // YYYY-MM-DD
  termEndDate: string;   // YYYY-MM-DD
  calendarId: string;    // 'primary'
  reminderMinutes: number; // 15
}
