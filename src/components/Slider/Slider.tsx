import type { FC } from 'react';
import { useState, useRef, useEffect } from 'react';
import './Slider.css';

export interface SliderProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  marks?: Array<{ value: number; label?: string }>;
  snapToMarks?: boolean;
  showTooltip?: boolean;
  onChange?: (value: number) => void;
  onAfterChange?: (value: number) => void;
  className?: string;
  disabled?: boolean;
}

const Slider: FC<SliderProps> = ({
  value,
  defaultValue = 0,
  min = 0,
  max = 100,
  step = 1,
  marks = [],
  snapToMarks = false,
  showTooltip = false,
  onChange,
  onAfterChange,
  className = '',
  disabled = false
}) => {
  // 초기값을 범위 내로 보정
  const clampedDefaultValue = Math.min(max, Math.max(min, defaultValue));
  const [localValue, setLocalValue] = useState(clampedDefaultValue);
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(clampedDefaultValue);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  const currentValue = value !== undefined ? Math.min(max, Math.max(min, value)) : localValue;
  const displayValue = isDragging ? dragValue : currentValue;
  
  // 동적 단계 생성
  const steps: number[] = [];
  for (let i = min; i <= max; i += step) {
    steps.push(i);
  }
  
  const getPercentage = (val: number) => {
    if (max === min) return 0;
    return Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100));
  };

  const calculateValue = (clientX: number): number => {
    if (!sliderRef.current) return currentValue;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.min(100, Math.max(0, (x / rect.width) * 100));
    
    // 퍼센트를 min-max 범위 값으로 변환
    return min + (percentage / 100) * (max - min);
  };

  const snapToClosest = (val: number): number => {
    if (!snapToMarks) return val;
    
    // 가장 가까운 단계 찾기
    let closest = min;
    let minDiff = Math.abs(val - min);
    
    steps.forEach(step => {
      const diff = Math.abs(val - step);
      if (diff < minDiff) {
        minDiff = diff;
        closest = step;
      }
    });
    
    return closest;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    
    setIsDragging(true);
    const newValue = calculateValue(e.clientX);
    setDragValue(newValue);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || disabled) return;
    
    const newValue = calculateValue(e.clientX);
    setDragValue(newValue);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    const snappedValue = snapToClosest(dragValue);
    setLocalValue(snappedValue);
    setDragValue(snappedValue);
    setIsDragging(false);
    
    onChange?.(snappedValue);
    onAfterChange?.(snappedValue);
  };

  const handleStepClick = (stepValue: number) => {
    if (disabled || isDragging) return;
    
    setLocalValue(stepValue);
    onChange?.(stepValue);
    onAfterChange?.(stepValue);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragValue]);

  return (
    <div className={`slider-container ${disabled ? 'slider-disabled' : ''} ${className}`}>
      <div 
        ref={sliderRef}
        className="slider-track-wrapper"
        onMouseDown={handleMouseDown}
      >
        {/* 배경 트랙 */}
        <div className="slider-track-bg" />
        
        {/* 활성 트랙 */}
        <div 
          className="slider-track-active" 
          style={{ width: `${getPercentage(displayValue)}%` }}
        />
        
        {/* 단계 마크들 */}
        {steps.map((step) => (
          <button
            key={step}
            type="button"
            className={`slider-step ${currentValue >= step ? 'slider-step-active' : ''}`}
            style={{ left: `${getPercentage(step)}%` }}
            onClick={(e) => {
              e.stopPropagation();
              handleStepClick(step);
            }}
            disabled={disabled}
          />
        ))}
        
        {/* 핸들 */}
        <div 
          className={`slider-handle ${isDragging ? 'slider-handle-dragging' : ''}`}
          style={{ left: `${getPercentage(displayValue)}%` }}
          onMouseDown={handleMouseDown}
        />
      </div>
      
      {/* 라벨 */}
      <div className="slider-labels">
        {marks.map((mark, index) => {
          // 첫 번째와 마지막 라벨 구분
          const isFirst = index === 0;
          const isLast = index === marks.length - 1;
          const alignClass = isFirst ? 'slider-label-first' : isLast ? 'slider-label-last' : '';
          
          return mark.label ? (
            <button
              key={mark.value}
              type="button"
              className={`slider-label ${currentValue === mark.value ? 'slider-label-active' : ''} ${alignClass}`}
              style={{ left: `${getPercentage(mark.value)}%` }}
              onClick={() => handleStepClick(mark.value)}
              disabled={disabled}
            >
              {mark.label}
            </button>
          ) : null;
        })}
      </div>
    </div>
  );
};

export default Slider;