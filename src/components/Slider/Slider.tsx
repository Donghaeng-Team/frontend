import type { FC } from 'react';
import { useState, useRef, useEffect } from 'react';
import './Slider.css';

interface SliderProps {
  min?: number;
  max?: number;
  value?: number;
  defaultValue?: number;
  step?: number;
  onChange?: (value: number) => void;
  onAfterChange?: (value: number) => void;
  marks?: { value: number; label: string }[];
  showTooltip?: boolean;
  disabled?: boolean;
  className?: string;
}

const Slider: FC<SliderProps> = ({
  min = 0,
  max = 100,
  value,
  defaultValue = 0,
  step = 1,
  onChange,
  onAfterChange,
  marks = [],
  showTooltip = false,
  disabled = false,
  className = ''
}) => {
  const [localValue, setLocalValue] = useState(defaultValue);
  const [isDragging, setIsDragging] = useState(false);
  const [showTooltipLocal, setShowTooltipLocal] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const currentValue = value ?? localValue;
  const percentage = ((currentValue - min) / (max - min)) * 100;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    setShowTooltipLocal(true);
    updateValue(e.clientX);
  };

  const updateValue = (clientX: number) => {
    if (!sliderRef.current || disabled) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percent = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    const newValue = Math.round(((percent / 100) * (max - min) + min) / step) * step;
    
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        updateValue(e.clientX);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setShowTooltipLocal(false);
        onAfterChange?.(currentValue);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, currentValue, onAfterChange]);

  return (
    <div className={`slider ${disabled ? 'slider-disabled' : ''} ${className}`}>
      <div 
        ref={sliderRef}
        className="slider-rail"
        onMouseDown={handleMouseDown}
      >
        <div 
          className="slider-track"
          style={{ width: `${percentage}%` }}
        />
        
        {marks.map(mark => {
          const markPercentage = ((mark.value - min) / (max - min)) * 100;
          const isActive = mark.value <= currentValue;
          return (
            <div
              key={mark.value}
              className={`slider-mark ${isActive ? 'slider-mark-active' : ''}`}
              style={{ left: `${markPercentage}%` }}
            />
          );
        })}
        
        <div
          className="slider-handle"
          style={{ left: `${percentage}%` }}
        >
          {(showTooltip || showTooltipLocal) && (
            <div className="slider-tooltip">{currentValue}</div>
          )}
        </div>
      </div>
      
      {marks.length > 0 && (
        <div className="slider-marks">
          {marks.map(mark => {
            const markPercentage = ((mark.value - min) / (max - min)) * 100;
            return (
              <div
                key={mark.value}
                className="slider-mark-label"
                style={{ left: `${markPercentage}%` }}
              >
                {mark.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Slider;