import React, { useState } from 'react';
import { User } from 'firebase/auth';
import confetti from 'canvas-confetti';
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Clock,
  MapPin,
  Sparkles,
  RefreshCw,
  Bell,
  ShieldCheck,
} from 'lucide-react';
import { CourseSchedule, CalendarSyncOptions } from '../types';
import {
  syncCoursesToGoogleCalendar,
  SyncProgressItem,
} from '../lib/calendar';

interface GoogleCalendarSyncModalProps {
  courses: CourseSchedule[];
  user: User | null;
  hasGoogleToken: boolean;
  onLogin: () => void;
  getAccessToken: () => Promise<string | null>;
  semesterName?: string;
}

export const GoogleCalendarSyncModal: React.FC<GoogleCalendarSyncModalProps> = ({
  courses,
  user,
  hasGoogleToken,
  onLogin,
  getAccessToken,
  semesterName,
}) => {
  // Default term dates: today through 16 weeks ahead
  const today = new Date();
  const defaultStart = today.toISOString().split('T')[0];
  const sixteenWeeksLater = new Date(today.getTime() + 16 * 7 * 24 * 60 * 60 * 1000);
  const defaultEnd = sixteenWeeksLater.toISOString().split('T')[0];

  const [termStart, setTermStart] = useState(defaultStart);
  const [termEnd, setTermEnd] = useState(defaultEnd);
  const [reminderMinutes, setReminderMinutes] = useState(15);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<SyncProgressItem[]>([]);
  const [syncResult, setSyncResult] = useState<{
    completed: boolean;
    success: boolean;
    syncedCount: number;
    errors: string[];
  } | null>(null);

  const handleStartSync = async () => {
    setShowConfirmDialog(false);
    setIsSyncing(true);
    setSyncResult(null);

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error(
          'Google Calendar authorization expired. Please sign in with Google again.'
        );
      }

      const options: CalendarSyncOptions = {
        termStartDate: termStart,
        termEndDate: termEnd,
        calendarId: 'primary',
        reminderMinutes,
      };

      const result = await syncCoursesToGoogleCalendar(
        courses,
        options,
        token,
        (progress) => setSyncProgress(progress)
      );

      setSyncResult({
        completed: true,
        success: result.success,
        syncedCount: result.syncedCount,
        errors: result.errors,
      });

      if (result.syncedCount > 0) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 },
        });
      }
    } catch (err: any) {
      console.error('Calendar sync error:', err);
      setSyncResult({
        completed: true,
        success: false,
        syncedCount: 0,
        errors: [err?.message || 'Sync failed'],
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white dark:bg-[#171A21] border border-[#E8E8E8] dark:border-[#262B35] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-[#111111] dark:text-white tracking-tight">
              Google Calendar <span className="font-medium text-indigo-600 dark:text-indigo-400">Automated Sync</span>
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Direct Calendar API</span>
            </span>
          </div>
          <p className="text-xs text-[#6B6B6B] dark:text-[#9CA3AF] mt-1 max-w-xl">
            Automatically create weekly recurring class events in your Google Calendar.
            Includes room & laboratory locations, course codes, and notification reminders.
          </p>
        </div>

        <a
          href="https://calendar.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium bg-[#F7F7F5] dark:bg-[#0F1115] border border-[#E8E8E8] dark:border-[#262B35] hover:bg-gray-100 dark:hover:bg-[#262B35] px-3.5 py-2 rounded-xl transition-colors self-start md:self-auto"
        >
          <span>Open Google Calendar</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Account Connection State */}
      {!user || !hasGoogleToken ? (
        <div className="bg-white dark:bg-[#171A21] border border-[#E8E8E8] dark:border-[#262B35] rounded-2xl p-8 text-center max-w-lg mx-auto space-y-4 shadow-xs transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-[#F7F7F5] dark:bg-[#0F1115] border border-[#E8E8E8] dark:border-[#262B35] flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400 shadow-xs">
            <Calendar className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-base font-semibold text-[#111111] dark:text-white">
              Connect your Google Calendar
            </h3>
            <p className="text-xs text-[#6B6B6B] dark:text-[#9CA3AF] mt-1 max-w-md mx-auto">
              Sign in with your university or personal Google account to grant calendar permissions
              so the app can schedule your classes directly.
            </p>
          </div>

          <button
            onClick={onLogin}
            className="px-5 py-2.5 bg-[#F7F7F5] dark:bg-[#0F1115] hover:bg-gray-100 dark:hover:bg-[#262B35] text-[#111111] dark:text-white border border-[#E8E8E8] dark:border-[#262B35] rounded-xl shadow-xs text-xs font-medium inline-flex items-center gap-2 cursor-pointer transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 48 48">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
            <span>Sign in with Google to Connect Calendar</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Term Settings & Sync Button */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white dark:bg-[#171A21] border border-[#E8E8E8] dark:border-[#262B35] rounded-2xl p-5 shadow-xs space-y-4 transition-colors">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E8E8E8] dark:border-[#262B35]">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold text-[#111111] dark:text-[#E4E4E7]">
                  Connected as {user.displayName || user.email}
                </span>
              </div>

              <h3 className="text-[10px] font-bold text-[#6B6B6B] dark:text-[#9CA3AF] uppercase tracking-[0.2em]">
                Semester Schedule Range
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[#6B6B6B] dark:text-[#9CA3AF] font-medium block mb-1">
                    Semester Start Date
                  </label>
                  <input
                    type="date"
                    value={termStart}
                    onChange={(e) => setTermStart(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F7F5] dark:bg-[#0F1115] border border-[#E8E8E8] dark:border-[#262B35] rounded-lg text-[#111111] dark:text-white text-xs focus:border-indigo-500 outline-none transition-colors"
                  />
                  <p className="text-[11px] text-[#6B6B6B] dark:text-[#9CA3AF] mt-0.5">
                    First week of classes
                  </p>
                </div>

                <div>
                  <label className="text-[#6B6B6B] dark:text-[#9CA3AF] font-medium block mb-1">
                    Semester End Date
                  </label>
                  <input
                    type="date"
                    value={termEnd}
                    onChange={(e) => setTermEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F7F5] dark:bg-[#0F1115] border border-[#E8E8E8] dark:border-[#262B35] rounded-lg text-[#111111] dark:text-white text-xs focus:border-indigo-500 outline-none transition-colors"
                  />
                  <p className="text-[11px] text-[#6B6B6B] dark:text-[#9CA3AF] mt-0.5">
                    Finals week / semester conclusion
                  </p>
                </div>

                <div>
                  <label className="text-[#6B6B6B] dark:text-[#9CA3AF] font-medium block mb-1 flex items-center gap-1">
                    <Bell className="w-3.5 h-3.5 text-[#6B6B6B] dark:text-[#9CA3AF]" />
                    <span>Class Notification Reminder</span>
                  </label>
                  <select
                    value={reminderMinutes}
                    onChange={(e) => setReminderMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#F7F7F5] dark:bg-[#0F1115] border border-[#E8E8E8] dark:border-[#262B35] rounded-lg text-[#111111] dark:text-white text-xs focus:border-indigo-500 outline-none transition-colors"
                  >
                    <option value={10}>10 minutes before</option>
                    <option value={15}>15 minutes before (Recommended)</option>
                    <option value={30}>30 minutes before</option>
                    <option value={60}>1 hour before</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E8E8E8] dark:border-[#262B35]">
                <button
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={isSyncing || courses.length === 0}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white font-medium text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Syncing Classes with Google Calendar...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-indigo-200" />
                      <span>Sync {courses.length} Courses to Google Calendar</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Sync Progress & Results */}
            {syncResult && (
              <div
                className={`p-4 rounded-2xl border text-xs space-y-2 ${
                  syncResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/50 text-rose-800 dark:text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {syncResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  )}
                  <span>
                    {syncResult.success
                      ? `Successfully synced ${syncResult.syncedCount} classes to Google Calendar!`
                      : `Sync finished with ${syncResult.errors.length} error(s)`}
                  </span>
                </div>

                {syncResult.success && (
                  <p className="text-emerald-700 dark:text-emerald-300 text-[11px]">
                    Events are now visible in your Google Calendar as recurring weekly schedules.
                  </p>
                )}

                {syncResult.errors.length > 0 && (
                  <ul className="list-disc list-inside space-y-0.5 text-rose-700 dark:text-rose-300 text-[11px]">
                    {syncResult.errors.map((e, idx) => (
                      <li key={idx}>{e}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Right: Courses to be Created List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-[#171A21] border border-[#E8E8E8] dark:border-[#262B35] rounded-2xl p-5 shadow-xs space-y-3 transition-colors">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-[#6B6B6B] dark:text-[#9CA3AF] uppercase tracking-[0.2em]">
                  Events to be Added ({courses.length} Enrolled Courses)
                </h3>
                <span className="text-[11px] text-[#6B6B6B] dark:text-[#9CA3AF] font-medium">
                  Weekly recurrence until {termEnd}
                </span>
              </div>

              <div className="divide-y divide-[#E8E8E8] dark:divide-[#262B35] border border-[#E8E8E8] dark:border-[#262B35] rounded-xl overflow-hidden bg-white dark:bg-[#171A21] max-h-[460px] overflow-y-auto">
                {courses.map((course) => {
                  const isLab = course.type === 'Laboratory';
                  const progress = syncProgress.find((p) => p.courseId === course.id);

                  return (
                    <div
                      key={course.id}
                      className="p-3.5 hover:bg-[#F7F7F5] dark:hover:bg-[#262B35]/50 transition-colors flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-[#111111] dark:text-white">{course.code}</span>
                          <span className="text-[#111111] dark:text-[#D4D4D8] font-medium truncate">
                            {course.title}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                              isLab
                                ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                                : 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40'
                            }`}
                          >
                            {isLab ? 'LAB' : 'LEC'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-[#6B6B6B] dark:text-[#9CA3AF]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#6B6B6B]" />
                            {course.days.join(', ')}: {course.startTime} - {course.endTime}
                          </span>
                          <span className="flex items-center gap-1 text-[#111111] dark:text-[#A1A1AA] font-medium">
                            <MapPin className="w-3 h-3 text-[#6B6B6B]" />
                            {course.room}
                          </span>
                        </div>
                      </div>

                      {/* Status indicator */}
                      <div className="shrink-0">
                        {progress?.status === 'syncing' ? (
                          <RefreshCw className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin" />
                        ) : progress?.status === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : progress?.status === 'error' ? (
                          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        ) : (
                          <span className="text-[10px] text-[#6B6B6B] dark:text-[#9CA3AF] font-medium">Ready</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory User Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#171A21] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#E8E8E8] dark:border-[#262B35] text-[#111111] dark:text-[#E4E4E7] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#111111] dark:text-white">
                  Confirm Google Calendar Sync
                </h3>
                <p className="text-xs text-[#6B6B6B] dark:text-[#9CA3AF]">Workspace API Direct Sync</p>
              </div>
            </div>

            <div className="bg-[#F7F7F5] dark:bg-[#0F1115] border border-[#E8E8E8] dark:border-[#262B35] rounded-xl p-3.5 text-xs text-[#6B6B6B] dark:text-[#A1A1AA] space-y-1.5 leading-relaxed">
              <p>
                You are about to add <strong className="text-[#111111] dark:text-white">{courses.length} recurring weekly class events</strong>{' '}
                to your Google Calendar (<strong className="text-indigo-600 dark:text-indigo-400">{user?.email}</strong>).
              </p>
              <div className="pt-1.5 border-t border-[#E8E8E8] dark:border-[#262B35] space-y-1 text-[11px] text-[#6B6B6B] dark:text-[#9CA3AF]">
                <p>• Schedule period: <strong className="text-[#111111] dark:text-[#E4E4E7]">{termStart}</strong> through <strong className="text-[#111111] dark:text-[#E4E4E7]">{termEnd}</strong></p>
                <p>• Location tags included: <strong className="text-[#111111] dark:text-[#E4E4E7]">Classrooms & Laboratories</strong></p>
                <p>• Notification alert: <strong className="text-[#111111] dark:text-[#E4E4E7]">{reminderMinutes} mins before</strong> each class</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 text-xs font-medium text-[#6B6B6B] dark:text-[#A1A1AA] hover:text-[#111111] dark:hover:text-white rounded-lg hover:bg-[#F7F7F5] dark:hover:bg-[#262B35] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleStartSync}
                className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Confirm & Sync
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
