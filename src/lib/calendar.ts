import { CourseSchedule, DayOfWeek, CalendarSyncOptions } from '../types';

// Map day name to RFC 5545 day codes
const DAY_MAP: Record<DayOfWeek, string> = {
  Monday: 'MO',
  Tuesday: 'TU',
  Wednesday: 'WE',
  Thursday: 'TH',
  Friday: 'FR',
  Saturday: 'SA',
  Sunday: 'SU',
};

// Map day name to JS Date getDay() index (0 = Sunday, 1 = Monday, etc.)
const DAY_INDEX: Record<DayOfWeek, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

// Get the date of the next occurrence of a target day on or after startDate
function getFirstOccurrence(startDateStr: string, targetDay: DayOfWeek): Date {
  const [year, month, day] = startDateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const targetDayIdx = DAY_INDEX[targetDay];

  const currentDayIdx = date.getDay();
  let diff = targetDayIdx - currentDayIdx;
  if (diff < 0) {
    diff += 7;
  }
  date.setDate(date.getDate() + diff);
  return date;
}

function formatDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatUntilDate(endDateStr: string): string {
  return endDateStr.replace(/-/g, '');
}

// Color ID mapping for Google Calendar default event colors (1 to 11)
const COLOR_ID_MAP: Record<string, string> = {
  indigo: '9',   // Blueberry
  emerald: '10', // Basil
  cyan: '7',     // Peacock
  violet: '3',   // Grape
  amber: '5',    // Banana
  rose: '11',    // Tomato
  teal: '2',     // Sage
  slate: '8',    // Graphite
};

export interface SyncProgressItem {
  courseId: string;
  courseTitle: string;
  status: 'pending' | 'syncing' | 'success' | 'error';
  errorMessage?: string;
  createdEventId?: string;
}

export async function syncCoursesToGoogleCalendar(
  courses: CourseSchedule[],
  options: CalendarSyncOptions,
  accessToken: string,
  onProgress?: (progress: SyncProgressItem[]) => void
): Promise<{ success: boolean; syncedCount: number; errors: string[] }> {
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const progressState: SyncProgressItem[] = courses.map((c) => ({
    courseId: c.id,
    courseTitle: `${c.code}: ${c.title}`,
    status: 'pending',
  }));

  if (onProgress) onProgress([...progressState]);

  let syncedCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];
    progressState[i].status = 'syncing';
    if (onProgress) onProgress([...progressState]);

    try {
      if (!course.days || course.days.length === 0) {
        throw new Error('Course has no scheduled days');
      }

      // Sort days chronologically to find the earliest first occurrence
      const occurrences = course.days.map((day) => ({
        day,
        date: getFirstOccurrence(options.termStartDate, day),
      }));

      occurrences.sort((a, b) => a.date.getTime() - b.date.getTime());
      const earliest = occurrences[0];

      const firstDateStr = formatDateString(earliest.date);
      const startDateTime = `${firstDateStr}T${course.startTime}:00`;
      const endDateTime = `${firstDateStr}T${course.endTime}:00`;

      // Build RRULE for weekly recurring schedule
      const byDayCodes = course.days.map((d) => DAY_MAP[d]).filter(Boolean).join(',');
      const untilStr = `${formatUntilDate(options.termEndDate)}T235959Z`;
      const recurrenceRule = `RRULE:FREQ=WEEKLY;UNTIL=${untilStr};BYDAY=${byDayCodes}`;

      const eventPayload = {
        summary: `[${course.code}] ${course.title} (${course.type})`,
        location: course.room || 'Location TBA',
        description: [
          `Course: ${course.code} - ${course.title}`,
          `Section: ${course.section || 'N/A'}`,
          `Type: ${course.type}`,
          `Location: ${course.room || 'TBA'}`,
          `Instructor: ${course.instructor || 'TBA'}`,
          `Units: ${course.units || 'N/A'}`,
          '',
          'Auto-synced from University COR Schedule.',
        ].join('\n'),
        start: {
          dateTime: startDateTime,
          timeZone: userTimezone,
        },
        end: {
          dateTime: endDateTime,
          timeZone: userTimezone,
        },
        recurrence: [recurrenceRule],
        colorId: COLOR_ID_MAP[course.colorTag] || '9',
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: options.reminderMinutes || 15 },
          ],
        },
      };

      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
          options.calendarId || 'primary'
        )}/events`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventPayload),
        }
      );

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(
          errorBody?.error?.message || `Google Calendar API returned status ${res.status}`
        );
      }

      const createdEvent = await res.json();
      progressState[i].status = 'success';
      progressState[i].createdEventId = createdEvent.id;
      syncedCount++;
    } catch (err: any) {
      console.error(`Error syncing course ${course.code}:`, err);
      progressState[i].status = 'error';
      progressState[i].errorMessage = err?.message || 'Failed to create event';
      errors.push(`${course.code}: ${err?.message || 'Failed to create event'}`);
    }

    if (onProgress) onProgress([...progressState]);
  }

  return {
    success: errors.length === 0,
    syncedCount,
    errors,
  };
}
