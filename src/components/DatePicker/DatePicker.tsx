// src/components/DatePicker/DatePicker.tsx
import type { FC } from 'react';
import { useState, useRef, useEffect } from 'react';
import './DatePicker.css';

interface DatePickerProps {
  value?: Date;
  defaultValue?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
  format?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const DatePicker: FC<DatePickerProps> = ({
  value,
  defaultValue,
  onChange,
  placeholder = '날짜 선택',
  format = 'YYYY-MM-DD',
  disabled = false,
  size = 'medium',
  className = ''
}) => {
  const [localValue, setLocalValue] = useState<Date | null>(defaultValue || null);
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);
  
  const currentValue = value ?? localValue;
  
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day);
  };
  
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };
  
  const handleDateSelect = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    setLocalValue(newDate);
    onChange?.(newDate);
    setIsOpen(false);
  };
  
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(viewDate);
    const firstDay = getFirstDayOfMonth(viewDate);
    const days = [];
    
    // 빈 날짜
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day-empty" />);
    }
    
    // 날짜
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = currentValue && 
        currentValue.getFullYear() === viewDate.getFullYear() &&
        currentValue.getMonth() === viewDate.getMonth() &&
        currentValue.getDate() === day;
      
      const isToday = new Date().toDateString() === 
        new Date(viewDate.getFullYear(), viewDate.getMonth(), day).toDateString();
      
      days.push(
        <button
          key={day}
          type="button"
          className={`calendar-day ${isSelected ? 'calendar-day-selected' : ''} ${isToday ? 'calendar-day-today' : ''}`}
          onClick={() => handleDateSelect(day)}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);
  
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  
  return (
    <div ref={containerRef} className={`datepicker datepicker-${size} ${className}`}>
      <button
        type="button"
        className="datepicker-input"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className="datepicker-icon">📅</span>
        <span className={`datepicker-value ${!currentValue ? 'datepicker-placeholder' : ''}`}>
          {currentValue ? formatDate(currentValue) : placeholder}
        </span>
      </button>
      
      {isOpen && (
        <div className="datepicker-dropdown">
          <div className="calendar-header">
            <button
              type="button"
              className="calendar-nav"
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))}
            >
              ‹
            </button>
            <div className="calendar-title">
              {viewDate.getFullYear()}년 {monthNames[viewDate.getMonth()]}
            </div>
            <button
              type="button"
              className="calendar-nav"
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))}
            >
              ›
            </button>
          </div>
          
          <div className="calendar-weekdays">
            {weekDays.map(day => (
              <div key={day} className="calendar-weekday">{day}</div>
            ))}
          </div>
          
          <div className="calendar-days">
            {renderCalendar()}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;