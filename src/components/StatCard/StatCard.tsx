import React from 'react';
import Card from '../Card';
import './StatCard.css';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  color?: string;
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  change,
  color = '#ff5e2f',
  icon
}) => {
  return (
    <Card variant="outlined" className="stat-card">
      <div className="stat-card-content">
        {icon && <div className="stat-icon">{icon}</div>}
        <p className="stat-label">{label}</p>
        <div className="stat-value-container">
          <span className="stat-value" style={{ color }}>
            {value}
          </span>
          {unit && <span className="stat-unit">{unit}</span>}
        </div>
        {change && (
          <div className={`stat-change stat-change-${change.type}`}>
            {change.type === 'increase' ? '↑' : '↓'} {Math.abs(change.value)}%
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;