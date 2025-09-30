// src/components/TimePicker/TimePicker.tsx
import type { FC } from 'react';
import { useState, useRef, useEffect } from 'react';
import './TimePicker.css';

interface TimePickerProps {
  value?: string;
  defaultValue?: string;
  onChange?: (time: string) => void;
  placeholder?: string;
  format?: '12h' | '24h';
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const TimePicker: FC<TimePickerProps> = ({
  value,
  defaultValue = '',
  onChange,
  placeholder = '시간 선택',
  format = '24h',
  disabled = false,
  size = 'medium',
  className = ''
}) => {
  const [localValue, setLocalValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState('00');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState('AM');
  const containerRef = useRef<HTMLDivElement>(null);
  
  const currentValue = value ?? localValue;
  
  const hours = format === '24h' 
    ? Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
    : Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
  
  const handleTimeSelect = () => {
    let timeValue = `${selectedHour}:${selectedMinute}`;
    if (format === '12h') {
      timeValue = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;
    }
    setLocalValue(timeValue);
    onChange?.(timeValue);
    setIsOpen(false);
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
  
  return (
    <div ref={containerRef} className={`timepicker timepicker-${size} ${className}`}>
      <button
        type="button"
        className="timepicker-input"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className="timepicker-icon">🕐</span>
        <span className={`timepicker-value ${!currentValue ? 'timepicker-placeholder' : ''}`}>
          {currentValue || placeholder}
        </span>
      </button>
      
      {isOpen && (
        <div className="timepicker-dropdown">
          <div className="timepicker-selectors">
            <div className="time-column">
              <div className="time-column-header">시</div>
              <div className="time-list">
                {hours.map(hour => (
                  <button
                    key={hour}
                    type="button"
                    className={`time-item ${selectedHour === hour ? 'time-item-selected' : ''}`}
                    onClick={() => setSelectedHour(hour)}
                  >
                    {hour}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="time-column">
              <div className="time-column-header">분</div>
              <div className="time-list">
                {minutes.filter((_, i) => i % 5 === 0).map(minute => (
                  <button
                    key={minute}
                    type="button"
                    className={`time-item ${selectedMinute === minute ? 'time-item-selected' : ''}`}
                    onClick={() => setSelectedMinute(minute)}
                  >
                    {minute}
                  </button>
                ))}
              </div>
            </div>
            
            {format === '12h' && (
              <div className="time-column">
                <div className="time-column-header">오전/오후</div>
                <div className="time-list">
                  {['AM', 'PM'].map(period => (
                    <button
                      key={period}
                      type="button"
                      className={`time-item ${selectedPeriod === period ? 'time-item-selected' : ''}`}
                      onClick={() => setSelectedPeriod(period)}
                    >
                      {period === 'AM' ? '오전' : '오후'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button
            type="button"
            className="timepicker-confirm"
            onClick={handleTimeSelect}
          >
            확인
          </button>
        </div>
      )}
    </div>
  );
};

export default TimePicker;