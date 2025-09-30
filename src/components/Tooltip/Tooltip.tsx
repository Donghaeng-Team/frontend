// src/components/Tooltip/Tooltip.tsx
import type { FC, ReactNode } from 'react';
import { useState, useRef, useEffect } from 'react';
import './Tooltip.css';

interface TooltipProps {
  title: ReactNode;
  children: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click';
  className?: string;
  delay?: number;
}

const Tooltip: FC<TooltipProps> = ({
  title,
  children,
  placement = 'top',
  trigger = 'hover',
  className = '',
  delay = 100
}) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (visible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      let top = 0;
      let left = 0;
      
      switch (placement) {
        case 'top':
          top = triggerRect.top - tooltipRect.height - 8;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case 'bottom':
          top = triggerRect.bottom + 8;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case 'left':
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.left - tooltipRect.width - 8;
          break;
        case 'right':
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.right + 8;
          break;
      }
      
      setPosition({ top, left });
    }
  }, [visible, placement]);

  const showTooltip = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setVisible(true), delay);
  };

  const hideTooltip = () => {
    clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  const triggerProps = trigger === 'hover' 
    ? { onMouseEnter: showTooltip, onMouseLeave: hideTooltip }
    : { onClick: () => setVisible(!visible) };

  return (
    <>
      <div ref={triggerRef} className="tooltip-trigger" {...triggerProps}>
        {children}
      </div>
      {visible && (
        <div
          ref={tooltipRef}
          className={`tooltip tooltip-${placement} ${className}`}
          style={{ top: position.top, left: position.left }}
        >
          <div className="tooltip-content">{title}</div>
          <div className="tooltip-arrow" />
        </div>
      )}
    </>
  );
};

export default Tooltip;