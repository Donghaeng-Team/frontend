import type { FC, ReactNode } from 'react';
import { useState } from 'react';
import './Accordion.css';

export interface AccordionItem {
  key: string;
  title: ReactNode;
  content: ReactNode;
  disabled?: boolean;
  extra?: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultActiveKeys?: string[];
  activeKeys?: string[];
  onChange?: (keys: string[]) => void;
  accordion?: boolean;
  expandIconPosition?: 'left' | 'right';
  bordered?: boolean;
  className?: string;
}

const Accordion: FC<AccordionProps> = ({
  items,
  defaultActiveKeys = [],
  activeKeys,
  onChange,
  accordion = false,
  expandIconPosition = 'right',
  bordered = true,
  className = ''
}) => {
  const [localActiveKeys, setLocalActiveKeys] = useState<string[]>(defaultActiveKeys);
  const currentKeys = activeKeys ?? localActiveKeys;

  const handleToggle = (key: string) => {
    let newKeys: string[];
    
    if (accordion) {
      newKeys = currentKeys.includes(key) ? [] : [key];
    } else {
      newKeys = currentKeys.includes(key)
        ? currentKeys.filter(k => k !== key)
        : [...currentKeys, key];
    }
    
    setLocalActiveKeys(newKeys);
    onChange?.(newKeys);
  };

  return (
    <div className={`accordion ${bordered ? 'accordion-bordered' : ''} ${className}`}>
      {items.map((item, index) => {
        const isActive = currentKeys.includes(item.key);
        
        return (
          <div
            key={item.key}
            className={`accordion-item ${item.disabled ? 'accordion-item-disabled' : ''} ${index === 0 ? 'accordion-item-first' : ''} ${index === items.length - 1 ? 'accordion-item-last' : ''}`}
          >
            <div
              className={`accordion-header ${isActive ? 'accordion-header-active' : ''}`}
              onClick={() => !item.disabled && handleToggle(item.key)}
            >
              {expandIconPosition === 'left' && (
                <span className={`accordion-icon accordion-icon-${isActive ? 'open' : 'closed'}`}>
                  ›
                </span>
              )}
              
              <div className="accordion-title">{item.title}</div>
              
              {item.extra && (
                <div className="accordion-extra" onClick={e => e.stopPropagation()}>
                  {item.extra}
                </div>
              )}
              
              {expandIconPosition === 'right' && (
                <span className={`accordion-icon accordion-icon-${isActive ? 'open' : 'closed'}`}>
                  ›
                </span>
              )}
            </div>
            
            <div className={`accordion-content ${isActive ? 'accordion-content-active' : ''}`}>
              <div className="accordion-content-inner">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;  // ← 이 줄이 꼭 있어야 해요!