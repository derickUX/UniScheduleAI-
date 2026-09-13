import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Clock,
  MapPin,
  FlaskConical,
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  Filter,
  Search,
  Sparkles,
  X,
  CheckCircle2,
  Globe,
  Calendar as CalendarIcon,
  ChevronRight,
  SlidersHorizontal,
  Layers,
} from 'lucide-react';
import { CourseSchedule, DayOfWeek, CourseType } from '../types';

interface ScheduleGridProps {
  courses: CourseSchedule[];
  onAddCourse: () => void;
  onEditCourse: (course: CourseSchedule) => void;
  onDeleteCourse: (id: string) => void;
  onNavigateToWallpaper: () => void;
  onTodayRef?: React.MutableRefObject<(() => void) | null>;
}

const ALL_WEEK_DAYS: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const DAY_ABBREVIATIONS: Record<DayOfWeek, string> = {
  Monday: 'MON',
  Tuesday: 'TUE',
  Wednesday: 'WED',
  Thursday: 'THU',
  Friday: 'FRI',
  Saturday: 'SAT',
  Sunday: 'SUN',
};

// Robust time parser supporting 24-hour ('14:30'), 12-hour AM/PM ('01:30 PM', '8:30 AM', '1:00P'),
// and university afternoon shorthands ('1:00', '2:30')
export function timeToMinutes(timeStr: string): number {
  if (!timeStr || typeof timeStr !== 'string') return -1;
  const str = timeStr.trim().toUpperCase();

  if (
    !str ||
    str.includes('TBA') ||
    str.includes('ARR') ||
    str.includes('ONLINE') ||
    str.includes('ASYNC') ||
    str.includes('VIRTUAL') ||
    str.includes('TBD')
  ) {
    return -1;
  }

  const isPM = str.includes('PM') || str.includes('P.M.') || (str.endsWith('P') && !str.endsWith('AP'));
  const isAM = str.includes('AM') || str.includes('A.M.') || (str.endsWith('A') && !str.endsWith('BA'));

  const cleaned = str.replace(/[^\d:]/g, '');
  if (!cleaned) return -1;

  let h = 0;
  let m = 0;

  if (cleaned.includes(':')) {
    const parts = cleaned.split(':');
    h = parseInt(parts[0], 10) || 0;
    m = parseInt(parts[1], 10) || 0;
  } else if (cleaned.length === 3 || cleaned.length === 4) {
    h = parseInt(cleaned.slice(0, -2), 10) || 0;
    m = parseInt(cleaned.slice(-2), 10) || 0;
  } else {
    h = parseInt(cleaned, 10) || 0;
    m = 0;
  }

  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;

  // University afternoon heuristic: In college timetables without explicit AM/PM,
  // hours between 1 and 6 are afternoon classes (13:00 - 18:00)
  if (!isPM && !isAM && h >= 1 && h <= 6) {
    h += 12;
  }

  return h * 60 + m;
}

// Safely normalize a course's time range, handling noon crossings
export function getCourseTimeSpan(course: CourseSchedule): { start: number; end: number; isValid: boolean } {
  let start = timeToMinutes(course.startTime);
  let end = timeToMinutes(course.endTime);

  if (start < 0 || end < 0) {
    return { start: -1, end: -1, isValid: false };
  }

  if (end <= start && start >= 11 * 60 && end <= 6 * 60) {
    end += 12 * 60;
  }

  return { start, end, isValid: end > start };
}

// Check if a course is online, asynchronous, arranged, or TBA
export function isOnlineOrUnscheduled(course: CourseSchedule): boolean {
  const combined = `${course.code || ''} ${course.title || ''} ${course.room || ''} ${course.type || ''} ${course.startTime || ''}`.toLowerCase();
  return (
    combined.includes('tba') ||
    combined.includes('arr') ||
    combined.includes('arranged') ||
    combined.includes('online') ||
    combined.includes('async') ||
    combined.includes('virtual') ||
    combined.includes('off-campus') ||
    combined.includes('off campus') ||
    combined.includes('tbd')
  );
}

export interface ConflictDetail {
  id: string;
  day: DayOfWeek;
  course1: CourseSchedule;
  course2: CourseSchedule;
  overlapMinutes: number;
  timeRange1: string;
  timeRange2: string;
}

function formatMinutesToTime(minutes: number): string {
  if (minutes < 0) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
}

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  courses,
  onAddCourse,
  onEditCourse,
  onDeleteCourse,
  onNavigateToWallpaper,
  onTodayRef,
}) => {
  // Current real-time clock state for "NOW" and "Today" detection
  const [currentMinutes, setCurrentMinutes] = useState<number>(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  const [todayDayName, setTodayDayName] = useState<DayOfWeek>(() => {
    const dayIdx = new Date().getDay(); // 0 is Sunday
    return ALL_WEEK_DAYS[dayIdx === 0 ? 6 : dayIdx - 1];
  });

  const [formattedTodayDate, setFormattedTodayDate] = useState<string>('');

  useEffect(() => {
    const timer = () => {
      const now = new Date();
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes());
      const dayIdx = now.getDay();
      setTodayDayName(ALL_WEEK_DAYS[dayIdx === 0 ? 6 : dayIdx - 1]);
      setFormattedTodayDate(
        now.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      );
    };
    timer();
    const interval = setInterval(timer, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  // Filter and view controls
  const [typeFilter, setTypeFilter] = useState<'All' | CourseType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dismissedConflictIds, setDismissedConflictIds] = useState<Set<string>>(new Set());

  // Determine active days: Monday to Friday by default, plus Saturday or Sunday if courses exist on them
  const hasSaturday = courses.some((c) => c.days?.includes('Saturday'));
  const hasSunday = courses.some((c) => c.days?.includes('Sunday'));

  const activeDays: DayOfWeek[] = useMemo(() => {
    const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    if (hasSaturday) days.push('Saturday');
    if (hasSunday) days.push('Sunday');
    return days;
  }, [hasSaturday, hasSunday]);

  // Mobile selected day: defaults to today if in activeDays, else Monday
  const [selectedMobileDay, setSelectedMobileDay] = useState<DayOfWeek>(() => {
    const dayIdx = new Date().getDay();
    const today = ALL_WEEK_DAYS[dayIdx === 0 ? 6 : dayIdx - 1];
    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(today)
      ? today
      : 'Monday';
  });

  // Expose jump to today callback to header
  useEffect(() => {
    if (onTodayRef) {
      onTodayRef.current = () => {
        if (activeDays.includes(todayDayName)) {
          setSelectedMobileDay(todayDayName);
        }
        // Scroll today's desktop column or mobile timeline into view smoothly
        const el = document.getElementById(`day-column-${todayDayName}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      };
    }
  }, [onTodayRef, todayDayName, activeDays]);

  // Filter courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (typeFilter !== 'All' && c.type !== typeFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesCode = c.code.toLowerCase().includes(query);
        const matchesTitle = c.title.toLowerCase().includes(query);
        const matchesRoom = (c.room || '').toLowerCase().includes(query);
        const matchesInstructor = (c.instructor || '').toLowerCase().includes(query);
        if (!matchesCode && !matchesTitle && !matchesRoom && !matchesInstructor) return false;
      }
      return true;
    });
  }, [courses, typeFilter, searchQuery]);

  // Sort courses chronologically for any given day
  const getCoursesForDay = (day: DayOfWeek) => {
    return filteredCourses
      .filter((c) => c.days?.includes(day) && !isOnlineOrUnscheduled(c))
      .sort((a, b) => {
        const spanA = getCourseTimeSpan(a);
        const spanB = getCourseTimeSpan(b);
        return spanA.start - spanB.start;
      });
  };

  // Detect genuine timetable conflicts (ignoring TBA, online classes, same course entries, and back-to-back classes)
  const conflicts: ConflictDetail[] = useMemo(() => {
    const result: ConflictDetail[] = [];
    activeDays.forEach((day) => {
      const dayClasses = courses.filter((c) => c.days?.includes(day) && !isOnlineOrUnscheduled(c));

      for (let i = 0; i < dayClasses.length; i++) {
        for (let j = i + 1; j < dayClasses.length; j++) {
          const c1 = dayClasses[i];
          const c2 = dayClasses[j];

          if (c1.id === c2.id) continue;

          const code1 = (c1.code || '').trim().toUpperCase();
          const code2 = (c2.code || '').trim().toUpperCase();
          const title1 = (c1.title || '').trim().toUpperCase();
          const title2 = (c2.title || '').trim().toUpperCase();

          if (code1 && code2 && code1 === code2) continue;
          if (title1 && title2 && title1 === title2) continue;

          const stripSuffix = (s: string) =>
            s.replace(/[\s\-_]?(LAB|LEC|L|DISCUSSION|RECITATION|\.1|\.2)$/i, '').trim();
          if (code1 && code2 && stripSuffix(code1) === stripSuffix(code2)) continue;

          const span1 = getCourseTimeSpan(c1);
          const span2 = getCourseTimeSpan(c2);

          if (!span1.isValid || !span2.isValid) continue;

          const s1 = span1.start;
          const e1 = span1.end;
          const s2 = span2.start;
          const e2 = span2.end;

          const overlapStart = Math.max(s1, s2);
          const overlapEnd = Math.min(e1, e2);
          const overlapMinutes = overlapEnd - overlapStart;

          if (overlapMinutes >= 5) {
            const conflictId = `${day}-${c1.id}-${c2.id}`;
            if (!dismissedConflictIds.has(conflictId)) {
              result.push({
                id: conflictId,
                day,
                course1: c1,
                course2: c2,
                overlapMinutes,
                timeRange1: `${c1.startTime || formatMinutesToTime(s1)} – ${c1.endTime || formatMinutesToTime(e1)}`,
                timeRange2: `${c2.startTime || formatMinutesToTime(s2)} – ${c2.endTime || formatMinutesToTime(e2)}`,
              });
            }
          }
        }
      }
    });
    return result;
  }, [courses, activeDays, dismissedConflictIds]);

  // Online / Flexible courses
  const onlineOrUnscheduledCourses = useMemo(() => {
    return filteredCourses.filter(
      (c) => isOnlineOrUnscheduled(c) || !c.days || c.days.length === 0
    );
  }, [filteredCourses]);

  // Helper for computing course status today
  const getCourseStatus = (course: CourseSchedule, day: DayOfWeek): 'NOW' | 'UPCOMING' | 'COMPLETED' | 'OTHER_DAY' => {
    if (day !== todayDayName) {
      return 'OTHER_DAY';
    }
    const span = getCourseTimeSpan(course);
    if (!span.isValid) return 'OTHER_DAY';

    if (currentMinutes >= span.start && currentMinutes < span.end) {
      return 'NOW';
    }
    if (currentMinutes >= span.end) {
      return 'COMPLETED';
    }
    return 'UPCOMING';
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Controls Bar */}
      <div className="bg-white dark:bg-[#171A21] border border-[#E8E8E8] dark:border-[#262B35] rounded-xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1 min-w-0">
          {/* Type Filter Pills */}
          <div className="flex items-center gap-1 bg-[#F7F7F5] dark:bg-[#0F1115] border border-[#E8E8E8] dark:border-[#262B35] p-0.5 rounded-lg text-xs font-medium shrink-0 self-start">
            {(['All', 'Lecture', 'Laboratory'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setTypeFilter(filter)}
                className={`px-2.5 sm:px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  typeFilter === filter
                    ? 'bg-white dark:bg-[#171A21] text-[#111111] dark:text-[#F5F5F5] shadow-xs font-semibold'
                    : 'text-[#6B6B6B] dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-[#F5F5F5]'
                }`}
              >
                {filter === 'All' ? 'All' : filter === 'Laboratory' ? 'Lab' : 'Lec'}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:max-w-xs flex-1">
            <Search className="w-3.5 h-3.5 text-[#6B6B6B] dark:text-[#9CA3AF] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code, title, room..."
              className="w-full pl-8 pr-3 py-1.5 sm:py-1 text-xs bg-[#F7F7F5] dark:bg-[#0F1115] border border-[#E8E8E8] dark:border-[#262B35] rounded-lg text-[#111111] dark:text-[#F5F5F5] placeholder-[#6B6B6B] dark:placeholder-[#9CA3AF] focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6B6B6B] hover:text-[#111111] dark:hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onAddCourse}
            className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Class</span>
          </button>
          <button
            onClick={onNavigateToWallpaper}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8E8E8] dark:border-[#262B35] bg-white dark:bg-[#171A21] hover:bg-[#F7F7F5] dark:hover:bg-[#262B35] text-[#111111] dark:text-[#F5F5F5] text-xs font-medium transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Wallpaper</span>
          </button>
        </div>
      </div>

      {/* Conflict Alert Banner (Accurate, Minimalist & Dismissible) */}
      {conflicts.length > 0 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl space-y-3 text-xs text-amber-900 dark:text-amber-200 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="font-semibold text-sm">
                Schedule Overlap Warning ({conflicts.length})
              </span>
            </div>
            <button
              onClick={() => {
                const newDismissed = new Set(dismissedConflictIds);
                conflicts.forEach((c) => newDismissed.add(c.id));
                setDismissedConflictIds(newDismissed);
              }}
              className="text-[11px] text-amber-700 dark:text-amber-400 hover:underline cursor-pointer transition-colors"
            >
              Dismiss All Warnings
            </button>
          </div>

          <div className="space-y-2">
            {conflicts.map((conflict) => (
              <div
                key={conflict.id}
                className="bg-white dark:bg-[#171A21] border border-amber-200 dark:border-amber-800/30 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[10px] uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-800/50">
                      {conflict.day}
                    </span>
                    <span className="font-bold text-[#111111] dark:text-white">
                      {conflict.course1.code} ({conflict.timeRange1})
                    </span>
                    <span className="text-[#6B6B6B] dark:text-[#9CA3AF] font-medium">overlaps with</span>
                    <span className="font-bold text-[#111111] dark:text-white">
                      {conflict.course2.code} ({conflict.timeRange2})
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B6B6B] dark:text-[#9CA3AF]">
                    Overlaps by <strong className="text-amber-700 dark:text-amber-400">{conflict.overlapMinutes} mins</strong> ({conflict.course1.title} and {conflict.course2.title})
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                  <button
                    onClick={() => onEditCourse(conflict.course1)}
                    className="px-2.5 py-1 bg-[#F7F7F5] dark:bg-[#262B35] hover:bg-[#E8E8E8] dark:hover:bg-[#323946] text-[#111111] dark:text-white rounded text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3 text-indigo-500" />
                    <span>Edit {conflict.course1.code}</span>
                  </button>
                  <button
                    onClick={() => onEditCourse(conflict.course2)}
                    className="px-2.5 py-1 bg-[#F7F7F5] dark:bg-[#262B35] hover:bg-[#E8E8E8] dark:hover:bg-[#323946] text-[#111111] dark:text-white rounded text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3 text-indigo-500" />
                    <span>Edit {conflict.course2.code}</span>
                  </button>
                  <button
                    onClick={() => {
                      setDismissedConflictIds((prev) => new Set([...prev, conflict.id]));
                    }}
                    title="Dismiss warning"
                    className="p-1 text-[#6B6B6B] dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-white rounded transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================
          MOBILE TIMELINE LAYOUT (< 640px)
          ================================================== */}
      <div className="block md:hidden space-y-4">
        {/* Horizontal Day Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
          {activeDays.map((day) => {
            const isSelected = selectedMobileDay === day;
            const isToday = todayDayName === day;
            const dayCount = getCoursesForDay(day).length;

            return (
              <button
                key={day}
                onClick={() => setSelectedMobileDay(day)}
                className={`snap-start shrink-0 flex flex-col items-center py-2 px-3.5 rounded-xl border transition-all cursor-pointer min-w-[68px] ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                    : isToday
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/40 text-indigo-900 dark:text-indigo-200'
                    : 'bg-white dark:bg-[#171A21] border-[#E8E8E8] dark:border-[#262B35] text-[#111111] dark:text-[#F5F5F5] hover:border-gray-300'
                }`}
              >
                <span className="text-[11px] font-bold tracking-wider uppercase">
                  {DAY_ABBREVIATIONS[day]}
                </span>
                <span
                  className={`text-[10px] mt-0.5 font-medium px-1.5 rounded-full ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : isToday
                      ? 'bg-indigo-200/60 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
                      : 'text-[#6B6B6B] dark:text-[#9CA3AF]'
                  }`}
                >
                  {dayCount}
                </span>
                {isToday && (
                  <span
                    className={`w-1 h-1 rounded-full mt-1 ${
                      isSelected ? 'bg-white' : 'bg-indigo-600 dark:bg-indigo-400'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Day Header */}
        <div className="bg-white dark:bg-[#171A21] border border-[#E8E8E8] dark:border-[#262B35] rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold uppercase tracking-tight text-[#111111] dark:text-[#F5F5F5]">
                {selectedMobileDay}
              </h2>
              {todayDayName === selectedMobileDay && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
                  TODAY
                </span>
              )}
            </div>
            <p className="text-xs text-[#6B6B6B] dark:text-[#9CA3AF] mt-0.5">
              {todayDayName === selectedMobileDay && formattedTodayDate
                ? formattedTodayDate
                : `${getCoursesForDay(selectedMobileDay).length} classes scheduled`}
            </p>
          </div>

          <button
            onClick={onAddCourse}
            className="p-2 rounded-lg bg-indigo-600 text-white text-xs font-medium cursor-pointer shadow-xs"
            title="Add Class to this day"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Vertical Timeline of Class Cards on Mobile */}
        <div className="space-y-3">
          {getCoursesForDay(selectedMobileDay).length === 0 ? (
            <div className="bg-white dark:bg-[#171A21] border border-dashed border-[#E8E8E8] dark:border-[#262B35] rounded-xl p-8 text-center space-y-2">
              <CalendarIcon className="w-8 h-8 text-[#6B6B6B] dark:text-[#9CA3AF] mx-auto opacity-50" />
              <p className="text-sm font-semibold text-[#111111] dark:text-[#F5F5F5]">
                No classes scheduled for {selectedMobileDay}
              </p>
              <p className="text-xs text-[#6B6B6B] dark:text-[#9CA3AF]">
                Enjoy your free time or add an elective or study session.
              </p>
              <button
                onClick={onAddCourse}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7F7F5] dark:bg-[#262B35] border border-[#E8E8E8] dark:border-[#323946] text-xs font-medium text-[#111111] dark:text-[#F5F5F5] cursor-pointer hover:bg-gray-100"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Class</span>
              </button>
            </div>
          ) : (
            getCoursesForDay(selectedMobileDay).map((course) => {
              const isLab = course.type === 'Laboratory';
              const status = getCourseStatus(course, selectedMobileDay);
              const isNow = status === 'NOW';
              const isCompleted = status === 'COMPLETED';

              return (
                <div
                  key={course.id}
                  className={`bg-white dark:bg-[#171A21] border rounded-xl p-4 shadow-xs relative overflow-hidden transition-all ${
                    isNow
                      ? 'border-indigo-500 dark:border-indigo-500 ring-1 ring-indigo-500/20 shadow-md'
                      : isCompleted
                      ? 'border-[#E8E8E8] dark:border-[#262B35] opacity-65'
                      : 'border-[#E8E8E8] dark:border-[#262B35] hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  {/* Vertical left accent pillar */}
                  <div
                    className={`absolute top-0 left-0 w-1.5 h-full ${
                      isLab ? 'bg-emerald-500' : 'bg-indigo-600'
                    }`}
                  />

                  <div className="pl-2 space-y-2">
                    {/* Header: Time & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#6B6B6B] dark:text-[#9CA3AF]" />
                        <span className="text-sm font-semibold text-[#111111] dark:text-[#F5F5F5] font-mono">
                          {course.startTime} – {course.endTime}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isNow && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            NOW
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isLab
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
                              : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40'
                          }`}
                        >
                          {isLab ? 'LAB' : 'LEC'}
                        </span>
                      </div>
                    </div>

                    {/* Subject Code & Full Subject Title */}
                    <div>
                      <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                        {course.code}
                      </div>
                      <h3 className="text-base font-semibold text-[#111111] dark:text-[#F5F5F5] leading-snug mt-0.5">
                        {course.title}
                      </h3>
                    </div>

                    {/* Secondary details: Room & Instructor */}
                    <div className="pt-1 border-t border-[#E8E8E8] dark:border-[#262B35] flex items-center justify-between gap-2 text-xs text-[#6B6B6B] dark:text-[#9CA3AF] flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          {isLab ? (
                            <FlaskConical className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          )}
                          <span className="font-medium text-[#111111] dark:text-[#F5F5F5]">
                            {course.room || 'Room TBA'}
                          </span>
                        </div>
                        {course.instructor && (
                          <span className="truncate max-w-[140px]">
                            • {course.instructor}
                          </span>
                        )}
                      </div>

                      {/* Card actions */}
                      <div className="flex items-center gap-1 ml-auto">
                        <button
                          onClick={() => onEditCourse(course)}
                          className="p-1.5 text-[#6B6B6B] dark:text-[#9CA3AF] hover:text-indigo-600 dark:hover:text-indigo-400 rounded cursor-pointer"
                          title="Edit class"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteCourse(course.id)}
                          className="p-1.5 text-[#6B6B6B] dark:text-[#9CA3AF] hover:text-rose-600 dark:hover:text-rose-400 rounded cursor-pointer"
                          title="Delete class"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ==================================================
          DESKTOP & TABLET MULTI-COLUMN WEEKLY SCHEDULE (>= 640px)
          ================================================== */}
      <div className="hidden md:block">
        <div
          className={`grid gap-4 items-start ${
            activeDays.length <= 5
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5'
              : activeDays.length === 6
              ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
              : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7'
          }`}
        >
          {activeDays.map((day) => {
            const dayCourses = getCoursesForDay(day);
            const isToday = todayDayName === day;

            return (
              <div
                key={day}
                id={`day-column-${day}`}
                className={`flex flex-col rounded-xl transition-all duration-200 ${
                  isToday
                    ? 'bg-white dark:bg-[#171A21] border-2 border-indigo-500/80 dark:border-indigo-500/80 shadow-md ring-2 ring-indigo-500/10'
                    : 'bg-white dark:bg-[#171A21] border border-[#E8E8E8] dark:border-[#262B35] shadow-xs'
                }`}
              >
                {/* Day Column Header */}
                <div
                  className={`p-3.5 border-b flex items-center justify-between rounded-t-xl ${
                    isToday
                      ? 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-950/40'
                      : 'border-[#E8E8E8] dark:border-[#262B35] bg-[#F7F7F5]/50 dark:bg-[#0F1115]/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2
                        className={`text-xs font-bold uppercase tracking-wider ${
                          isToday
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-[#111111] dark:text-[#F5F5F5]'
                        }`}
                      >
                        {day}
                      </h2>
                      {isToday && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-600 text-white tracking-wide">
                          TODAY
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-[#6B6B6B] dark:text-[#9CA3AF] block mt-0.5">
                      {dayCourses.length} {dayCourses.length === 1 ? 'CLASS' : 'CLASSES'}
                    </span>
                  </div>

                  <button
                    onClick={onAddCourse}
                    className="p-1 rounded text-[#6B6B6B] dark:text-[#9CA3AF] hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-[#262B35] transition-colors cursor-pointer"
                    title={`Add class on ${day}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Day Column Cards Stack */}
                <div className="p-3 space-y-3 min-h-[220px]">
                  {dayCourses.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-xs text-[#6B6B6B] dark:text-[#9CA3AF] font-medium">
                        No classes
                      </p>
                    </div>
                  ) : (
                    dayCourses.map((course) => {
                      const isLab = course.type === 'Laboratory';
                      const status = getCourseStatus(course, day);
                      const isNow = status === 'NOW';
                      const isCompleted = status === 'COMPLETED';

                      return (
                        <div
                          key={course.id}
                          className={`group relative rounded-xl border p-3.5 transition-all shadow-xs overflow-hidden ${
                            isNow
                              ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-500 shadow-sm ring-1 ring-indigo-500/20'
                              : isCompleted
                              ? 'bg-[#F7F7F5]/80 dark:bg-[#0F1115]/60 border-[#E8E8E8] dark:border-[#262B35] opacity-65 hover:opacity-100'
                              : 'bg-white dark:bg-[#171A21] border-[#E8E8E8] dark:border-[#262B35] hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          {/* Subtle vertical accent line on left */}
                          <div
                            className={`absolute top-0 left-0 w-1 h-full ${
                              isLab ? 'bg-emerald-500' : 'bg-indigo-600'
                            }`}
                          />

                          <div className="pl-1 space-y-1.5">
                            {/* Card Top: Time and Type/Status */}
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[13px] font-semibold text-[#111111] dark:text-[#F5F5F5] font-mono leading-none">
                                {course.startTime} – {course.endTime}
                              </span>

                              <div className="flex items-center gap-1">
                                {isNow && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-600 text-white animate-pulse">
                                    NOW
                                  </span>
                                )}
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                    isLab
                                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
                                      : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40'
                                  }`}
                                >
                                  {isLab ? 'LAB' : 'LEC'}
                                </span>
                              </div>
                            </div>

                            {/* Subject Code & Subject Name */}
                            <div>
                              <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                                {course.code}
                              </div>
                              <h3
                                className="text-[14px] sm:text-[15px] font-semibold text-[#111111] dark:text-[#F5F5F5] leading-snug break-words"
                                title={course.title}
                              >
                                {course.title}
                              </h3>
                            </div>

                            {/* Additional Information: Room & Instructor */}
                            <div className="pt-1.5 border-t border-[#E8E8E8] dark:border-[#262B35] flex items-center justify-between gap-1 text-[12px] text-[#6B6B6B] dark:text-[#9CA3AF]">
                              <div className="flex items-center gap-1 truncate font-medium text-[#111111] dark:text-[#F5F5F5]">
                                {isLab ? (
                                  <FlaskConical className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                ) : (
                                  <MapPin className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                )}
                                <span className="truncate">{course.room || 'Room TBA'}</span>
                              </div>

                              {/* Hover edit/delete actions */}
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 shrink-0">
                                <button
                                  onClick={() => onEditCourse(course)}
                                  className="p-1 hover:text-indigo-600 dark:hover:text-indigo-400 rounded cursor-pointer"
                                  title="Edit course"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => onDeleteCourse(course.id)}
                                  className="p-1 hover:text-rose-600 dark:hover:text-rose-400 rounded cursor-pointer"
                                  title="Delete course"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {course.instructor && (
                              <div className="text-[11px] text-[#6B6B6B] dark:text-[#9CA3AF] truncate">
                                {course.instructor}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==================================================
          ONLINE, ASYNCHRONOUS & FLEXIBLE CLASSES SECTION
          ================================================== */}
      {onlineOrUnscheduledCourses.length > 0 && (
        <div className="bg-white dark:bg-[#171A21] border border-[#E8E8E8] dark:border-[#262B35] rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xs font-bold text-[#111111] dark:text-[#F5F5F5] uppercase tracking-wider">
                Online & Flexible / Asynchronous Classes ({onlineOrUnscheduledCourses.length})
              </h3>
            </div>
            <span className="text-[11px] text-[#6B6B6B] dark:text-[#9CA3AF]">
              Self-paced or arranged delivery
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {onlineOrUnscheduledCourses.map((c) => (
              <div
                key={c.id}
                className="bg-[#F7F7F5] dark:bg-[#0F1115] border border-[#E8E8E8] dark:border-[#262B35] rounded-xl p-3.5 flex items-start justify-between gap-2 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-[#111111] dark:text-[#F5F5F5]">
                      {c.code}
                    </span>
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 rounded">
                      ONLINE / FLEXIBLE
                    </span>
                  </div>
                  <p className="text-xs text-[#111111] dark:text-[#F5F5F5] font-medium leading-snug">
                    {c.title}
                  </p>
                  <p className="text-[11px] text-[#6B6B6B] dark:text-[#9CA3AF] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#6B6B6B] dark:text-[#9CA3AF]" />
                    <span>{c.room || 'Online / Arranged'}</span>
                    {c.instructor && <span>• {c.instructor}</span>}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onEditCourse(c)}
                    title="Edit class"
                    className="p-1 text-[#6B6B6B] dark:text-[#9CA3AF] hover:text-indigo-600 dark:hover:text-indigo-400 rounded cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteCourse(c.id)}
                    title="Delete class"
                    className="p-1 text-[#6B6B6B] dark:text-[#9CA3AF] hover:text-rose-600 dark:hover:text-rose-400 rounded cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
