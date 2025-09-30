// src/components/Divider/Divider.tsx
import type { FC, ReactNode } from 'react';
import './Divider.css';

interface DividerProps {
  type?: 'horizontal' | 'vertical';
  dashed?: boolean;
  orientation?: 'left' | 'center' | 'right';
  orientationMargin?: string | number;
  children?: ReactNode;
  className?: string;
}

const Divider: FC<DividerProps> = ({
  type = 'horizontal',
  dashed = false,
  orientation = 'center',
  orientationMargin,
  children,
  className = ''
}) => {
  const hasChildren = !!children;
  
  const dividerClasses = [
    'divider',
    `divider-${type}`,
    dashed && 'divider-dashed',
    hasChildren && `divider-with-text divider-with-text-${orientation}`,
    className
  ].filter(Boolean).join(' ');
  
  const marginStyle = orientationMargin ? {
    [`margin${orientation === 'left' ? 'Left' : orientation === 'right' ? 'Right' : ''}`]: 
      typeof orientationMargin === 'number' ? `${orientationMargin}px` : orientationMargin
  } : {};
  
  if (type === 'vertical') {
    return <span className={dividerClasses} />;
  }
  
  return (
    <div className={dividerClasses} role="separator">
      {hasChildren && (
        <span className="divider-text" style={marginStyle}>
          {children}
        </span>
      )}
    </div>
  );
};

export default Divider;