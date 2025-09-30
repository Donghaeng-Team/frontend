import type { FC } from 'react';
import { useState } from 'react';
import './CategoryFilter.css';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface CategoryFilterProps {
  title?: string;
  options: FilterOption[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  multiple?: boolean;
  showCount?: boolean;
  className?: string;
}

const CategoryFilter: FC<CategoryFilterProps> = ({
  title,
  options,
  value = [],
  onChange,
  multiple = false,
  showCount = false,
  className = ''
}) => {
  const [localValue, setLocalValue] = useState<string | string[]>(value);
  
  const currentValue = value ?? localValue;
  const selectedValues = Array.isArray(currentValue) ? currentValue : [currentValue];

  const handleSelect = (optionValue: string) => {
    let newValue: string | string[];
    
    if (multiple) {
      if (selectedValues.includes(optionValue)) {
        newValue = selectedValues.filter(v => v !== optionValue);
      } else {
        newValue = [...selectedValues, optionValue];
      }
    } else {
      newValue = selectedValues[0] === optionValue ? '' : optionValue;
    }
    
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  return (
    <div className={`category-filter ${className}`}>
      {title && <h3 className="category-filter-title">{title}</h3>}
      <div className="category-filter-options">
        {options.map(option => (
          <button
            key={option.value}
            className={`category-filter-option ${selectedValues.includes(option.value) ? 'category-filter-option-selected' : ''}`}
            onClick={() => handleSelect(option.value)}
            type="button"
          >
            <span className="category-filter-label">{option.label}</span>
            {showCount && option.count !== undefined && (
              <span className="category-filter-count">({option.count})</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;