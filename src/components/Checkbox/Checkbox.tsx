import type { ChangeEvent, FC } from 'react';
import './Checkbox.css';

interface CheckboxProps {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  name?: string;
  value?: string;
  className?: string;
  indeterminate?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked = false,
  onChange,
  disabled = false,
  name,
  value,
  className = '',
  indeterminate = false
}) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.checked);
  };

  return (
    <label className={`checkbox-wrapper ${disabled ? 'checkbox-disabled' : ''} ${className}`}>
      <input
        type="checkbox"
        className="checkbox-input"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        name={name}
        value={value}
      />
      <span className="checkbox-box">
        {checked && !indeterminate && (
          <span className="checkbox-check">✓</span>
        )}
        {indeterminate && (
          <span className="checkbox-indeterminate">−</span>
        )}
      </span>
      {label && <span className="checkbox-label">{label}</span>}
    </label>
  );
};

export default Checkbox;