import React, { useState, useEffect, useRef } from 'react';
import { format, isSameDay } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { CalendarIcon } from 'lucide-react';
import { Button } from './ui';

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  className?: string;
  triggerClassName?: string;
  placeholder?: string;
}

export function DatePicker({ value, onChange, className = '', triggerClassName = '', placeholder = 'Select date' }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDate(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (onChange) {
      onChange(selectedDate);
    }
    setIsOpen(false);
  };

  const clearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleSelect(undefined);
  };

  const formatDisplay = () => {
    if (date) {
      return format(date, 'MMM dd, yyyy');
    }
    return placeholder;
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 w-full justify-start text-left font-medium rounded-md border px-3 h-6 text-[10px] focus:outline-none transition-all ${
          !date ? 'text-neutral-400 dark:text-neutral-500' : 'text-black dark:text-white'
        } ${triggerClassName || 'border-neutral-200 bg-neutral-50 dark:border-[#2e2e2e] dark:bg-[#1c1c1c]'}`}
      >
        <CalendarIcon className="w-3 h-3" />
        <span className="flex-1 truncate">{formatDisplay()}</span>
        {date && (
          <div
            onClick={clearDate}
            className="opacity-50 hover:opacity-100 cursor-pointer p-0.5 ml-auto"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 left-0 bg-white dark:bg-[#232323] border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg p-2 w-auto animate-in fade-in zoom-in-95 duration-100">
          <DayPicker
            mode="single"
            selected={date}
            onSelect={handleSelect}
            className="font-sans text-[11px]"
            showOutsideDays
            classNames={{
              months: "flex flex-col space-y-2 relative",
              month: "space-y-2",
              month_caption: "flex items-center pt-1 mb-2 ml-16",
              caption_label: "text-[12px] font-medium text-neutral-900 dark:text-white",
              nav: "flex items-center gap-1 absolute top-0 left-1 w-full justify-start",
              button_previous: "h-6 w-6 bg-transparent p-0 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-300 [&_svg]:w-3 [&_svg]:h-3",
              button_next: "h-6 w-6 bg-transparent p-0 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-300 [&_svg]:w-3 [&_svg]:h-3",
              month_grid: "w-full border-collapse space-y-1",
              weekdays: "flex mb-1",
              weekday: "text-neutral-400 font-normal text-[0.65rem] uppercase tracking-wider w-6 text-center dark:text-neutral-500",
              week: "flex w-full mt-1",
              day: "h-6 w-6 text-center text-[11px] p-0 relative",
              day_button: "h-6 w-6 p-0 font-normal text-neutral-800 hover:bg-neutral-100 dark:hover:bg-[#3e3e3e] dark:text-neutral-200 rounded-full flex items-center justify-center transition-colors",
              selected: "bg-[#1a73e8] text-white hover:bg-[#1a73e8] hover:text-white focus:bg-[#1a73e8] focus:text-white dark:bg-[#1a73e8] dark:text-white font-medium rounded-full",
              today: "border border-neutral-300 text-neutral-900 dark:border-neutral-600 dark:text-white font-medium bg-transparent",
              outside: "text-neutral-300 dark:text-neutral-600 opacity-50",
              disabled: "text-neutral-300 dark:text-neutral-600 opacity-50",
              hidden: "invisible",
            }}
          />
        </div>
      )}
    </div>
  );
}

