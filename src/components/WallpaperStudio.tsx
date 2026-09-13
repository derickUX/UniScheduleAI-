import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Download,
  Smartphone,
  Monitor,
  Tablet,
  Palette,
  Eye,
  Sliders,
  Sparkles,
  MapPin,
  Clock,
  FlaskConical,
  Check,
  Maximize2,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import {
  CourseSchedule,
  WallpaperConfig,
  WallpaperThemeId,
  AspectRatio,
  DayOfWeek,
} from '../types';
import {
  WALLPAPER_THEMES,
  renderWallpaper,
  downloadWallpaperImage,
  getResolutionForAspectRatio,
} from '../lib/wallpaperEngine';
import { AstranovaLogo } from './AstranovaLogo';

interface WallpaperStudioProps {
  courses: CourseSchedule[];
  studentMetadata?: {
    studentName?: string;
    program?: string;
    semester?: string;
    academicYear?: string;
  };
}

const ALL_DAYS: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const WallpaperStudio: React.FC<WallpaperStudioProps> = ({
  courses,
  studentMetadata,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [simulateLockscreen, setSimulateLockscreen] = useState(true);

  // Compute days that have courses enrolled
  const computeInitialDays = (): DayOfWeek[] => {
    const base: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const courseDays = new Set<DayOfWeek>();
    courses.forEach((c) => c.days?.forEach((d) => courseDays.add(d)));
    if (courseDays.has('Saturday')) base.push('Saturday');
    if (courseDays.has('Sunday')) base.push('Sunday');
    return base;
  };

  // Default to 1080x2400 Android (20:9) as requested
  const [config, setConfig] = useState<WallpaperConfig>({
    aspectRatio: 'android-2400',
    customWidth: 1080,
    customHeight: 2400,
    themeId: 'minimal-dark',
    phoneSafeZone: true,
    showAstranovaLogo: true,
    showRoom: true,
    showInstructor: true,
    showCourseCode: true,
    showUnits: true,
    showDayHeaders: true,
    use24Hour: false,
    title: 'CLASS TIMETABLE',
    subtitle: studentMetadata?.semester || 'Academic Schedule',
    studentInfo: true,
    fontScale: 'large',
    activeDays: computeInitialDays(),
  });

  // Sync activeDays whenever courses update so no subjects are ever omitted
  useEffect(() => {
    if (courses && courses.length > 0) {
      setConfig((prev) => {
        const courseDays = new Set<DayOfWeek>();
        courses.forEach((c) => c.days?.forEach((d) => courseDays.add(d)));
        const currentActive = new Set(prev.activeDays || []);
        let changed = false;

        courseDays.forEach((d) => {
          if (!currentActive.has(d)) {
            currentActive.add(d);
            changed = true;
          }
        });

        if (!changed) return prev;

        const dayOrder: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        return {
          ...prev,
          activeDays: dayOrder.filter((d) => currentActive.has(d)),
        };
      });
    }
  }, [courses]);

  // Sync subtitle if student metadata arrives
  useEffect(() => {
    if (studentMetadata?.semester) {
      setConfig((prev) => ({
        ...prev,
        subtitle: studentMetadata.semester || prev.subtitle,
      }));
    }
  }, [studentMetadata?.semester]);

  const activeRes = getResolutionForAspectRatio(
    config.aspectRatio,
    config.customWidth,
    config.customHeight
  );

  // Re-render wallpaper whenever config or courses change
  useEffect(() => {
    if (canvasRef.current) {
      renderWallpaper(canvasRef.current, courses, config, studentMetadata);
    }
  }, [config, courses, studentMetadata]);

  const handleDownload = () => {
    if (canvasRef.current) {
      downloadWallpaperImage(canvasRef.current, config.aspectRatio, config.themeId);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
  };

  const currentTheme = WALLPAPER_THEMES[config.themeId];

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#171A21] border border-[#E8E8E8] dark:border-[#262B35] rounded-2xl p-5 shadow-xs transition-colors">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 mt-0.5">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-semibold text-[#111111] dark:text-white tracking-tight">
                Schedule <span className="font-normal text-indigo-600 dark:text-indigo-400">Wallpaper Studio</span>
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-700/50 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                Fit: {activeRes.width} × {activeRes.height} px
              </span>
            </div>
            <p className="text-xs text-[#6B6B6B] dark:text-[#9CA3AF] mt-1">
              Custom-rendered for phone screens and desktops with crisp layout scaling and zero edge distortion.
            </p>
          </div>
        </div>

        <button
          onClick={handleDownload}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Download Wallpaper ({activeRes.width} × {activeRes.height})</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Canvas Preview with Modern Phone Bezel */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full bg-[#F3F3F1] dark:bg-[#0A0A0C] rounded-2xl p-3 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden border border-[#E8E8E8] dark:border-[#27272A] shadow-xs min-h-[440px] sm:min-h-[560px] transition-colors">
            {/* Resolution Floating Pill */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-2 max-w-[90%] truncate">
              <span className="text-[10px] sm:text-[11px] font-medium bg-white/90 dark:bg-[#18181B]/90 backdrop-blur-md text-[#111111] dark:text-[#A1A1AA] px-2.5 py-1 rounded-lg border border-[#E8E8E8] dark:border-[#27272A] flex items-center gap-1.5 shadow-xs truncate">
                <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                <span className="truncate">{activeRes.label} • {activeRes.ratioLabel}</span>
              </span>
            </div>

            {/* Simulated Device Bezel container */}
            <div
              className={`relative shadow-2xl transition-all duration-300 overflow-hidden bg-black max-w-full ${
                activeRes.isPhone
                  ? 'rounded-[34px] sm:rounded-[42px] border-[5px] sm:border-[7px] border-[#222227] ring-1 ring-white/10 my-8 sm:my-2'
                  : 'w-full max-w-[580px] rounded-xl sm:rounded-2xl border-[3px] sm:border-[5px] border-[#222227] my-8 sm:my-2'
              }`}
              style={{
                aspectRatio: `${activeRes.width} / ${activeRes.height}`,
                width: activeRes.isPhone ? 'clamp(220px, 78vw, 300px)' : 'min(100%, 580px)',
                maxHeight: '740px',
              }}
            >
              {/* Modern Android Camera Punch-Hole */}
              {activeRes.isPhone && (
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#030305] border border-white/15 flex items-center justify-center shadow-inner">
                    <div className="w-1 h-1 rounded-full bg-indigo-950/80" />
                  </div>
                </div>
              )}

              {/* Optional Phone Lockscreen Overlay (Clock + Status Bar) */}
              {activeRes.isPhone && simulateLockscreen && (
                <div className="absolute top-0 left-0 right-0 pt-7 pb-2 px-5 flex flex-col items-center z-20 pointer-events-none select-none text-white drop-shadow-md">
                  {/* Status Bar Icons */}
                  <div className="w-full flex items-center justify-between text-[9px] font-semibold text-white/70 px-1 mb-1">
                    <span>9:41</span>
                    <div className="flex items-center gap-1 text-[8px]">
                      <span>5G</span>
                      <span>●●●</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Android Lockscreen Clock */}
                  <span className="text-[11px] font-medium tracking-wide text-white/80 uppercase mt-0.5">
                    Friday, September 5
                  </span>
                  <span className="text-5xl font-light tracking-tight font-mono mt-0.5 text-white/95 drop-shadow-sm">
                    09:41
                  </span>
                </div>
              )}

              {/* The Actual Rendering Canvas */}
              <canvas
                ref={canvasRef}
                className="w-full h-full block object-contain"
              />
            </div>

            {/* Quick preview toggle for phone modes */}
            {activeRes.isPhone && (
              <div className="mt-4 flex items-center gap-3 text-[#6B6B6B] dark:text-[#9CA3AF] text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none hover:text-[#111111] dark:hover:text-[#A1A1AA] transition-colors">
                  <input
                    type="checkbox"
                    checked={simulateLockscreen}
                    onChange={(e) => setSimulateLockscreen(e.target.checked)}
                    className="rounded border-[#E8E8E8] dark:border-[#27272A] bg-white dark:bg-[#18181B] text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span>Show phone clock & punch-hole overlay</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Customization Controls */}
        <div className="lg:col-span-5 space-y-5">
          {/* Format / Aspect Ratio Selector (Android 1080x2400 & 1080x2340 first) */}
          <div className="bg-white dark:bg-[#171A21] border border-[#E8E8E8] dark:border-[#262B35] rounded-2xl p-5 shadow-xs space-y-3.5 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-[#6B6B6B] dark:text-[#9CA3AF] uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Screen Display Format</span>
              </h3>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">
                {activeRes.width} × {activeRes.height}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Android 1080x2400 Button */}
              <button
                onClick={() => setConfig({ ...config, aspectRatio: 'android-2400' })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                  config.aspectRatio === 'android-2400'
                    ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-[#111111] dark:text-white shadow-xs ring-1 ring-indigo-500/30'
                    : 'border-[#E8E8E8] dark:border-[#27272A] hover:border-gray-300 dark:hover:border-[#3F3F46] bg-white dark:bg-[#18181B] text-[#6B6B6B] dark:text-[#A1A1AA]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111111] dark:text-white">Android 20:9</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/30">
                    Recommended
                  </span>
                </div>
                <span className="text-[11px] block font-mono text-indigo-600 dark:text-indigo-300 mt-1">1080 × 2400 px</span>
                <span className="text-[10px] text-[#6B6B6B] dark:text-[#71717A] block mt-0.5">
                  Xiaomi, POCO, Galaxy A, Pixel
                </span>
              </button>

              {/* Android 1080x2340 Button */}
              <button
                onClick={() => setConfig({ ...config, aspectRatio: 'android-2340' })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                  config.aspectRatio === 'android-2340'
                    ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-[#111111] dark:text-white shadow-xs ring-1 ring-indigo-500/30'
                    : 'border-[#E8E8E8] dark:border-[#27272A] hover:border-gray-300 dark:hover:border-[#3F3F46] bg-white dark:bg-[#18181B] text-[#6B6B6B] dark:text-[#A1A1AA]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111111] dark:text-white">Android 19.5:9</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-500/30">
                    Galaxy S23/S24
                  </span>
                </div>
                <span className="text-[11px] block font-mono text-purple-600 dark:text-purple-300 mt-1">1080 × 2340 px</span>
                <span className="text-[10px] text-[#6B6B6B] dark:text-[#71717A] block mt-0.5">
                  Samsung Galaxy S23/S24 series
                </span>
              </button>

              {/* iPhone 1170x2532 Button */}
              <button
                onClick={() => setConfig({ ...config, aspectRatio: 'iphone-2532' })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  config.aspectRatio === 'iphone-2532'
                    ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-[#111111] dark:text-white shadow-xs ring-1 ring-indigo-500/30'
                    : 'border-[#E8E8E8] dark:border-[#27272A] hover:border-gray-300 dark:hover:border-[#3F3F46] bg-white dark:bg-[#18181B] text-[#6B6B6B] dark:text-[#A1A1AA]'
                }`}
              >
                <span className="text-xs font-bold block text-[#111111] dark:text-white">iPhone Pro</span>
                <span className="text-[11px] block font-mono text-[#6B6B6B] dark:text-[#A1A1AA] mt-1">1170 × 2532 px</span>
                <span className="text-[10px] text-[#6B6B6B] dark:text-[#71717A] block mt-0.5">
                  iPhone 12/13/14/15/16
                </span>
              </button>

              {/* Classic 1080x1920 Button */}
              <button
                onClick={() => setConfig({ ...config, aspectRatio: '9:16' })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  config.aspectRatio === '9:16'
                    ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-[#111111] dark:text-white shadow-xs ring-1 ring-indigo-500/30'
                    : 'border-[#E8E8E8] dark:border-[#27272A] hover:border-gray-300 dark:hover:border-[#3F3F46] bg-white dark:bg-[#18181B] text-[#6B6B6B] dark:text-[#A1A1AA]'
                }`}
              >
                <span className="text-xs font-bold block text-[#111111] dark:text-white">Classic 16:9</span>
                <span className="text-[11px] block font-mono text-[#6B6B6B] dark:text-[#A1A1AA] mt-1">1080 × 1920 px</span>
                <span className="text-[10px] text-[#6B6B6B] dark:text-[#71717A] block mt-0.5">
                  Standard mobile 9:16
                </span>
              </button>

              {/* Desktop 1920x1080 */}
              <button
                onClick={() => setConfig({ ...config, aspectRatio: '16:9' })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  config.aspectRatio === '16:9'
                    ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-[#111111] dark:text-white shadow-xs ring-1 ring-indigo-500/30'
                    : 'border-[#E8E8E8] dark:border-[#27272A] hover:border-gray-300 dark:hover:border-[#3F3F46] bg-white dark:bg-[#18181B] text-[#6B6B6B] dark:text-[#A1A1AA]'
                }`}
              >
                <div className="flex items-center gap-1 text-[#111111] dark:text-white font-bold text-xs">
                  <Monitor className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Desktop 16:9</span>
                </div>
                <span className="text-[11px] block font-mono text-[#6B6B6B] dark:text-[#A1A1AA] mt-1">1920 × 1080 px</span>
                <span className="text-[10px] text-[#6B6B6B] dark:text-[#71717A] block mt-0.5">Laptop / Monitor</span>
              </button>

              {/* Custom Resolution Toggle */}
              <button
                onClick={() => setConfig({ ...config, aspectRatio: 'custom' })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  config.aspectRatio === 'custom'
                    ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-[#111111] dark:text-white shadow-xs ring-1 ring-indigo-500/30'
                    : 'border-[#E8E8E8] dark:border-[#27272A] hover:border-gray-300 dark:hover:border-[#3F3F46] bg-white dark:bg-[#18181B] text-[#6B6B6B] dark:text-[#A1A1AA]'
                }`}
              >
                <div className="flex items-center gap-1 text-[#111111] dark:text-white font-bold text-xs">
                  <Maximize2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Custom Size</span>
                </div>
                <span className="text-[11px] block font-mono text-[#6B6B6B] dark:text-[#A1A1AA] mt-1">Specify W × H</span>
                <span className="text-[10px] text-[#6B6B6B] dark:text-[#71717A] block mt-0.5">Any device resolution</span>
              </button>
            </div>

            {/* Custom Dimension Inputs if Custom selected */}
            {config.aspectRatio === 'custom' && (
              <div className="p-3 bg-[#F7F7F5] dark:bg-[#18181B] rounded-xl border border-[#E8E8E8] dark:border-[#27272A] grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#6B6B6B] dark:text-[#71717A] font-bold block mb-1">
                    Width (px)
                  </label>
                  <input
                    type="number"
                    value={config.customWidth || 1080}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        customWidth: parseInt(e.target.value, 10) || 1080,
                      })
                    }
                    className="w-full px-3 py-1.5 bg-white dark:bg-[#0F0F12] border border-[#E8E8E8] dark:border-[#27272A] rounded-lg text-[#111111] dark:text-white font-mono text-xs focus:border-indigo-500 outline-none"
                    min="480"
                    max="3840"
                    step="10"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#6B6B6B] dark:text-[#71717A] font-bold block mb-1">
                    Height (px)
                  </label>
                  <input
                    type="number"
                    value={config.customHeight || 2400}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        customHeight: parseInt(e.target.value, 10) || 2400,
                      })
                    }
                    className="w-full px-3 py-1.5 bg-white dark:bg-[#0F0F12] border border-[#E8E8E8] dark:border-[#27272A] rounded-lg text-[#111111] dark:text-white font-mono text-xs focus:border-indigo-500 outline-none"
                    min="480"
                    max="3840"
                    step="10"
                  />
                </div>
              </div>
            )}

            {/* Lockscreen Safe Zone Toggle */}
            {activeRes.isPhone && (
              <div className="pt-2 border-t border-[#E8E8E8] dark:border-[#27272A] flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-[#111111] dark:text-[#E4E4E7] block">
                    Lockscreen Clock Safe Zone
                  </span>
                  <span className="text-[11px] text-[#6B6B6B] dark:text-[#71717A] block">
                    Reserves top ~21% space for Android clock widget & punch-hole camera
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={config.phoneSafeZone}
                  onChange={(e) =>
                    setConfig({ ...config, phoneSafeZone: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-indigo-600 border-[#E8E8E8] dark:border-[#27272A] bg-white dark:bg-[#18181B] focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Astranova Philippines Branding Section */}
          <div className="bg-white dark:bg-[#171A21] border border-[#E8E8E8] dark:border-[#262B35] rounded-2xl p-5 shadow-xs space-y-3 transition-colors">
            <h3 className="text-[10px] font-bold text-[#6B6B6B] dark:text-[#9CA3AF] uppercase tracking-[0.2em] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              <span>Company Branding</span>
            </h3>

            <div className="flex items-center justify-between p-3 bg-[#F7F7F5] dark:bg-[#18181B] rounded-xl border border-[#E8E8E8] dark:border-[#27272A]">
              <div className="flex items-center gap-3">
                <AstranovaLogo size={32} />
                <div>
                  <span className="text-xs font-semibold text-[#111111] dark:text-white block">
                    Astranova Philippines
                  </span>
                  <span className="text-[10px] text-[#6B6B6B] dark:text-[#71717A] block">
                    Render sleek watermark & star emblem on wallpaper
                  </span>
                </div>
              </div>

              <input
                type="checkbox"
                checked={config.showAstranovaLogo !== false}
                onChange={(e) =>
                  setConfig({ ...config, showAstranovaLogo: e.target.checked })
                }
                className="w-4 h-4 rounded text-indigo-600 border-[#E8E8E8] dark:border-[#27272A] bg-white dark:bg-[#0F0F12] focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Minimalist Aesthetic Theme Selector */}
          <div className="bg-white dark:bg-[#171A21] border border-[#E8E8E8] dark:border-[#262B35] rounded-2xl p-5 shadow-xs space-y-3 transition-colors">
            <h3 className="text-[10px] font-bold text-[#6B6B6B] dark:text-[#9CA3AF] uppercase tracking-[0.2em] flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Aesthetic Theme</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {Object.values(WALLPAPER_THEMES).map((theme) => {
                const isSelected = config.themeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setConfig({ ...config, themeId: theme.id })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
                        : 'border-[#E8E8E8] dark:border-[#27272A] hover:border-gray-300 dark:hover:border-[#3F3F46]'
                    }`}
                    style={{ backgroundColor: theme.bg }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs font-bold"
                        style={{ color: theme.textPrimary }}
                      >
                        {theme.name}
                      </span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                    <span
                      className="text-[10px] block mt-0.5 line-clamp-1"
                      style={{ color: theme.textSecondary }}
                    >
                      {theme.subtitle}
                    </span>
                    <div className="flex items-center gap-1 mt-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: theme.accent }}
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor: theme.cardBg,
                          border: `1px solid ${theme.cardBorder}`,
                        }}
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: theme.accentBadgeText }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Text Readability & Font Scale Control */}
          <div className="bg-white dark:bg-[#171A21] border border-[#E8E8E8] dark:border-[#262B35] rounded-2xl p-5 shadow-xs space-y-3 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-[#6B6B6B] dark:text-[#9CA3AF] uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Text Size & Readability</span>
              </h3>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-700/50">
                High Legibility
              </span>
            </div>

            <p className="text-[11px] text-[#6B6B6B] dark:text-[#A1A1AA]">
              Scale course typography and badges for crystal-clear readability on your phone screen.
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setConfig({ ...config, fontScale: 'xlarge' })}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  config.fontScale === 'xlarge'
                    ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-[#111111] dark:text-white font-semibold shadow-xs ring-1 ring-indigo-500/30'
                    : 'border-[#E8E8E8] dark:border-[#27272A] hover:border-gray-300 dark:hover:border-[#3F3F46] bg-white dark:bg-[#18181B] text-[#6B6B6B] dark:text-[#A1A1AA]'
                }`}
              >
                <span className="text-xs font-bold block text-[#111111] dark:text-white">Extra Large</span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-300 font-medium">Max Impact</span>
              </button>

              <button
                onClick={() => setConfig({ ...config, fontScale: 'large' })}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  config.fontScale === 'large' || !config.fontScale
                    ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-[#111111] dark:text-white font-semibold shadow-xs ring-1 ring-indigo-500/30'
                    : 'border-[#E8E8E8] dark:border-[#27272A] hover:border-gray-300 dark:hover:border-[#3F3F46] bg-white dark:bg-[#18181B] text-[#6B6B6B] dark:text-[#A1A1AA]'
                }`}
              >
                <span className="text-xs font-bold block text-[#111111] dark:text-white">Large & Bold</span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-300 font-medium">Recommended</span>
              </button>

              <button
                onClick={() => setConfig({ ...config, fontScale: 'normal' })}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  config.fontScale === 'normal'
                    ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-[#111111] dark:text-white font-semibold shadow-xs ring-1 ring-indigo-500/30'
                    : 'border-[#E8E8E8] dark:border-[#27272A] hover:border-gray-300 dark:hover:border-[#3F3F46] bg-white dark:bg-[#18181B] text-[#6B6B6B] dark:text-[#A1A1AA]'
                }`}
              >
                <span className="text-xs font-bold block text-[#111111] dark:text-white">Standard</span>
                <span className="text-[10px] text-[#6B6B6B] dark:text-[#71717A]">Compact</span>
              </button>
            </div>
          </div>

          {/* Content & Typography Details */}
          <div className="bg-white dark:bg-[#171A21] border border-[#E8E8E8] dark:border-[#262B35] rounded-2xl p-5 shadow-xs space-y-3 transition-colors">
            <h3 className="text-[10px] font-bold text-[#6B6B6B] dark:text-[#9CA3AF] uppercase tracking-[0.2em] flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Content Customization</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#6B6B6B] dark:text-[#71717A] font-medium block mb-1">
                  Wallpaper Title
                </label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#F7F7F5] dark:bg-[#18181B] border border-[#E8E8E8] dark:border-[#27272A] rounded-lg text-[#111111] dark:text-white text-xs focus:border-indigo-500 outline-none transition-colors"
                  placeholder="e.g. CLASS TIMETABLE"
                />
              </div>

              <div>
                <label className="text-[#6B6B6B] dark:text-[#71717A] font-medium block mb-1">
                  Subtitle / Semester
                </label>
                <input
                  type="text"
                  value={config.subtitle}
                  onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#F7F7F5] dark:bg-[#18181B] border border-[#E8E8E8] dark:border-[#27272A] rounded-lg text-[#111111] dark:text-white text-xs focus:border-indigo-500 outline-none transition-colors"
                  placeholder="e.g. Fall Term 2024"
                />
              </div>

              <div className="pt-2 border-t border-[#E8E8E8] dark:border-[#27272A] grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showRoom}
                    onChange={(e) =>
                      setConfig({ ...config, showRoom: e.target.checked })
                    }
                    className="rounded text-indigo-600 border-[#E8E8E8] dark:border-[#27272A] bg-white dark:bg-[#18181B] focus:ring-indigo-500"
                  />
                  <span className="text-[#111111] dark:text-[#E4E4E7] font-medium">Show Room & Lab</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showCourseCode}
                    onChange={(e) =>
                      setConfig({ ...config, showCourseCode: e.target.checked })
                    }
                    className="rounded text-indigo-600 border-[#E8E8E8] dark:border-[#27272A] bg-white dark:bg-[#18181B] focus:ring-indigo-500"
                  />
                  <span className="text-[#111111] dark:text-[#E4E4E7] font-medium">Show Course Codes</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.use24Hour}
                    onChange={(e) =>
                      setConfig({ ...config, use24Hour: e.target.checked })
                    }
                    className="rounded text-indigo-600 border-[#E8E8E8] dark:border-[#27272A] bg-white dark:bg-[#18181B] focus:ring-indigo-500"
                  />
                  <span className="text-[#111111] dark:text-[#E4E4E7] font-medium">24-Hour Format</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showInstructor}
                    onChange={(e) =>
                      setConfig({ ...config, showInstructor: e.target.checked })
                    }
                    className="rounded text-indigo-600 border-[#E8E8E8] dark:border-[#27272A] bg-white dark:bg-[#18181B] focus:ring-indigo-500"
                  />
                  <span className="text-[#111111] dark:text-[#E4E4E7] font-medium">Show Instructors</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer col-span-2 pt-1 border-t border-[#E8E8E8] dark:border-[#27272A]/60">
                  <input
                    type="checkbox"
                    checked={config.showAstranovaLogo !== false}
                    onChange={(e) =>
                      setConfig({ ...config, showAstranovaLogo: e.target.checked })
                    }
                    className="rounded text-purple-600 border-[#E8E8E8] dark:border-[#27272A] bg-white dark:bg-[#18181B] focus:ring-purple-500"
                  />
                  <div className="flex items-center gap-2">
                    <AstranovaLogo size={18} />
                    <span className="text-purple-600 dark:text-purple-300 font-medium">Include Astranova Star Emblem</span>
                  </div>
                </label>
              </div>

              {/* Active Days Toggle */}
              <div className="pt-2 border-t border-[#E8E8E8] dark:border-[#27272A]">
                <span className="text-[#6B6B6B] dark:text-[#71717A] font-medium block mb-1.5">
                  Include Days on Wallpaper:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_DAYS.map((day) => {
                    const isChecked = config.activeDays.includes(day);
                    return (
                      <button
                        key={day}
                        onClick={() => {
                          const updated = isChecked
                            ? config.activeDays.filter((d) => d !== day)
                            : [...config.activeDays, day];
                          if (updated.length > 0) {
                            setConfig({ ...config, activeDays: updated });
                          }
                        }}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer border ${
                          isChecked
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-[#F7F7F5] dark:bg-[#18181B] border-[#E8E8E8] dark:border-[#27272A] text-[#6B6B6B] dark:text-[#71717A] hover:text-[#111111] dark:hover:text-white'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
