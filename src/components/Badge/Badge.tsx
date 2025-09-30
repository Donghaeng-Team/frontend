import './Badge.css';

interface BadgeProps {
  count?: number;
  dot?: boolean;
  max?: number;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  children?: React.ReactNode;
  showZero?: boolean;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  count = 0,
  dot = false,
  max = 99,
  color = 'primary',
  children,
  showZero = false,
  className = ''
}) => {
  const displayCount = count > max ? `${max}+` : count;
  const showBadge = dot || count > 0 || showZero;

  return (
    <div className={`badge-wrapper ${className}`}>
      {children}
      {showBadge && (
        <span 
          className={`badge badge-${color} ${dot ? 'badge-dot' : ''}`}
        >
          {!dot && displayCount}
        </span>
      )}
    </div>
  );
};

export default Badge;