import type { FC, ReactNode } from 'react';
import { useState } from 'react';
import './Tab.css';

export interface TabItem {
  key: string;
  label: string;
  children: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
}

interface TabProps {
  items: TabItem[];
  defaultActiveKey?: string;
  activeKey?: string;
  onChange?: (key: string) => void;
  variant?: 'default' | 'card' | 'pills';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  className?: string;
}

const Tab: FC<TabProps> = ({
  items,
  defaultActiveKey,
  activeKey,
  onChange,
  variant = 'default',
  size = 'medium',
  fullWidth = false,
  className = ''
}) => {
  const [localActiveKey, setLocalActiveKey] = useState(
    defaultActiveKey || items[0]?.key
  );

  const currentKey = activeKey ?? localActiveKey;

  const handleTabClick = (key: string, disabled?: boolean) => {
    if (!disabled) {
      setLocalActiveKey(key);
      onChange?.(key);
    }
  };

  const activeItem = items.find(item => item.key === currentKey);

  return (
    <div className={`tab-container ${className}`}>
      <div className={`tab-nav tab-nav-${variant} tab-nav-${size} ${fullWidth ? 'tab-nav-full' : ''}`}>
        {items.map(item => (
          <button
            key={item.key}
            className={`tab-nav-item ${currentKey === item.key ? 'tab-nav-item-active' : ''} ${item.disabled ? 'tab-nav-item-disabled' : ''}`}
            onClick={() => handleTabClick(item.key, item.disabled)}
            disabled={item.disabled}
            type="button"
          >
            {item.icon && <span className="tab-nav-icon">{item.icon}</span>}
            <span className="tab-nav-label">{item.label}</span>
          </button>
        ))}
      </div>
      <div className="tab-content">
        {activeItem?.children}
      </div>
    </div>
  );
};

export default Tab;