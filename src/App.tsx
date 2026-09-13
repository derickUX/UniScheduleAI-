import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
} from './lib/firebase';
import { ParsedCORData, CourseSchedule } from './types';
import { SAMPLE_COR_DATA } from './data/sampleCOR';
import { Header } from './components/Header';
import { CORUploader } from './components/CORUploader';
import { ScheduleGrid } from './components/ScheduleGrid';
import { WallpaperStudio } from './components/WallpaperStudio';
import { GoogleCalendarSyncModal } from './components/GoogleCalendarSyncModal';
import { EditCourseModal } from './components/EditCourseModal';

export default function App() {
  // Default to schedule view as instructed (productivity calendar app rather than poster/upload barrier)
  const [activeTab, setActiveTab] = useState<'upload' | 'schedule' | 'wallpaper' | 'sync'>('schedule');
  const [corData, setCorData] = useState<ParsedCORData>(SAMPLE_COR_DATA);

  // Theme state: Default to LIGHT MODE as explicitly requested by user
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('unischedule_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    localStorage.setItem('unischedule_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Authentication state for Google Calendar
  const [user, setUser] = useState<User | null>(null);
  const [hasGoogleToken, setHasGoogleToken] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseSchedule | null>(null);

  // Ref to trigger "Today" jump in ScheduleGrid
  const todayRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (authUser) => {
        setUser(authUser);
        setHasGoogleToken(true);
      },
      () => {
        setUser(null);
        setHasGoogleToken(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setHasGoogleToken(true);
      }
    } catch (err) {
      console.error('Sign in failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setHasGoogleToken(false);
  };

  // Course management
  const handleAddCourse = () => {
    setEditingCourse(null);
    setIsEditModalOpen(true);
  };

  const handleEditCourse = (course: CourseSchedule) => {
    setEditingCourse(course);
    setIsEditModalOpen(true);
  };

  const handleDeleteCourse = (id: string) => {
    setCorData((prev) => ({
      ...prev,
      courses: prev.courses.filter((c) => c.id !== id),
    }));
  };

  const handleSaveCourse = (course: CourseSchedule) => {
    setCorData((prev) => {
      const exists = prev.courses.some((c) => c.id === course.id);
      return {
        ...prev,
        courses: exists
          ? prev.courses.map((c) => (c.id === course.id ? course : c))
          : [...prev.courses, course],
      };
    });
  };

  const handleCORParsed = (data: ParsedCORData) => {
    setCorData(data);
    setActiveTab('schedule');
  };

  const handleTodayClick = () => {
    setActiveTab('schedule');
    if (todayRef.current) {
      todayRef.current();
    }
  };

  // Section and semester information
  const studentSection =
    corData.courses[0]?.section ||
    (corData.program ? corData.program.replace(/^(Bachelor of Science in|BS)\s*/i, 'BS') : 'BSIT • 2A');
  const semesterInfo = corData.semester || '1st Semester';

  return (
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0F1115] text-[#111111] dark:text-[#F5F5F5] flex flex-col font-sans transition-colors duration-200 antialiased selection:bg-indigo-500/20 selection:text-indigo-900 dark:selection:text-indigo-200">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        hasGoogleToken={hasGoogleToken}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoggingIn={isLoggingIn}
        coursesCount={corData.courses.length}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onTodayClick={handleTodayClick}
        onAddCourse={handleAddCourse}
        studentSection={studentSection}
        semesterInfo={semesterInfo}
      />

      <main className="flex-1 max-w-[1360px] w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'schedule' && (
          <ScheduleGrid
            courses={corData.courses}
            onAddCourse={handleAddCourse}
            onEditCourse={handleEditCourse}
            onDeleteCourse={handleDeleteCourse}
            onNavigateToWallpaper={() => setActiveTab('wallpaper')}
            onTodayRef={todayRef}
          />
        )}

        {activeTab === 'upload' && (
          <CORUploader
            onParsed={handleCORParsed}
            currentData={corData}
            onNavigateToWallpaper={() => setActiveTab('wallpaper')}
            onNavigateToSchedule={() => setActiveTab('schedule')}
            onEnterManual={handleAddCourse}
          />
        )}

        {activeTab === 'wallpaper' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white dark:bg-[#171A21] border border-[#E8E8E8] dark:border-[#262B35] rounded-xl p-4 shadow-xs">
              <div>
                <h2 className="text-base font-bold text-[#111111] dark:text-[#F5F5F5]">
                  Wallpaper Studio & Lockscreen Export
                </h2>
                <p className="text-xs text-[#6B6B6B] dark:text-[#9CA3AF]">
                  Render your current automated class schedule into high-resolution wallpapers tailored for iPhone, Android, or desktop.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('schedule')}
                className="px-3 py-1.5 rounded-lg border border-[#E8E8E8] dark:border-[#262B35] bg-[#F7F7F5] dark:bg-[#0F1115] hover:bg-gray-100 text-xs font-semibold text-[#111111] dark:text-[#F5F5F5] cursor-pointer"
              >
                Back to Schedule
              </button>
            </div>
            <WallpaperStudio
              courses={corData.courses}
              studentMetadata={{
                studentName: corData.studentName,
                program: corData.program,
                semester: corData.semester,
                academicYear: corData.academicYear,
              }}
            />
          </div>
        )}

        {activeTab === 'sync' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white dark:bg-[#171A21] border border-[#E8E8E8] dark:border-[#262B35] rounded-xl p-4 shadow-xs">
              <div>
                <h2 className="text-base font-bold text-[#111111] dark:text-[#F5F5F5]">
                  Google Calendar Synchronization
                </h2>
                <p className="text-xs text-[#6B6B6B] dark:text-[#9CA3AF]">
                  Batch export your courses, lecture rooms, and campus hours directly to your Google Calendar with automatic recurring weekly events.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('schedule')}
                className="px-3 py-1.5 rounded-lg border border-[#E8E8E8] dark:border-[#262B35] bg-[#F7F7F5] dark:bg-[#0F1115] hover:bg-gray-100 text-xs font-semibold text-[#111111] dark:text-[#F5F5F5] cursor-pointer"
              >
                Back to Schedule
              </button>
            </div>
            <GoogleCalendarSyncModal
              courses={corData.courses}
              user={user}
              hasGoogleToken={hasGoogleToken}
              onLogin={handleLogin}
              getAccessToken={getAccessToken}
              semesterName={corData.semester}
            />
          </div>
        )}
      </main>

      {/* Edit / Add Course Modal */}
      <EditCourseModal
        isOpen={isEditModalOpen}
        course={editingCourse}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveCourse}
      />
    </div>
  );
}
