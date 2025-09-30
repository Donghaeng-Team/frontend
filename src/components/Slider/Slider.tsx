import type { FC } from 'react';
import { useState, useRef, useEffect } from 'react';
import './Slider.css';

interface SliderProps {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  onAfterChange?: (value: number) => void;
  className?: string;
  disabled?: boolean;
}

const Slider: FC<SliderProps> = ({
  value,
  defaultValue = 0,
  onChange,
  onAfterChange,
  className = '',
  disabled = false
}) => {
  const [localValue, setLocalValue] = useState(defaultValue);
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(defaultValue);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  const currentValue = value !== undefined ? value : localValue;
  const displayValue = isDragging ? dragValue : currentValue;
  
  // 4단계 값 (0, 1, 2, 3)
  const steps = [0, 1, 2, 3];
  const labels = ['내동네', '', '', '먼 동네'];
  
  const getPercentage = (val: number) => {
    return (val / 3) * 100;
  };

  const calculateValue = (clientX: number): number => {
    if (!sliderRef.current) return currentValue;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.min(100, Math.max(0, (x / rect.width) * 100));
    
    // 퍼센트를 0-3 값으로 변환
    return (percentage / 100) * 3;
  };

  const snapToClosest = (val: number): number => {
    // 가장 가까운 단계 찾기
    let closest = 0;
    let minDiff = Math.abs(val - 0);
    
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
        {labels.map((label, index) => 
          label ? (
            <button
              key={index}
              type="button"
              className={`slider-label ${currentValue === index ? 'slider-label-active' : ''}`}
              style={{ left: `${getPercentage(index)}%` }}
              onClick={() => handleStepClick(index)}
              disabled={disabled}
            >
              {label}
            </button>
          ) : null
        )}
      </div>
      
      {/* 현재 값 표시 */}
      <div className="slider-value-display">
        선택된 범위: {
          Math.round(displayValue) === 0 ? '내동네' :
          Math.round(displayValue) === 1 ? '반경 1km' :
          Math.round(displayValue) === 2 ? '반경 3km' :
          '반경 5km+'
        }
        {isDragging && <span style={{ marginLeft: '10px', color: '#ff5e2f' }}>
          (드래그 중)
        </span>}
      </div>
    </div>
  );
};

export default Slider;