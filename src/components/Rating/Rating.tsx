// src/components/Rating/Rating.tsx
import type { FC } from 'react';
import { useState } from 'react';
import './Rating.css';

interface RatingProps {
  value?: number;
  defaultValue?: number;
  max?: number;
  size?: 'small' | 'medium' | 'large';
  readonly?: boolean;
  allowHalf?: boolean;
  onChange?: (value: number) => void;
  showCount?: boolean;
  count?: number;
  className?: string;
}

const Rating: FC<RatingProps> = ({
  value,
  defaultValue = 0,
  max = 5,
  size = 'medium',
  readonly = false,
  allowHalf = false,
  onChange,
  showCount = false,
  count,
  className = ''
}) => {
  const [localValue, setLocalValue] = useState(defaultValue);
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  
  const currentValue = value ?? localValue;
  const displayValue = hoverValue ?? currentValue;
  
  const handleClick = (index: number, isHalf: boolean = false) => {
    if (readonly) return;
    
    const newValue = isHalf ? index + 0.5 : index + 1;
    setLocalValue(newValue);
    onChange?.(newValue);
  };
  
  const handleMouseEnter = (index: number, isHalf: boolean = false) => {
    if (readonly) return;
    setHoverValue(isHalf ? index + 0.5 : index + 1);
  };
  
  const handleMouseLeave = () => {
    setHoverValue(null);
  };
  
  const renderStar = (index: number) => {
    const filled = displayValue > index;
    const halfFilled = allowHalf && displayValue > index && displayValue < index + 1;
    
    return (
      <div
        key={index}
        className={`rating-star rating-star-${size} ${readonly ? 'rating-readonly' : 'rating-interactive'}`}
        onMouseLeave={handleMouseLeave}
      >
        {allowHalf && (
          <div
            className="rating-star-half"
            onMouseEnter={() => handleMouseEnter(index, true)}
            onClick={() => handleClick(index, true)}
          >
            <span className={halfFilled || (filled && !halfFilled) ? 'rating-star-filled' : 'rating-star-empty'}>
              ★
            </span>
          </div>
        )}
        <div
          className={`rating-star-full ${!allowHalf ? 'rating-star-full-width' : ''}`}
          onMouseEnter={() => handleMouseEnter(index, false)}
          onClick={() => handleClick(index, false)}
        >
          <span className={filled && !halfFilled ? 'rating-star-filled' : 'rating-star-empty'}>
            ★
          </span>
        </div>
      </div>
    );
  };
  
  return (
    <div className={`rating-container ${className}`}>
      <div className="rating-stars">
        {Array.from({ length: max }, (_, i) => renderStar(i))}
      </div>
      {showCount && (
        <span className="rating-count">
          {currentValue.toFixed(1)} {count && `(${count}명)`}
        </span>
      )}
    </div>
  );
};

export default Rating;