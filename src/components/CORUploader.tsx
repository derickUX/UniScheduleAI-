import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  FlaskConical,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Globe,
  ClipboardPaste,
  X,
  Plus,
} from 'lucide-react';
import { ParsedCORData } from '../types';
import { SAMPLE_COR_DATA } from '../data/sampleCOR';

interface CORUploaderProps {
  onParsed: (data: ParsedCORData) => void;
  currentData: ParsedCORData | null;
  onNavigateToWallpaper: () => void;
  onNavigateToSchedule: () => void;
  onEnterManual?: () => void;
}

export const CORUploader: React.FC<CORUploaderProps> = ({
  onParsed,
  currentData,
  onNavigateToWallpaper,
  onNavigateToSchedule,
  onEnterManual,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [websiteScheduleText, setWebsiteScheduleText] = useState('');
  const [isParsingText, setIsParsingText] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastFileRef = useRef<File | null>(null);

  const handleParseWebsiteText = async () => {
    if (!websiteScheduleText.trim()) {
      setError('Please paste the schedule provided by the website or portal of your school.');
      return;
    }

    setIsParsingText(true);
    setError(null);
    try {
      const endpoint = '/api/parse-schedule-text';
      console.log('Starting schedule text extraction');
      console.log('Extraction endpoint:', endpoint);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: websiteScheduleText }),
      });

      const responseText = await response.text();
      console.log('Extraction response status:', response.status);
      console.log('Extraction response:', responseText.slice(0, 500));

      if (!response.ok) {
        let errJson: any = {};
        try {
          errJson = JSON.parse(responseText);
        } catch {}
        throw new Error(errJson.error || `Server returned status ${response.status}`);
      }

      const result = JSON.parse(responseText);
      const rawCourses = result.courses || result.data?.courses || result.schedule || [];
      if (!rawCourses || rawCourses.length === 0) {
        throw new Error('No courses were detected. Please paste the complete course rows or timetable from your school website.');
      }

      const structuredCourses = rawCourses.map((course: any, idx: number) => ({
        ...course,
        id: `course-${Date.now()}-${idx}`,
        days: Array.isArray(course.days) ? course.days : ['Monday', 'Wednesday'],
        startTime: course.startTime || '08:30',
        endTime: course.endTime || '10:00',
        type: course.type || 'Lecture',
        units: typeof course.units === 'number' ? course.units : 3,
        room: course.room || 'Room TBA',
        instructor: course.instructor || 'TBA',
      }));

      onParsed({
        ...(result.data || result),
        courses: structuredCourses,
      });
      setShowPasteModal(false);
      setWebsiteScheduleText('');
    } catch (err: any) {
      setError(err?.message || 'Failed to parse school website schedule.');
    } finally {
      setIsParsingText(false);
    }
  };

  const handleInsertSampleWebsiteSchedule = () => {
    setWebsiteScheduleText(
`UNIVERSITY STUDENT PORTAL - ENROLLED CLASS SCHEDULE
Academic Term: 1st Semester 2024-2025
Student: Derick Reyes | BS Computer Science

COURSE CODE | TITLE | SECTION | SCHEDULE | ROOM | INSTRUCTOR
CS 311 | Algorithms & Complexity | BSCS-3A | MW 08:30 AM - 10:00 AM | Room 402 | Dr. E. Cruz
CS 311L | Algorithms Lab | BSCS-3A | F 01:00 PM - 04:00 PM | Comp Lab 3 | Dr. E. Cruz
IT 320 | Mobile App Development | BSCS-3A | TTH 10:00 AM - 11:30 AM | Lab 105 | Prof. M. Santos
MATH 203 | Linear Algebra | BSCS-3A | TTH 01:00 PM - 02:30 PM | Room 204 | Prof. J. Bautista
PATHFIT 3 | Physical Activities & Fitness | BSCS-3A | W 03:00 PM - 05:00 PM | University Gym | Coach G. Ramos
NSTP 2 | Civic Welfare Training Service | SEC-B | SAT 08:00 AM - 12:00 PM | Field / Online | Mr. R. Flores`
    );
  };

  // Safely optimizes large smartphone camera photos before sending to avoid payload limits & timeouts
  const prepareFilePayload = async (
    file: File
  ): Promise<{ base64Data: string; mimeType: string; previewUrl?: string }> => {
    const isImage =
      file.type.startsWith('image/') ||
      /\.(png|jpe?g|webp|bmp|gif|tiff|heic|heif|jfif)$/i.test(file.name);

    if (!isImage) {
      // PDF or other supported document
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            base64Data: reader.result as string,
            mimeType: file.type || 'application/pdf',
          });
        };
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
      });
    }

    // Image processing: normalize to high-quality JPEG and scale down if huge
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawDataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          // High resolution ceiling so fine print, subject codes, and dense table rows are preserved
          const maxDimension = 2560;
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
            const optimized = canvas.toDataURL('image/jpeg', 0.94);
            resolve({
              base64Data: optimized,
              mimeType: 'image/jpeg',
              previewUrl: optimized,
            });
            return;
          }

          resolve({
            base64Data: rawDataUrl,
            mimeType: file.type || 'image/jpeg',
            previewUrl: rawDataUrl,
          });
        };

        img.onerror = () => {
          resolve({
            base64Data: rawDataUrl,
            mimeType: file.type || 'image/jpeg',
            previewUrl: rawDataUrl,
          });
        };

        img.src = rawDataUrl;
      };

      reader.onerror = () => {
        resolve({
          base64Data: '',
          mimeType: 'image/jpeg',
        });
      };

      reader.readAsDataURL(file);
    });
  };

  const processFile = async (file: File) => {
    lastFileRef.current = file;
    setError(null);
    setFileName(file.name);
    setIsLoading(true);
    setLoadingStep('Reading document binary...');

    try {
      const isPdf =
        file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const isImage =
        file.type.startsWith('image/') ||
        /\.(png|jpe?g|webp|bmp|gif|tiff|heic|heif|jfif)$/i.test(file.name);

      if (!isPdf && !isImage) {
        throw new Error(
          'Please upload an image (.png, .jpg, .jpeg, .webp, photo) or a PDF document of your COR.'
        );
      }

      setLoadingStep(
        isImage
          ? 'Optimizing image clarity for schedule extraction...'
          : 'Processing PDF document pages...'
      );

      const payload = await prepareFilePayload(file);
      if (payload.previewUrl) {
        setImagePreviewUrl(payload.previewUrl);
      } else {
        setImagePreviewUrl(null);
      }

      setLoadingStep('Extracting all courses, labs, and schedule slots with multimodal AI...');

      const endpoint = '/api/parse-cor';
      console.log('Starting schedule extraction');
      console.log('File:', file.name);
      console.log('File type:', file.type);
      console.log('File size:', file.size);
      console.log('Extraction endpoint:', endpoint);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Data: payload.base64Data,
          mimeType: payload.mimeType,
          filename: file.name,
        }),
      });

      const responseText = await response.text();
      console.log('Extraction response status:', response.status);
      console.log('Extraction response:', responseText.slice(0, 500));

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = JSON.parse(responseText);
        } catch {}

        if (response.status === 404) {
          throw new Error(
            'API route /api/parse-cor was not found (404). Please ensure server is running or enter your classes manually.'
          );
        }

        throw new Error(
          errorData?.error || `Server responded with status ${response.status}`
        );
      }

      setLoadingStep('Structuring course timetable & lab assignments...');
      const result = JSON.parse(responseText);

      const rawCourses =
        result.courses ||
        result.data?.courses ||
        result.schedule ||
        (Array.isArray(result) ? result : []);

      if (!rawCourses || rawCourses.length === 0) {
        throw new Error(
          'No course schedules were detected in this image. Please ensure the photo clearly shows course codes, days, and time slots, or enter classes manually.'
        );
      }

      // Add unique IDs if missing
      const structuredCourses = rawCourses.map((course: any, idx: number) => ({
        ...course,
        id: `course-${Date.now()}-${idx}`,
        type: course.type || 'Lecture',
        days: Array.isArray(course.days) ? course.days : ['Monday', 'Wednesday'],
        startTime: course.startTime || '08:30',
        endTime: course.endTime || '10:00',
        colorTag:
          course.colorTag ||
          ['indigo', 'emerald', 'cyan', 'violet', 'amber', 'rose', 'teal'][idx % 7],
      }));

      const parsedResult: ParsedCORData = {
        ...(result.data || result),
        courses: structuredCourses,
      };

      onParsed(parsedResult);
    } catch (err: any) {
      console.error('File parsing failure:', err);
      setError(
        err?.message ||
          'Failed to parse your Certificate of Registration. Please verify the image or try the verified sample.'
      );
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleRetry = async () => {
    if (!lastFileRef.current) {
      setError('No previous file found to retry. Please select a schedule file.');
      fileInputRef.current?.click();
      return;
    }
    console.log('Retrying schedule extraction with file:', lastFileRef.current.name);
    await processFile(lastFileRef.current);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleLoadSample = () => {
    setError(null);
    setFileName('Demo_University_COR_Fall2024.pdf');
    setIsLoading(true);
    setLoadingStep('Loading verified university schedule template...');
    setTimeout(() => {
      onParsed(SAMPLE_COR_DATA);
      setIsLoading(false);
      setLoadingStep('');
    }, 450);
  };

  const lecturesCount =
    currentData?.courses.filter((c) => c.type === 'Lecture').length || 0;
  const labsCount =
    currentData?.courses.filter((c) => c.type === 'Laboratory').length || 0;

  return (
    <div className="space-y-6">
      {/* Hero Banner / Instructions */}
      <div className="bg-white dark:bg-[#171A21] border border-[#E8E8E8] dark:border-[#262B35] text-[#111111] dark:text-[#F5F5F5] rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden transition-colors">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/40 text-indigo-700 dark:text-indigo-400 text-[10px] uppercase tracking-[0.2em] font-bold mb-4">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span>Schedule Automation</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111] dark:text-white mb-2">
            Import <span className="text-indigo-600 dark:text-indigo-400">Class Schedule</span>
          </h1>
          <p className="text-[#6B6B6B] dark:text-[#9CA3AF] text-xs sm:text-sm leading-relaxed">
            Drop your Certificate of Registration (COR) PDF or photo scan, or paste the timetable provided by the website of your school. Gemini extracts courses,
            time slots, days, and assigned lecture/laboratory locations into your clean interactive calendar.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Select COR File</span>
            </button>

            <button
              onClick={() => setShowPasteModal(true)}
              className="px-4 py-2 bg-[#F7F7F5] dark:bg-[#0F1115] border border-indigo-200 dark:border-indigo-800/50 hover:border-indigo-400 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-medium shadow-xs hover:bg-indigo-50/50 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Globe className="w-4 h-4 text-emerald-500" />
              <span>Paste School Website Schedule</span>
            </button>

            <button
              onClick={handleLoadSample}
              className="px-4 py-2 bg-[#F7F7F5] dark:bg-[#0F1115] border border-[#E8E8E8] dark:border-[#262B35] rounded-lg text-xs font-medium text-[#6B6B6B] dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#262B35] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Load Sample University COR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upload Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/40 dark:bg-[#18181B] scale-[0.99]'
            : 'border-[#E8E8E8] dark:border-[#262B35] hover:border-indigo-500/80 bg-white dark:bg-[#171A21]'
        } ${isLoading ? 'pointer-events-none opacity-80' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/*,.png,.jpg,.jpeg,.webp,.heic,.heif,.jfif,.bmp"
          className="hidden"
          onChange={handleFileInputChange}
        />

        <div className="max-w-md mx-auto flex flex-col items-center">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${
              isLoading
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 animate-pulse border border-indigo-200 dark:border-indigo-700/50'
                : 'bg-[#F7F7F5] dark:bg-[#0F1115] text-[#6B6B6B] dark:text-[#9CA3AF] border border-[#E8E8E8] dark:border-[#262B35]'
            }`}
          >
            {isLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-600 dark:text-indigo-400" />
            ) : (
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            )}
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-[#111111] dark:text-white">
                Parsing Schedule Document...
              </h3>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{loadingStep}</p>
              <div className="w-48 h-1 bg-[#E8E8E8] dark:bg-[#262B35] rounded-full overflow-hidden mx-auto mt-2">
                <div className="w-2/3 h-full bg-indigo-600 rounded-full animate-pulse" />
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-xs font-medium text-[#6B6B6B] dark:text-[#9CA3AF] mb-1">
                Drop your COR PDF, photo, or schedule provided by your school website here, or{' '}
                <span className="text-indigo-600 dark:text-indigo-400 font-medium underline underline-offset-2">browse files</span>
              </h3>
              <p className="text-[11px] text-[#6B6B6B] dark:text-[#9CA3AF] mb-3">
                Supports camera photos, student portal screenshots, school website PDFs, or copied schedules
              </p>
              <div className="flex items-center justify-center gap-3 text-[10px] text-[#6B6B6B] dark:text-[#9CA3AF]">
                <span>✓ Lecture & Lab Detection</span>
                <span>•</span>
                <span>✓ Room & Building Mapping</span>
                <span>•</span>
                <span>✓ Day & Time Sorting</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Alert with Quick Recovery Actions */}
      {error && (
        <div className="p-4 sm:p-5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 rounded-xl space-y-3.5 text-rose-800 dark:text-rose-300">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm flex-1 space-y-1.5">
              <p className="font-bold text-rose-900 dark:text-rose-200">
                We couldn't read your schedule automatically.
              </p>
              <p className="text-rose-800 dark:text-rose-300 leading-relaxed text-xs">
                {error}
              </p>
              <div className="text-xs text-rose-700 dark:text-rose-400 pt-1">
                <p className="font-semibold mb-1">You can:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li><strong>Try Again:</strong> Re-analyze the same document or photo.</li>
                  <li><strong>Upload Another File:</strong> Pick a clearer photo, screenshot, or PDF.</li>
                  <li><strong>Enter Classes Manually:</strong> Add course codes, times, and days directly.</li>
                  <li><strong>Paste School Website Text:</strong> Copy table rows from your student portal.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-rose-200 dark:border-rose-900/40 text-xs">
            <button
              onClick={handleRetry}
              className="w-full sm:w-auto px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-3.5 py-2 bg-rose-100 dark:bg-rose-900/40 hover:bg-rose-200 border border-rose-300 dark:border-rose-700/50 text-rose-800 dark:text-rose-200 rounded-lg font-medium transition-colors cursor-pointer text-center"
            >
              Upload Another File
            </button>
            <button
              onClick={() => {
                if (onEnterManual) {
                  onEnterManual();
                } else {
                  onNavigateToSchedule();
                }
              }}
              className="w-full sm:w-auto px-3.5 py-2 bg-white dark:bg-[#171A21] hover:bg-gray-50 dark:hover:bg-[#262B35] border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Enter Classes Manually</span>
            </button>
            <button
              onClick={() => setShowPasteModal(true)}
              className="w-full sm:w-auto px-3.5 py-2 bg-white dark:bg-[#171A21] hover:bg-gray-50 dark:hover:bg-[#262B35] border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-500" />
              <span>Paste Portal Text</span>
            </button>
            <button
              onClick={handleLoadSample}
              className="w-full sm:w-auto px-3.5 py-2 bg-white dark:bg-[#171A21] hover:bg-gray-50 dark:hover:bg-[#262B35] border border-[#E8E8E8] dark:border-[#262B35] text-[#6B6B6B] dark:text-[#9CA3AF] rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Load Verified Sample</span>
            </button>
          </div>
        </div>
      )}

      {/* Extracted Schedule Overview Card */}
      {currentData && currentData.courses.length > 0 && (
        <div className="bg-white dark:bg-[#171A21] border border-[#E8E8E8] dark:border-[#262B35] rounded-2xl p-6 shadow-xs space-y-5 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E8E8] dark:border-[#262B35] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-[#111111] dark:text-white">
                  {currentData.studentName
                    ? `${currentData.studentName}'s Schedule`
                    : 'Enrolled Class Schedule'}
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Parsed & Synced</span>
                </span>
              </div>
              <p className="text-xs text-[#6B6B6B] dark:text-[#9CA3AF] mt-0.5">
                {[
                  currentData.program,
                  currentData.semester,
                  currentData.academicYear,
                  currentData.university,
                ]
                  .filter(Boolean)
                  .join(' • ')}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateToSchedule}
                className="px-3.5 py-2 bg-[#F7F7F5] dark:bg-[#0F1115] hover:bg-gray-100 text-[#111111] dark:text-[#F5F5F5] border border-[#E8E8E8] dark:border-[#262B35] text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>View Full Timetable</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#6B6B6B]" />
              </button>
              <button
                onClick={onNavigateToWallpaper}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                <span>Export Wallpaper</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#F7F7F5] dark:bg-[#0F1115] border border-[#E8E8E8] dark:border-[#262B35] rounded-xl p-3.5">
              <span className="text-[10px] uppercase tracking-wider text-[#6B6B6B] dark:text-[#9CA3AF] font-bold">Total Courses</span>
              <p className="text-xl font-bold text-[#111111] dark:text-white mt-0.5">
                {currentData.courses.length}
              </p>
            </div>
            <div className="bg-[#F7F7F5] dark:bg-[#0F1115] border border-[#E8E8E8] dark:border-[#262B35] rounded-xl p-3.5">
              <span className="text-[10px] uppercase tracking-wider text-[#6B6B6B] dark:text-[#9CA3AF] font-bold flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                <span>Lectures</span>
              </span>
              <p className="text-xl font-bold text-[#111111] dark:text-white mt-0.5">{lecturesCount}</p>
            </div>
            <div className="bg-[#F7F7F5] dark:bg-[#0F1115] border border-[#E8E8E8] dark:border-[#262B35] rounded-xl p-3.5">
              <span className="text-[10px] uppercase tracking-wider text-[#6B6B6B] dark:text-[#9CA3AF] font-bold flex items-center gap-1">
                <FlaskConical className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Laboratories</span>
              </span>
              <p className="text-xl font-bold text-[#111111] dark:text-white mt-0.5">{labsCount}</p>
            </div>
            <div className="bg-[#F7F7F5] dark:bg-[#0F1115] border border-[#E8E8E8] dark:border-[#262B35] rounded-xl p-3.5">
              <span className="text-[10px] uppercase tracking-wider text-[#6B6B6B] dark:text-[#9CA3AF] font-bold">Total Units</span>
              <p className="text-xl font-bold text-[#111111] dark:text-white mt-0.5">
                {currentData.totalUnits ||
                  currentData.courses.reduce((sum, c) => sum + (c.units || 0), 0) ||
                  '18.0'}
              </p>
            </div>
          </div>

          {/* Preview list of courses */}
          <div className="space-y-2">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] dark:text-[#9CA3AF] font-bold">
              Enrolled Courses & Assigned Rooms / Labs
            </h3>
            <div className="divide-y divide-[#E8E8E8] dark:divide-[#262B35] border border-[#E8E8E8] dark:border-[#262B35] rounded-xl overflow-hidden bg-white dark:bg-[#171A21]">
              {currentData.courses.map((course) => {
                const isLab = course.type === 'Laboratory';
                return (
                  <div
                    key={course.id}
                    className="p-4 hover:bg-[#F7F7F5] dark:hover:bg-[#262B35]/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs relative overflow-hidden"
                  >
                    {/* Left vertical indicator pillar */}
                    <div
                      className={`absolute top-0 left-0 w-1.5 h-full ${
                        isLab ? 'bg-emerald-500' : 'bg-indigo-600'
                      }`}
                    />

                    <div className="space-y-1 pl-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[#111111] dark:text-white text-sm">{course.code}</span>
                        <span className="font-medium text-[#111111] dark:text-[#F5F5F5]">{course.title}</span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                            isLab
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                              : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40'
                          }`}
                        >
                          {isLab ? 'LAB SESSION' : 'LECTURE'}
                        </span>
                        {course.section && (
                          <span className="text-[10px] text-[#6B6B6B] dark:text-[#9CA3AF] bg-[#F7F7F5] dark:bg-[#0F1115] border border-[#E8E8E8] dark:border-[#262B35] px-2 py-0.5 rounded">
                            Sec: {course.section}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-[#6B6B6B] dark:text-[#9CA3AF] text-[11px] flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#6B6B6B]" />
                          <strong className="text-[#111111] dark:text-[#F5F5F5] font-medium">
                            {course.days.join(', ')}:
                          </strong>{' '}
                          {course.startTime} - {course.endTime}
                        </span>
                        {course.instructor && (
                          <span>
                            Prof. {course.instructor}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Room / Lab assignment pill */}
                    <div className="sm:self-center shrink-0 pl-2 sm:pl-0">
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium text-xs ${
                          isLab
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
                            : 'bg-[#F7F7F5] dark:bg-[#0F1115] text-[#111111] dark:text-[#F5F5F5] border-[#E8E8E8] dark:border-[#262B35]'
                        }`}
                      >
                        {isLab ? (
                          <FlaskConical className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        )}
                        <span>{course.room || 'Room TBA'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal for Pasting School Website Schedule */}
      {showPasteModal && (
        <div
          id="modal-paste-school-schedule-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/80 backdrop-blur-sm"
          onClick={() => !isParsingText && setShowPasteModal(false)}
        >
          <div
            id="modal-paste-school-schedule"
            className="w-full max-w-2xl bg-white dark:bg-[#171A21] border border-[#E8E8E8] dark:border-[#262B35] rounded-2xl shadow-2xl p-6 space-y-4 text-[#111111] dark:text-[#F5F5F5] relative overflow-hidden transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-700/50 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#111111] dark:text-white">
                    Paste Schedule from School Website
                  </h3>
                  <p className="text-xs text-[#6B6B6B] dark:text-[#9CA3AF]">
                    Import class schedules copied directly from your student portal or school site
                  </p>
                </div>
              </div>
              <button
                onClick={() => !isParsingText && setShowPasteModal(false)}
                className="p-1.5 rounded-lg text-[#6B6B6B] dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-white hover:bg-[#F7F7F5] dark:hover:bg-[#262B35] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Instruction & Quick Demo */}
            <div className="bg-[#F7F7F5] dark:bg-[#0F1115] border border-[#E8E8E8] dark:border-[#262B35] rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="text-[#6B6B6B] dark:text-[#9CA3AF]">
                Works with MyUSTe, AnimoSys, SAIS, Canvas, Blackboard, SIS, AIMS, or any portal table.
              </span>
              <button
                type="button"
                onClick={handleInsertSampleWebsiteSchedule}
                className="px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-700/50 text-indigo-700 dark:text-indigo-300 font-medium text-[11px] whitespace-nowrap self-start sm:self-auto cursor-pointer"
              >
                Insert Sample Schedule
              </button>
            </div>

            {/* Input area */}
            <div>
              <label className="text-[11px] font-bold text-[#6B6B6B] dark:text-[#9CA3AF] uppercase tracking-wider block mb-1.5">
                Schedule Text / Portal Table Content
              </label>
              <textarea
                value={websiteScheduleText}
                onChange={(e) => setWebsiteScheduleText(e.target.value)}
                placeholder={`Paste your copied schedule here, for example:\n\nCS 301 - Data Structures | MW 09:00 AM - 10:30 AM | Lab 302 | Prof. Santos\nENG 101 - Purposive Comm | TTH 01:00 PM - 02:30 PM | Rm 401\nPATHFIT 2 - Physical Activities | F 08:00 AM - 10:00 AM | Gym\nNSTP 1 - CWTS | SAT 08:00 AM - 12:00 PM | Field`}
                rows={9}
                className="w-full bg-[#F7F7F5] dark:bg-[#0F1115] border border-[#E8E8E8] dark:border-[#262B35] rounded-xl p-3 font-mono text-xs text-[#111111] dark:text-white placeholder-[#6B6B6B] dark:placeholder-[#52525B] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 outline-none resize-none leading-relaxed transition-colors"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E8E8E8] dark:border-[#262B35]">
              <button
                type="button"
                disabled={isParsingText}
                onClick={() => setShowPasteModal(false)}
                className="px-4 py-2 bg-[#F7F7F5] dark:bg-[#0F1115] hover:bg-gray-100 border border-[#E8E8E8] dark:border-[#262B35] text-xs font-medium text-[#6B6B6B] dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isParsingText || !websiteScheduleText.trim()}
                onClick={handleParseWebsiteText}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-medium rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                {isParsingText ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Extracting Schedule...</span>
                  </>
                ) : (
                  <>
                    <ClipboardPaste className="w-4 h-4" />
                    <span>Extract & Build Schedule</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
