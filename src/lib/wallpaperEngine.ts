import {
  CourseSchedule,
  WallpaperConfig,
  WallpaperTheme,
  WallpaperThemeId,
  DayOfWeek,
} from '../types';

export const WALLPAPER_THEMES: Record<WallpaperThemeId, WallpaperTheme> = {
  'minimal-dark': {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    subtitle: 'Matte obsidian with subtle borders & clean typography',
    bg: '#0B0F17',
    bgSecondary: '#111827',
    cardBg: '#151D2C',
    cardBorder: 'rgba(255, 255, 255, 0.12)',
    textPrimary: '#FFFFFF',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    accent: '#6366F1',
    accentBadge: 'rgba(99, 102, 241, 0.22)',
    accentBadgeText: '#A5B4FC',
    gridLine: 'rgba(255, 255, 255, 0.04)',
    isDark: true,
  },
  'paper-editorial': {
    id: 'paper-editorial',
    name: 'Architectural Ivory',
    subtitle: 'Warm minimalist paper with Swiss grid aesthetics',
    bg: '#F8F8F5',
    bgSecondary: '#EEEEEC',
    cardBg: '#FFFFFF',
    cardBorder: 'rgba(0, 0, 0, 0.12)',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',
    accent: '#0F172A',
    accentBadge: 'rgba(15, 23, 42, 0.08)',
    accentBadgeText: '#0F172A',
    gridLine: 'rgba(0, 0, 0, 0.05)',
    isDark: false,
  },
  'tokyo-cyber': {
    id: 'tokyo-cyber',
    name: 'Tokyo Cyber',
    subtitle: 'Deep midnight with electric cyan & violet highlights',
    bg: '#080C14',
    bgSecondary: '#0F172A',
    cardBg: '#0F192C',
    cardBorder: 'rgba(0, 240, 255, 0.30)',
    textPrimary: '#FFFFFF',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    accent: '#00F0FF',
    accentBadge: 'rgba(0, 240, 255, 0.20)',
    accentBadgeText: '#38BDF8',
    gridLine: 'rgba(0, 240, 255, 0.08)',
    isDark: true,
  },
  'nordic-forest': {
    id: 'nordic-forest',
    name: 'Nordic Forest',
    subtitle: 'Muted pine, emerald sage, and calm organic neutrals',
    bg: '#0B1512',
    bgSecondary: '#11221D',
    cardBg: '#152C25',
    cardBorder: 'rgba(52, 211, 153, 0.22)',
    textPrimary: '#FFFFFF',
    textSecondary: '#A7F3D0',
    textMuted: '#6EE7B7',
    accent: '#10B981',
    accentBadge: 'rgba(16, 185, 129, 0.25)',
    accentBadgeText: '#6EE7B7',
    gridLine: 'rgba(52, 211, 153, 0.07)',
    isDark: true,
  },
  'monochrome-bold': {
    id: 'monochrome-bold',
    name: 'Monochrome Grotesk',
    subtitle: 'High-contrast black & white editorial structure',
    bg: '#000000',
    bgSecondary: '#121212',
    cardBg: '#181818',
    cardBorder: '#3F3F46',
    textPrimary: '#FFFFFF',
    textSecondary: '#D4D4D8',
    textMuted: '#A1A1AA',
    accent: '#FFFFFF',
    accentBadge: 'rgba(255, 255, 255, 0.18)',
    accentBadgeText: '#FFFFFF',
    gridLine: 'rgba(255, 255, 255, 0.08)',
    isDark: true,
  },
  'sunset-warmth': {
    id: 'sunset-warmth',
    name: 'Dusk Ember',
    subtitle: 'Deep plum canvas with warm coral & amber accents',
    bg: '#140E1B',
    bgSecondary: '#20162B',
    cardBg: '#2A1D39',
    cardBorder: 'rgba(244, 63, 94, 0.25)',
    textPrimary: '#FFFFFF',
    textSecondary: '#FECDD3',
    textMuted: '#FB7185',
    accent: '#F43F5E',
    accentBadge: 'rgba(244, 63, 94, 0.25)',
    accentBadgeText: '#FDA4AF',
    gridLine: 'rgba(244, 63, 94, 0.07)',
    isDark: true,
  },
  'deep-ocean': {
    id: 'deep-ocean',
    name: 'Deep Oceanic',
    subtitle: 'Subtle marine gradient with luminous ice-blue tags',
    bg: '#081426',
    bgSecondary: '#0C1E38',
    cardBg: '#12294B',
    cardBorder: 'rgba(56, 189, 248, 0.25)',
    textPrimary: '#FFFFFF',
    textSecondary: '#BAE6FD',
    textMuted: '#7DD3FC',
    accent: '#0284C7',
    accentBadge: 'rgba(56, 189, 248, 0.20)',
    accentBadgeText: '#7DD3FC',
    gridLine: 'rgba(56, 189, 248, 0.07)',
    isDark: true,
  },
};

export function getResolutionForAspectRatio(
  ratio: WallpaperConfig['aspectRatio'],
  customWidth?: number,
  customHeight?: number
): {
  width: number;
  height: number;
  isPhone: boolean;
  label: string;
  ratioLabel: string;
} {
  switch (ratio) {
    case 'android-2400':
      return {
        width: 1080,
        height: 2400,
        isPhone: true,
        label: 'Android (1080 × 2400)',
        ratioLabel: '20:9 Modern Android',
      };
    case 'android-2340':
      return {
        width: 1080,
        height: 2340,
        isPhone: true,
        label: 'Android (1080 × 2340)',
        ratioLabel: '19.5:9 Flagship Android',
      };
    case 'iphone-2532':
      return {
        width: 1170,
        height: 2532,
        isPhone: true,
        label: 'iPhone (1170 × 2532)',
        ratioLabel: '19.5:9 iOS Super Retina',
      };
    case '9:16':
      return {
        width: 1080,
        height: 1920,
        isPhone: true,
        label: 'Standard Phone (1080 × 1920)',
        ratioLabel: '9:16 Classic Phone',
      };
    case '16:9':
      return {
        width: 1920,
        height: 1080,
        isPhone: false,
        label: 'Desktop Full HD (1920 × 1080)',
        ratioLabel: '16:9 Desktop / Laptop',
      };
    case '4:3':
      return {
        width: 1600,
        height: 1200,
        isPhone: false,
        label: 'Tablet (1600 × 1200)',
        ratioLabel: '4:3 Tablet / iPad',
      };
    case 'custom':
      const w = customWidth && customWidth >= 480 ? customWidth : 1080;
      const h = customHeight && customHeight >= 480 ? customHeight : 2400;
      return {
        width: w,
        height: h,
        isPhone: h > w,
        label: `Custom (${w} × ${h})`,
        ratioLabel: `${w > h ? 'Horizontal' : 'Vertical'} Custom Size`,
      };
    default:
      return {
        width: 1080,
        height: 2400,
        isPhone: true,
        label: 'Android (1080 × 2400)',
        ratioLabel: '20:9 Modern Android',
      };
  }
}

function formatDisplayTime(time24: string, use24Hour: boolean): string {
  if (!time24) return '';
  if (use24Hour) return time24;
  const parts = time24.split(':');
  if (parts.length < 2) return time24;
  let h = parseInt(parts[0], 10);
  const m = parts[1];
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h.toString().padStart(2, '0')}:${m} ${ampm}`;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  if (w <= 0 || h <= 0) return;
  radius = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// Draw Astranova Philippines Interlocking Star Logo on Canvas with scalable vector precision
export function drawAstranovaCanvasLogo(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  scale: number = 0.18
) {
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(scale, scale);

  // Purple ring gradient (vibrant violet-purple with rich depth)
  const purpleGrad = ctx.createLinearGradient(-120, -140, 120, 150);
  purpleGrad.addColorStop(0, '#A855F7');
  purpleGrad.addColorStop(0.35, '#9333EA');
  purpleGrad.addColorStop(0.7, '#7E22CE');
  purpleGrad.addColorStop(1, '#6B21A8');

  // White ring gradient (bright crisp white with gentle lighting)
  const whiteGrad = ctx.createLinearGradient(-100, 120, 140, -40);
  whiteGrad.addColorStop(0, '#F8FAFC');
  whiteGrad.addColorStop(0.5, '#FFFFFF');
  whiteGrad.addColorStop(1, '#E2E8F0');

  ctx.lineWidth = 36;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 1. LAYER 1: Purple 3-Lobe Star Loop (Top, Bottom-Right, Top-Left)
  ctx.strokeStyle = purpleGrad;
  ctx.beginPath();
  ctx.moveTo(0, -155); // Top Apex
  ctx.bezierCurveTo(29, -155, 48, -123, 44, -89);
  ctx.bezierCurveTo(38, -39, 52, -6, 82, 23);
  ctx.bezierCurveTo(112, 53, 146, 83, 124, 117);
  ctx.bezierCurveTo(104, 149, 68, 151, 36, 125);
  ctx.bezierCurveTo(0, 97, -32, 99, -68, 125);
  ctx.bezierCurveTo(-100, 151, -136, 149, -156, 117);
  ctx.bezierCurveTo(-178, 83, -144, 53, -114, 23);
  ctx.bezierCurveTo(-84, -6, -70, -39, -76, -89);
  ctx.bezierCurveTo(-80, -123, -61, -155, -32, -155);
  ctx.closePath();
  ctx.stroke();

  // 2. LAYER 2: White 2-Lobe Oblong Loop (Top-Right, Bottom-Left) with shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 4;
  ctx.strokeStyle = whiteGrad;
  ctx.beginPath();
  ctx.moveTo(152, -42); // Right Apex
  ctx.bezierCurveTo(178, -18, 162, 16, 126, 40);
  ctx.bezierCurveTo(78, 72, 28, 98, -36, 120);
  ctx.bezierCurveTo(-80, 136, -116, 132, -130, 108);
  ctx.bezierCurveTo(-144, 82, -128, 50, -92, 26);
  ctx.bezierCurveTo(-44, -6, 16, -32, 84, -52);
  ctx.bezierCurveTo(122, -64, 140, -56, 152, -42);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();

  // 3. LAYER 3: Interlocking Overlays (Purple crossings over White)
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 3;
  ctx.strokeStyle = purpleGrad;

  // Top-Right strand
  ctx.beginPath();
  ctx.moveTo(32, -116);
  ctx.bezierCurveTo(38, -71, 52, -26, 82, 14);
  ctx.stroke();

  // Bottom-Left strand
  ctx.beginPath();
  ctx.moveTo(-131, 92);
  ctx.bezierCurveTo(-114, 112, -86, 126, -51, 116);
  ctx.bezierCurveTo(-26, 108, 0, 96, 29, 102);
  ctx.stroke();
  ctx.restore();

  // 4. LAYER 4: Interlocking Overlays (White crossing over Purple at Mid-Left)
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 3;
  ctx.strokeStyle = whiteGrad;
  ctx.beginPath();
  ctx.moveTo(-104, 32);
  ctx.bezierCurveTo(-68, 8, -22, -12, 29, -26);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

export function renderWallpaper(
  canvas: HTMLCanvasElement,
  courses: CourseSchedule[],
  config: WallpaperConfig,
  studentMetadata?: {
    studentName?: string;
    program?: string;
    semester?: string;
    academicYear?: string;
  }
) {
  const { width, height, isPhone } = getResolutionForAspectRatio(
    config.aspectRatio,
    config.customWidth,
    config.customHeight
  );

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const theme = WALLPAPER_THEMES[config.themeId] || WALLPAPER_THEMES['minimal-dark'];

  // Base background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, theme.bg);
  bgGrad.addColorStop(1, theme.bgSecondary);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle architectural grid background
  ctx.strokeStyle = theme.gridLine;
  ctx.lineWidth = 1;
  const gridStep = isPhone ? 80 : 60;
  for (let x = 0; x < width; x += gridStep) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridStep) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Filter courses by active days; ensure all days with enrolled classes (including Saturday & Sunday) are included
  const configuredDays = config.activeDays && config.activeDays.length > 0
    ? [...config.activeDays]
    : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Automatically include any day that has scheduled courses so subjects like NSTP, PE, or weekend labs are never omitted
  courses.forEach((c) => {
    c.days?.forEach((d) => {
      if (d && !configuredDays.includes(d)) {
        configuredDays.push(d);
      }
    });
  });

  const dayOrder: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const activeDays = dayOrder.filter((d) => configuredDays.includes(d));

  if (isPhone) {
    renderPhoneWallpaper(ctx, width, height, courses, config, theme, activeDays, studentMetadata);
  } else {
    renderDesktopWallpaper(ctx, width, height, courses, config, theme, activeDays, studentMetadata);
  }
}

function renderPhoneWallpaper(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  courses: CourseSchedule[],
  config: WallpaperConfig,
  theme: WallpaperTheme,
  activeDays: DayOfWeek[],
  studentMetadata?: {
    studentName?: string;
    program?: string;
    semester?: string;
    academicYear?: string;
  }
) {
  // Proportional scale factor based on 1080px base mobile canvas width
  const scale = width / 1080;
  const fontMult = config.fontScale === 'xlarge' ? 1.18 : config.fontScale === 'normal' ? 0.95 : 1.08;

  // Margin math
  const marginX = Math.round(56 * scale);
  const cardWidth = width - marginX * 2;

  // Top Safe Zone: calibrated to clear Android lockscreen clock & punch-hole without leaving an awkward blank desert
  let cursorY = config.phoneSafeZone ? Math.round(height * 0.125) : Math.round(height * 0.045);

  // 1. TOP HEADER SECTION
  // CRITICAL: Set explicit 'top' text baseline so coordinates represent the exact top of the font box.
  // This completely eliminates any vertical overlap between Subtitle, Title, and Metadata!
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';

  // Eyebrow Tag / Subtitle / Semester indicator (Rendered inside an elegant high-contrast academic capsule pill)
  const categoryLabel = (config.subtitle || studentMetadata?.semester || 'ACADEMIC TIMETABLE').toUpperCase();
  const subtitleFontSize = Math.round(20 * scale * fontMult);
  ctx.font = `700 ${subtitleFontSize}px sans-serif`;
  ctx.letterSpacing = '1.2px';
  const tagTextWidth = ctx.measureText(categoryLabel).width;
  const tagPadX = Math.round(14 * scale);
  const tagPadY = Math.round(7 * scale);
  const tagHeight = subtitleFontSize + tagPadY * 2;

  // Capsule background for the Subtitle / Semester so it is distinct from the title
  ctx.fillStyle = theme.accentBadge;
  roundRect(ctx, marginX, cursorY, tagTextWidth + tagPadX * 2, tagHeight, Math.round(8 * scale));
  ctx.fill();

  ctx.strokeStyle = theme.cardBorder;
  ctx.lineWidth = 1;
  roundRect(ctx, marginX, cursorY, tagTextWidth + tagPadX * 2, tagHeight, Math.round(8 * scale));
  ctx.stroke();

  ctx.fillStyle = theme.accentBadgeText;
  ctx.fillText(categoryLabel, marginX + tagPadX, cursorY + tagPadY);
  ctx.letterSpacing = '0px';

  // Advance cursor past the Subtitle Capsule with guaranteed generous vertical separation
  cursorY += tagHeight + Math.round(20 * scale);

  // Main Schedule Title (Big, bold, high contrast - strictly placed below the subtitle pill with zero collision)
  const titleFontSize = Math.round(48 * scale * fontMult);
  ctx.fillStyle = theme.textPrimary;
  ctx.font = `800 ${titleFontSize}px sans-serif`;
  const scheduleTitle = config.title || 'CLASS SCHEDULE';
  ctx.fillText(scheduleTitle, marginX, cursorY);
  cursorY += titleFontSize + Math.round(16 * scale);

  // Student Program / Academic Year line if available
  if (studentMetadata?.program || studentMetadata?.studentName) {
    const metaFontSize = Math.round(22 * scale * fontMult);
    ctx.fillStyle = theme.textSecondary;
    ctx.font = `600 ${metaFontSize}px sans-serif`;
    const metaParts = [
      studentMetadata.studentName,
      studentMetadata.program,
      studentMetadata.academicYear,
    ].filter(Boolean);
    ctx.fillText(metaParts.join('  •  '), marginX, cursorY);
    cursorY += metaFontSize + Math.round(18 * scale);
  }

  // Elegant subtle divider line
  ctx.strokeStyle = theme.cardBorder;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(marginX, cursorY);
  ctx.lineTo(width - marginX, cursorY);
  ctx.stroke();
  cursorY += Math.round(26 * scale);

  // 2. COURSES & DAYS SECTION
  const bottomMargin = Math.round((config.showAstranovaLogo !== false ? 96 : 64) * scale);
  const daysWithCourses = activeDays.filter((day) =>
    courses.some((c) => c.days.includes(day))
  );

  if (daysWithCourses.length === 0) {
    ctx.fillStyle = theme.textSecondary;
    ctx.font = `600 ${Math.round(28 * scale)}px sans-serif`;
    ctx.fillText('No scheduled classes for selected days.', marginX, cursorY + 60 * scale);
    return;
  }

  const totalClassesCount = daysWithCourses.reduce(
    (acc, day) => acc + courses.filter((c) => c.days.includes(day)).length,
    0
  );

  // Smart Adaptive Card Sizing: Fill available vertical space generously to eliminate awkward empty gaps
  const availableContentH = height - cursorY - bottomMargin;

  let cardHeight: number;
  let cardGap: number;
  let dayGap: number;

  if (totalClassesCount <= 4) {
    cardHeight = Math.round(175 * scale);
    cardGap = Math.round(18 * scale);
    dayGap = Math.round(36 * scale);
  } else if (totalClassesCount <= 7) {
    cardHeight = Math.round(152 * scale);
    cardGap = Math.round(16 * scale);
    dayGap = Math.round(30 * scale);
  } else if (totalClassesCount <= 10) {
    cardHeight = Math.round(132 * scale);
    cardGap = Math.round(13 * scale);
    dayGap = Math.round(25 * scale);
  } else if (totalClassesCount <= 14) {
    cardHeight = Math.round(112 * scale);
    cardGap = Math.round(10 * scale);
    dayGap = Math.round(20 * scale);
  } else {
    // Heavy loads (15+ classes)
    const computedH = (availableContentH - daysWithCourses.length * 48 * scale) / totalClassesCount - 8 * scale;
    cardHeight = Math.max(Math.round(88 * scale), Math.floor(computedH));
    cardGap = Math.round(8 * scale);
    dayGap = Math.round(16 * scale);
  }

  // Iterate over active days
  for (const day of daysWithCourses) {
    const dayClasses = courses
      .filter((c) => c.days.includes(day))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    if (dayClasses.length === 0) continue;

    // Day Section Capsule / Header
    const dayHeaderH = Math.round(44 * scale);
    ctx.fillStyle = theme.cardBg;
    roundRect(ctx, marginX, cursorY, Math.round(220 * scale), dayHeaderH, Math.round(12 * scale));
    ctx.fill();

    ctx.strokeStyle = theme.cardBorder;
    ctx.lineWidth = 1;
    roundRect(ctx, marginX, cursorY, Math.round(220 * scale), dayHeaderH, Math.round(12 * scale));
    ctx.stroke();

    // Accent dot
    ctx.fillStyle = theme.accent;
    ctx.beginPath();
    ctx.arc(marginX + 18 * scale, cursorY + dayHeaderH / 2, 5 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Day Text
    ctx.fillStyle = theme.textPrimary;
    const dayFontSize = Math.round(24 * scale * fontMult);
    ctx.font = `800 ${dayFontSize}px sans-serif`;
    ctx.fillText(day.toUpperCase(), marginX + 32 * scale, cursorY + Math.round((dayHeaderH - dayFontSize) / 2));

    // Number of classes badge (Right side of day header row)
    const countLabel = `${dayClasses.length} ${dayClasses.length === 1 ? 'CLASS' : 'CLASSES'}`;
    const countFontSize = Math.round(19 * scale);
    ctx.fillStyle = theme.textMuted;
    ctx.font = `700 ${countFontSize}px sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillText(countLabel, marginX + cardWidth - 14 * scale, cursorY + Math.round((dayHeaderH - countFontSize) / 2));
    ctx.textAlign = 'left';

    cursorY += dayHeaderH + Math.round(14 * scale);

    // Render classes for this day
    for (const course of dayClasses) {
      if (cursorY + cardHeight > height - bottomMargin - 30 * scale) {
        break; // Prevent clipping
      }

      // Draw Course Card
      ctx.fillStyle = theme.cardBg;
      roundRect(ctx, marginX, cursorY, cardWidth, cardHeight, Math.round(18 * scale));
      ctx.fill();

      ctx.strokeStyle = theme.cardBorder;
      ctx.lineWidth = 1.5;
      roundRect(ctx, marginX, cursorY, cardWidth, cardHeight, Math.round(18 * scale));
      ctx.stroke();

      // Left Accent Color Pillar (vibrant vertical color bar)
      const courseColor = getCourseAccentColor(course.colorTag, theme);
      ctx.fillStyle = courseColor;
      roundRect(
        ctx,
        marginX + 8 * scale,
        cursorY + 12 * scale,
        7 * scale,
        cardHeight - 24 * scale,
        4 * scale
      );
      ctx.fill();

      const innerLeft = marginX + 28 * scale;

      // TOP ROW: Time & Location Badge
      const timeStr = `${formatDisplayTime(course.startTime, config.use24Hour)} – ${formatDisplayTime(
        course.endTime,
        config.use24Hour
      )}`;
      const timeFontSize = Math.round((cardHeight >= 140 ? 25 : cardHeight >= 110 ? 22 : 19) * scale * fontMult);
      ctx.fillStyle = theme.textSecondary;
      ctx.font = `700 ${timeFontSize}px sans-serif`;
      const timeY = cursorY + Math.round((cardHeight >= 140 ? 18 : 14) * scale);
      ctx.fillText(timeStr, innerLeft, timeY);

      // Location / Room Badge (Right Side)
      let badgeWidth = 0;
      if (config.showRoom && course.room) {
        const isLab = course.type === 'Laboratory';
        const badgeLabel = isLab ? `🧪 LAB: ${course.room}` : `📍 ${course.room}`;
        const badgeFontSize = Math.round((cardHeight >= 140 ? 21 : cardHeight >= 110 ? 19 : 17) * scale * fontMult);
        ctx.font = `700 ${badgeFontSize}px sans-serif`;
        badgeWidth = ctx.measureText(badgeLabel).width + Math.round(26 * scale);

        const badgeH = Math.round((cardHeight >= 140 ? 38 : cardHeight >= 110 ? 32 : 28) * scale);
        const badgeX = marginX + cardWidth - badgeWidth - 16 * scale;
        const badgeY = cursorY + Math.round((cardHeight >= 140 ? 12 : 8) * scale);

        ctx.fillStyle = isLab ? theme.accentBadge : 'rgba(255, 255, 255, 0.08)';
        roundRect(ctx, badgeX, badgeY, badgeWidth, badgeH, Math.round(8 * scale));
        ctx.fill();

        ctx.strokeStyle = isLab ? theme.accent : theme.cardBorder;
        ctx.lineWidth = 1;
        roundRect(ctx, badgeX, badgeY, badgeWidth, badgeH, Math.round(8 * scale));
        ctx.stroke();

        ctx.fillStyle = isLab ? theme.accentBadgeText : theme.textPrimary;
        ctx.fillText(badgeLabel, badgeX + 13 * scale, badgeY + Math.round((badgeH - badgeFontSize) / 2));
      }

      // MIDDLE ROW: Course Code & Title (Bold, large font, pure high contrast)
      const titleFontSize = Math.round((cardHeight >= 140 ? 32 : cardHeight >= 110 ? 27 : 23) * scale * fontMult);
      ctx.font = `800 ${titleFontSize}px sans-serif`;
      ctx.fillStyle = theme.textPrimary;

      const headline = config.showCourseCode
        ? `${course.code}  ${course.title}`
        : course.title;
      const maxTitleWidth = cardWidth - (badgeWidth > 0 ? badgeWidth + 40 * scale : 40 * scale);
      const truncatedTitle = truncateText(ctx, headline, maxTitleWidth);

      const titleY = timeY + timeFontSize + Math.round(8 * scale);
      ctx.fillText(truncatedTitle, innerLeft, titleY);

      // BOTTOM ROW: Instructor & Units (Shown if card is comfortable)
      if (cardHeight >= 135 * scale && (config.showInstructor || config.showUnits)) {
        const detailFontSize = Math.round(20 * scale * fontMult);
        ctx.font = `500 ${detailFontSize}px sans-serif`;
        ctx.fillStyle = theme.textMuted;

        const detailsList = [
          config.showInstructor && course.instructor ? `Faculty: ${course.instructor}` : null,
          config.showUnits && course.units ? `${course.units} Units` : null,
          course.type ? course.type : null,
        ].filter(Boolean);

        if (detailsList.length > 0) {
          const detailStr = detailsList.join('  •  ');
          const detailY = titleY + titleFontSize + Math.round(8 * scale);
          ctx.fillText(truncateText(ctx, detailStr, cardWidth - 50 * scale), innerLeft, detailY);
        }
      }

      cursorY += cardHeight + cardGap;
    }

    cursorY += dayGap;
  }

  // 3. FILL EMPTY SPACE / PREVENT AWKWARD LONG GAPS:
  // If there are few courses and a large gap remains at the bottom, render a sleek Academic Overview Widget
  const remainingSpace = height - cursorY - bottomMargin;
  if (remainingSpace >= 240 * scale) {
    const summaryH = Math.min(Math.round(210 * scale), remainingSpace - 30 * scale);
    const summaryY = cursorY + 10 * scale;

    ctx.fillStyle = theme.cardBg;
    roundRect(ctx, marginX, summaryY, cardWidth, summaryH, Math.round(20 * scale));
    ctx.fill();

    ctx.strokeStyle = theme.cardBorder;
    ctx.lineWidth = 1.5;
    roundRect(ctx, marginX, summaryY, cardWidth, summaryH, Math.round(20 * scale));
    ctx.stroke();

    // Summary Header
    ctx.fillStyle = theme.accentBadgeText;
    ctx.font = `800 ${Math.round(20 * scale * fontMult)}px sans-serif`;
    ctx.letterSpacing = '1.2px';
    ctx.fillText('WEEKLY ACADEMIC OVERVIEW', marginX + 28 * scale, summaryY + 24 * scale);
    ctx.letterSpacing = '0px';

    // 3 Metric Blocks
    const totalUnits = courses.reduce((acc, c) => acc + (c.units || 0), 0);
    const colW = (cardWidth - 56 * scale) / 3;

    // Stat 1: Courses
    ctx.fillStyle = theme.textPrimary;
    ctx.font = `800 ${Math.round(36 * scale * fontMult)}px sans-serif`;
    ctx.fillText(courses.length.toString(), marginX + 28 * scale, summaryY + 66 * scale);
    ctx.fillStyle = theme.textMuted;
    ctx.font = `600 ${Math.round(19 * scale)}px sans-serif`;
    ctx.fillText('Enrolled Subjects', marginX + 28 * scale, summaryY + 112 * scale);

    // Stat 2: Units
    ctx.fillStyle = theme.textPrimary;
    ctx.font = `800 ${Math.round(36 * scale * fontMult)}px sans-serif`;
    ctx.fillText(totalUnits.toString(), marginX + 28 * scale + colW, summaryY + 66 * scale);
    ctx.fillStyle = theme.textMuted;
    ctx.font = `600 ${Math.round(19 * scale)}px sans-serif`;
    ctx.fillText('Total Credit Units', marginX + 28 * scale + colW, summaryY + 112 * scale);

    // Stat 3: Active Days
    ctx.fillStyle = theme.textPrimary;
    ctx.font = `800 ${Math.round(36 * scale * fontMult)}px sans-serif`;
    ctx.fillText(daysWithCourses.length.toString(), marginX + 28 * scale + colW * 2, summaryY + 66 * scale);
    ctx.fillStyle = theme.textMuted;
    ctx.font = `600 ${Math.round(19 * scale)}px sans-serif`;
    ctx.fillText('Active Class Days', marginX + 28 * scale + colW * 2, summaryY + 112 * scale);

    // Sub-banner if student info exists
    if (studentMetadata?.studentName && summaryH >= 170 * scale) {
      ctx.fillStyle = theme.textSecondary;
      ctx.font = `600 ${Math.round(20 * scale)}px sans-serif`;
      ctx.fillText(
        `Registered to: ${studentMetadata.studentName} (${studentMetadata.program || 'University Student'})`,
        marginX + 28 * scale,
        summaryY + 155 * scale
      );
    }
  }

  // 4. FOOTER BRANDING: Astranova Philippines + UniSchedule AI (Crisp, proportional, high contrast)
  const footerY = height - Math.round(44 * scale);
  if (config.showAstranovaLogo !== false) {
    // Draw Astranova Interlocking Star Logo centered with high resolution
    const logoX = width / 2 - 190 * scale;
    drawAstranovaCanvasLogo(ctx, logoX, footerY, 0.18 * scale);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = theme.textPrimary;
    ctx.font = `700 ${Math.round(22 * scale * fontMult)}px sans-serif`;
    ctx.letterSpacing = '0.5px';
    ctx.fillText('UniSchedule AI', logoX + 28 * scale, footerY);

    ctx.fillStyle = theme.textMuted;
    ctx.font = `500 ${Math.round(20 * scale * fontMult)}px sans-serif`;
    ctx.fillText('  •  Astranova Philippines', logoX + 176 * scale, footerY);
    ctx.letterSpacing = '0px';
  } else {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = theme.textMuted;
    ctx.font = `600 ${Math.round(22 * scale * fontMult)}px sans-serif`;
    ctx.fillText('UniSchedule AI  •  Automated Class Timetable', width / 2, footerY);
  }
}

function renderDesktopWallpaper(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  courses: CourseSchedule[],
  config: WallpaperConfig,
  theme: WallpaperTheme,
  activeDays: DayOfWeek[],
  studentMetadata?: {
    studentName?: string;
    program?: string;
    semester?: string;
    academicYear?: string;
  }
) {
  const marginX = 80;
  const marginY = 56;

  // Header Bar with explicit 'top' baseline to prevent overlap
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.fillStyle = theme.textPrimary;
  ctx.font = '800 44px sans-serif';
  ctx.fillText(config.title || 'UNIVERSITY CLASS SCHEDULE', marginX, marginY);

  ctx.fillStyle = theme.textSecondary;
  ctx.font = '600 20px sans-serif';
  const metaLine = [
    config.subtitle || studentMetadata?.semester || 'Academic Term',
    studentMetadata?.studentName && `Student: ${studentMetadata.studentName}`,
    studentMetadata?.program,
  ]
    .filter(Boolean)
    .join('   •   ');
  ctx.fillText(metaLine, marginX, marginY + 54);

  // Status Chip (Right)
  ctx.textAlign = 'right';
  ctx.fillStyle = theme.accentBadge;
  const chipWidth = 220;
  const chipX = width - marginX - chipWidth;
  roundRect(ctx, chipX, marginY + 6, chipWidth, 42, 21);
  ctx.fill();
  ctx.fillStyle = theme.accentBadgeText;
  ctx.font = '700 16px sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('ACTIVE SEMESTER', width - marginX - 28, marginY + 27);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // Grid Layout for Days
  const gridTop = marginY + 98;
  const gridBottom = height - marginY - 40;
  const daysCount = activeDays.length || 5;
  const colWidth = (width - marginX * 2 - (daysCount - 1) * 18) / daysCount;

  // Render Day Columns
  activeDays.forEach((day, colIdx) => {
    const colX = marginX + colIdx * (colWidth + 18);

    // Day Header Pill
    ctx.fillStyle = theme.cardBg;
    roundRect(ctx, colX, gridTop, colWidth, 48, 12);
    ctx.fill();
    ctx.strokeStyle = theme.cardBorder;
    ctx.lineWidth = 1.5;
    roundRect(ctx, colX, gridTop, colWidth, 48, 12);
    ctx.stroke();

    ctx.fillStyle = theme.textPrimary;
    ctx.font = '800 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(day.toUpperCase(), colX + colWidth / 2, gridTop + 31);
    ctx.textAlign = 'left';

    // Day Classes
    const dayClasses = courses
      .filter((c) => c.days.includes(day))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    let cardY = gridTop + 62;
    const cardH = 135;
    const gap = 14;

    for (const course of dayClasses) {
      if (cardY + cardH > gridBottom) break;

      // Card Background
      ctx.fillStyle = theme.cardBg;
      roundRect(ctx, colX, cardY, colWidth, cardH, 14);
      ctx.fill();

      ctx.strokeStyle = theme.cardBorder;
      ctx.lineWidth = 1.5;
      roundRect(ctx, colX, cardY, colWidth, cardH, 14);
      ctx.stroke();

      // Top color indicator bar
      const accent = getCourseAccentColor(course.colorTag, theme);
      ctx.fillStyle = accent;
      roundRect(ctx, colX + 10, cardY + 10, colWidth - 20, 4, 2);
      ctx.fill();

      // Time
      const timeString = `${formatDisplayTime(course.startTime, config.use24Hour)} – ${formatDisplayTime(
        course.endTime,
        config.use24Hour
      )}`;
      ctx.fillStyle = theme.textSecondary;
      ctx.font = '700 16px sans-serif';
      ctx.fillText(timeString, colX + 16, cardY + 36);

      // Code + Title
      ctx.fillStyle = theme.textPrimary;
      ctx.font = '800 18px sans-serif';
      const titleStr = truncateText(ctx, `${course.code}: ${course.title}`, colWidth - 32);
      ctx.fillText(titleStr, colX + 16, cardY + 64);

      // Room / Lab location badge
      if (config.showRoom && course.room) {
        const isLab = course.type === 'Laboratory';
        ctx.fillStyle = isLab ? theme.accentBadgeText : theme.textPrimary;
        ctx.font = '700 15px sans-serif';
        const locStr = truncateText(
          ctx,
          isLab ? `🧪 LAB: ${course.room}` : `📍 ${course.room}`,
          colWidth - 32
        );
        ctx.fillText(locStr, colX + 16, cardY + 92);
      }

      // Instructor
      if (config.showInstructor && course.instructor) {
        ctx.fillStyle = theme.textMuted;
        ctx.font = '500 14px sans-serif';
        const instStr = truncateText(ctx, `Prof. ${course.instructor}`, colWidth - 32);
        ctx.fillText(instStr, colX + 16, cardY + 116);
      }

      cardY += cardH + gap;
    }
  });

  // Footer
  if (config.showAstranovaLogo !== false) {
    const footerY = height - 24;
    drawAstranovaCanvasLogo(ctx, width / 2 - 135, footerY, 0.15);
    ctx.textBaseline = 'middle';
    ctx.fillStyle = theme.textMuted;
    ctx.font = '600 16px sans-serif';
    ctx.fillText('UniSchedule AI  •  Astranova Philippines', width / 2 - 110, footerY);
  }
}

function truncateText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 3 && ctx.measureText(truncated + '...').width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + '...';
}

function getCourseAccentColor(colorTag: string, theme: WallpaperTheme): string {
  const map: Record<string, string> = {
    indigo: '#6366F1',
    emerald: '#10B981',
    cyan: '#06B6D4',
    violet: '#8B5CF6',
    amber: '#F59E0B',
    rose: '#F43F5E',
    teal: '#14B8A6',
    slate: '#94A3B8',
  };
  return map[colorTag] || theme.accent;
}

export function downloadWallpaperImage(
  canvas: HTMLCanvasElement,
  aspectRatio: string,
  themeId: string
) {
  const link = document.createElement('a');
  link.download = `UniSchedule_Wallpaper_${canvas.width}x${canvas.height}_${themeId}.png`;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
