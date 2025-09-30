import type { FC } from 'react';
import { useState, useRef, useEffect } from 'react';
import './Dropdown.css';

export interface DropdownOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Dropdown: FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = '선택하세요',
  disabled = false,
  fullWidth = false,
  size = 'medium',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: DropdownOption) => {
    if (!option.disabled) {
      onChange?.(option.value);
      setIsOpen(false);
    }
  };

  const dropdownClasses = [
    'dropdown',
    `dropdown-${size}`,
    fullWidth && 'dropdown-full-width',
    disabled && 'dropdown-disabled',
    isOpen && 'dropdown-open',
    className
  ].filter(Boolean).join(' ');

  return (
    <div ref={dropdownRef} className={dropdownClasses}>
      <button
        className="dropdown-trigger"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        type="button"
      >
        <span className="dropdown-label">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="dropdown-arrow">▼</span>
      </button>
      
      {isOpen && (
        <div className="dropdown-menu">
          {options.map((option) => (
            <div
              key={option.value}
              className={`dropdown-option ${option.disabled ? 'dropdown-option-disabled' : ''} ${option.value === value ? 'dropdown-option-selected' : ''}`}
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;