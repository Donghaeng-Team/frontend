import './ToggleSwitch.css';

interface ToggleSwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  label?: string;
  labelPosition?: 'left' | 'right';
  className?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked = false,
  onChange,
  disabled = false,
  size = 'medium',
  label,
  labelPosition = 'left',
  className = ''
}) => {
  const handleClick = () => {
    if (!disabled) {
      onChange?.(!checked);
    }
  };

  return (
    <div className={`toggle-wrapper ${className}`}>
      {label && labelPosition === 'left' && (
        <span className="toggle-label">{label}</span>
      )}
      <button
        className={`toggle-switch toggle-${size} ${checked ? 'toggle-checked' : ''} ${disabled ? 'toggle-disabled' : ''}`}
        onClick={handleClick}
        disabled={disabled}
        type="button"
        role="switch"
        aria-checked={checked}
      >
        <span className="toggle-slider" />
      </button>
      {label && labelPosition === 'right' && (
        <span className="toggle-label">{label}</span>
      )}
    </div>
  );
};

export default ToggleSwitch;