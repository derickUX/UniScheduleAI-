import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin, Plus, Trash2 } from 'lucide-react';
import { CourseSchedule, DayOfWeek, CourseType } from '../types';

interface EditCourseModalProps {
  course: CourseSchedule | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: CourseSchedule) => void;
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

const COLOR_TAGS = ['indigo', 'emerald', 'cyan', 'violet', 'amber', 'rose', 'teal', 'slate'];

export const EditCourseModal: React.FC<EditCourseModalProps> = ({
  course,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<CourseSchedule>({
    id: '',
    code: '',
    title: '',
    section: '',
    type: 'Lecture',
    units: 3,
    room: '',
    instructor: '',
    days: ['Monday', 'Wednesday'],
    startTime: '08:30',
    endTime: '10:00',
    colorTag: 'indigo',
  });

  useEffect(() => {
    if (course) {
      setFormData(course);
    } else {
      setFormData({
        id: `course-${Date.now()}`,
        code: '',
        title: '',
        section: '',
        type: 'Lecture',
        units: 3,
        room: '',
        instructor: '',
        days: ['Monday', 'Wednesday'],
        startTime: '08:30',
        endTime: '10:00',
        colorTag: 'indigo',
      });
    }
  }, [course, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.title) return;
    onSave(formData);
    onClose();
  };

  const toggleDay = (day: DayOfWeek) => {
    const exists = formData.days.includes(day);
    const updated = exists
      ? formData.days.filter((d) => d !== day)
      : [...formData.days, day];
    if (updated.length > 0) {
      setFormData({ ...formData, days: updated });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#171A21] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E8E8E8] dark:border-[#262B35] space-y-4 my-8 text-[#111111] dark:text-[#F5F5F5] transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E8] dark:border-[#262B35]">
          <h3 className="text-base font-semibold text-[#111111] dark:text-white">
            {course ? 'Edit Class Details' : 'Add New Class'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6B6B6B] dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-white rounded-lg hover:bg-[#F7F7F5] dark:hover:bg-[#262B35] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="sm:col-span-1">
              <label className="text-[#6B6B6B] dark:text-[#9CA3AF] font-medium block mb-1">
                Course Code *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. CS 310"
                className="w-full px-3 py-2 bg-[#F7F7F5] dark:bg-[#0F1115] border border-[#E8E8E8] dark:border-[#262B35] rounded-lg text-[#111111] dark:text-white focus:border-indigo-500 outline-none uppercase font-semibold transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[#6B6B6B] dark:text-[#9CA3AF] font-medium block mb-1">
                Course Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Design and Analysis of Algorithms"
                className="w-full px-3 py-2 bg-[#F7F7F5] dark:bg-[#0F1115] border border-[#E8E8E8] dark:border-[#262B35] rounded-lg text-[#111111] dark:text-white focus:border-indigo-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="text-[#6B6B6B] dark:text-[#9CA3AF] font-medium block mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as CourseType })
                }
                className="w-full px-3 py-2 bg-[#F7F7F5] dark:bg-[#0F1115] border border-[#E8E8E8] dark:border-[#262B35] rounded-lg text-[#111111] dark:text-white focus:border-indigo-500 outline-none transition-colors"
              >
                <option value="Lecture">Lecture</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Seminar">Seminar</option>
                <option value="Studio">Studio</option>
              </select>
            </div>

            <div>
              <label className="text-[#6B6B6B] dark:text-[#9CA3AF] font-medium block mb-1">Section</label>
              <input
                type="text"
                value={formData.section || ''}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                placeholder="e.g. CS3A"
                className="w-full px-3 py-2 bg-[#F7F7F5] dark:bg-[#0F1115] border border-[#E8E8E8] dark:border-[#262B35] rounded-lg text-[#111111] dark:text-white focus:border-indigo-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-[#6B6B6B] dark:text-[#9CA3AF] font-medium block mb-1">Units</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formData.units || 3}
                onChange={(e) =>
                  setFormData({ ...formData, units: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 bg-[#F7F7F5] dark:bg-[#0F1115] border border-[#E8E8E8] dark:border-[#262B35] rounded-lg text-[#111111] dark:text-white focus:border-indigo-500 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Room / Laboratory location */}
          <div>
            <label className="text-[#6B6B6B] dark:text-[#9CA3AF] font-medium block mb-1">
              Room Assigned or Laboratory Location *
            </label>
            <input
              type="text"
              required
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              placeholder="e.g. Computer Lab 3, Science Complex Rm 402"
              className="w-full px-3 py-2 bg-[#F7F7F5] dark:bg-[#0F1115] border border-[#E8E8E8] dark:border-[#262B35] rounded-lg text-[#111111] dark:text-white focus:border-indigo-500 outline-none font-medium transition-colors"
            />
          </div>

          <div>
            <label className="text-[#6B6B6B] dark:text-[#9CA3AF] font-medium block mb-1">
              Instructor / Professor
            </label>
            <input
              type="text"
              value={formData.instructor || ''}
              onChange={(e) =>
                setFormData({ ...formData, instructor: e.target.value })
              }
              placeholder="e.g. Dr. Elena Rostova"
              className="w-full px-3 py-2 bg-[#F7F7F5] dark:bg-[#0F1115] border border-[#E8E8E8] dark:border-[#262B35] rounded-lg text-[#111111] dark:text-white focus:border-indigo-500 outline-none transition-colors"
            />
          </div>

          {/* Scheduled Days */}
          <div>
            <label className="text-[#6B6B6B] dark:text-[#9CA3AF] font-medium block mb-1.5">
              Scheduled Days
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_DAYS.map((day) => {
                const active = formData.days.includes(day);
                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                      active
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-[#F7F7F5] dark:bg-[#0F1115] border-[#E8E8E8] dark:border-[#262B35] text-[#6B6B6B] dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-white'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[#6B6B6B] dark:text-[#9CA3AF] font-medium block mb-1">
                Start Time (24h)
              </label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                className="w-full px-3 py-2 bg-[#F7F7F5] dark:bg-[#0F1115] border border-[#E8E8E8] dark:border-[#262B35] rounded-lg text-[#111111] dark:text-white focus:border-indigo-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-[#6B6B6B] dark:text-[#9CA3AF] font-medium block mb-1">
                End Time (24h)
              </label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                className="w-full px-3 py-2 bg-[#F7F7F5] dark:bg-[#0F1115] border border-[#E8E8E8] dark:border-[#262B35] rounded-lg text-[#111111] dark:text-white focus:border-indigo-500 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Color tag */}
          <div>
            <label className="text-[#6B6B6B] dark:text-[#9CA3AF] font-medium block mb-1.5">
              Accent Color
            </label>
            <div className="flex items-center gap-2">
              {COLOR_TAGS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormData({ ...formData, colorTag: c })}
                  className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                    formData.colorTag === c
                      ? 'border-indigo-600 scale-110'
                      : 'border-transparent'
                  }`}
                  style={{
                    backgroundColor:
                      c === 'indigo'
                        ? '#6366F1'
                        : c === 'emerald'
                        ? '#10B981'
                        : c === 'cyan'
                        ? '#06B6D4'
                        : c === 'violet'
                        ? '#8B5CF6'
                        : c === 'amber'
                        ? '#F59E0B'
                        : c === 'rose'
                        ? '#F43F5E'
                        : c === 'teal'
                        ? '#14B8A6'
                        : '#94A3B8',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E8E8] dark:border-[#262B35]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#6B6B6B] dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-white rounded-lg hover:bg-[#F7F7F5] dark:hover:bg-[#262B35] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Save Class
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
