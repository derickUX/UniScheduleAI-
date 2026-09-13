import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  Calendar,
  FileSpreadsheet,
  Image as ImageIcon,
  Sparkles,
  LogOut,
  Sun,
  Moon,
  Plus,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'upload' | 'schedule' | 'wallpaper' | 'sync';
  setActiveTab: (tab: 'upload' | 'schedule' | 'wallpaper' | 'sync') => void;
  user: User | null;
  hasGoogleToken: boolean;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  coursesCount: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onTodayClick?: () => void;
  onAddCourse?: () => void;
  studentSection?: string;
  semesterInfo?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  user,
  hasGoogleToken,
  onLogin,
  onLogout,
  isLoggingIn,
  coursesCount,
  theme,
  onToggleTheme,
  onTodayClick,
  onAddCourse,
  studentSection = 'BSIT • 2A',
  semesterInfo = '1st Semester',
}) => {
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [currentDateStr, setCurrentDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
      setCurrentDateStr(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-[#E8E8E8] dark:border-[#262B35] bg-white dark:bg-[#171A21] sticky top-0 z-40 transition-colors duration-200">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-16 py-2.5 gap-3 flex-wrap sm:flex-nowrap">
          {/* Left: Schedule Header & Section info */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('schedule')}
              className="text-left group cursor-pointer"
              title="Go to Schedule"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#111111] dark:text-[#F5F5F5] leading-tight">
                    CLASS SCHEDULE
                  </h1>
                  <p className="text-[12px] font-medium text-[#6B6B6B] dark:text-[#9CA3AF]">
                    {studentSection} • {semesterInfo}
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Center: Clean minimalist view tabs */}
          <nav className="flex items-center gap-1 bg-[#F7F7F5] dark:bg-[#0F1115] border border-[#E8E8E8] dark:border-[#262B35] p-1 rounded-xl order-3 sm:order-2 w-full sm:w-auto justify-start sm:justify-center overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-lg transition-all shrink-0 cursor-pointer ${
                activeTab === 'schedule'
                  ? 'bg-white dark:bg-[#171A21] text-[#111111] dark:text-[#F5F5F5] shadow-xs font-semibold'
                  : 'text-[#6B6B6B] dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-[#F5F5F5]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>Schedule</span>
              {coursesCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                  {coursesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-lg transition-all shrink-0 cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-white dark:bg-[#171A21] text-[#111111] dark:text-[#F5F5F5] shadow-xs font-semibold'
                  : 'text-[#6B6B6B] dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-[#F5F5F5]'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
              <span className="sm:hidden">Import</span>
              <span className="hidden sm:inline">Import COR</span>
            </button>

            <button
              onClick={() => setActiveTab('wallpaper')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-lg transition-all shrink-0 cursor-pointer ${
                activeTab === 'wallpaper'
                  ? 'bg-white dark:bg-[#171A21] text-[#111111] dark:text-[#F5F5F5] shadow-xs font-semibold'
                  : 'text-[#6B6B6B] dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-[#F5F5F5]'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 shrink-0" />
              <span>Wallpaper</span>
            </button>

            <button
              onClick={() => setActiveTab('sync')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-lg transition-all shrink-0 cursor-pointer ${
                activeTab === 'sync'
                  ? 'bg-white dark:bg-[#171A21] text-[#111111] dark:text-[#F5F5F5] shadow-xs font-semibold'
                  : 'text-[#6B6B6B] dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-[#F5F5F5]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>Sync</span>
            </button>
          </nav>

          {/* Right: Small Secondary Live Clock, Today button, Add Class, Theme Toggle, Account */}
          <div className="flex items-center gap-2 order-2 sm:order-3">
            {/* Live Clock: small and secondary */}
            {currentTimeStr && (
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F7F7F5] dark:bg-[#0F1115] border border-[#E8E8E8] dark:border-[#262B35] text-xs text-[#6B6B6B] dark:text-[#9CA3AF]">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span className="font-mono font-medium text-[#111111] dark:text-[#F5F5F5]">
                  {currentTimeStr}
                </span>
                <span className="text-[11px] text-[#6B6B6B] dark:text-[#9CA3AF]">
                  • {currentDateStr}
                </span>
              </div>
            )}

            {/* Today Jump Button */}
            {onTodayClick && (
              <button
                onClick={() => {
                  setActiveTab('schedule');
                  onTodayClick();
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#E8E8E8] dark:border-[#262B35] bg-white dark:bg-[#171A21] hover:bg-[#F7F7F5] dark:hover:bg-[#262B35] text-[#111111] dark:text-[#F5F5F5] transition-colors cursor-pointer"
                title="Jump to today's schedule"
              >
                Today
              </button>
            )}

            {/* Add Class Button */}
            {onAddCourse && (
              <button
                onClick={onAddCourse}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
                title="Add a new class"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add Class</span>
              </button>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg border border-[#E8E8E8] dark:border-[#262B35] bg-white dark:bg-[#171A21] hover:bg-[#F7F7F5] dark:hover:bg-[#262B35] text-[#111111] dark:text-[#F5F5F5] transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle light/dark theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[#6B6B6B]" />
              )}
            </button>

            {/* Google User Status */}
            {user && hasGoogleToken ? (
              <div className="flex items-center gap-1.5">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full border border-[#E8E8E8] dark:border-[#262B35]"
                    title={user.displayName || user.email || 'Synced Account'}
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <button
                  onClick={onLogout}
                  title="Sign out from Google"
                  className="p-1.5 text-[#6B6B6B] dark:text-[#9CA3AF] hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                disabled={isLoggingIn}
                title="Connect Google Calendar"
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E8E8E8] dark:border-[#262B35] bg-white dark:bg-[#171A21] hover:bg-[#F7F7F5] dark:hover:bg-[#262B35] text-xs font-medium text-[#111111] dark:text-[#F5F5F5] transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
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
                <span>{isLoggingIn ? '...' : 'Sync'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
