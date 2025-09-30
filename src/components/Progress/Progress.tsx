import type { FC } from 'react';
import './Progress.css';

interface ProgressProps {
  percent: number;
  status?: 'active' | 'success' | 'error';
  showInfo?: boolean;
  strokeColor?: string;
  strokeWidth?: number;
  type?: 'line' | 'circle';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Progress: FC<ProgressProps> = ({
  percent,
  status = 'active',
  showInfo = true,
  strokeColor,
  strokeWidth = 8,
  type = 'line',
  size = 'medium',
  className = ''
}) => {
  const validPercent = Math.min(100, Math.max(0, percent));
  
  const getColor = () => {
    if (strokeColor) return strokeColor;
    switch (status) {
      case 'success': return '#339933';
      case 'error': return '#ff3333';
      default: return '#ff5e2f';
    }
  };

  if (type === 'circle') {
    const sizes = { small: 60, medium: 80, large: 120 };
    const circleSize = sizes[size];
    const radius = (circleSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (validPercent / 100) * circumference;

    return (
      <div className={`progress-circle progress-circle-${size} ${className}`}>
        <svg width={circleSize} height={circleSize}>
          <circle
            className="progress-circle-bg"
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          <circle
            className="progress-circle-path"
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            strokeWidth={strokeWidth}
            stroke={getColor()}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        {showInfo && (
          <div className="progress-circle-text">
            {validPercent}%
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`progress progress-${size} ${className}`}>
      <div className="progress-outer">
        <div className="progress-inner">
          <div
            className={`progress-bg progress-bg-${status}`}
            style={{
              width: `${validPercent}%`,
              backgroundColor: getColor(),
              height: `${strokeWidth}px`
            }}
          />
        </div>
      </div>
      {showInfo && (
        <span className="progress-text">{validPercent}%</span>
      )}
    </div>
  );
};

export default Progress;