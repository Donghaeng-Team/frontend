// src/components/Breadcrumb/Breadcrumb.tsx
import type { FC, ReactNode } from 'react';
import './Breadcrumb.css';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  className?: string;
  onClick?: (item: BreadcrumbItem, index: number) => void;
}

const Breadcrumb: FC<BreadcrumbProps> = ({
  items,
  separator = '/',
  className = '',
  onClick
}) => {
  const handleClick = (item: BreadcrumbItem, index: number) => {
    if (onClick) {
      onClick(item, index);
    } else if (item.href) {
      window.location.href = item.href;
    }
  };

  return (
    <nav className={`breadcrumb ${className}`} aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} className="breadcrumb-item">
              {item.icon && (
                <span className="breadcrumb-icon">{item.icon}</span>
              )}
              
              {isLast ? (
                <span className="breadcrumb-current" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <>
                  <a
                    href={item.href || '#'}
                    className="breadcrumb-link"
                    onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                      e.preventDefault();
                      handleClick(item, index);
                    }}
                  >
                    {item.label}
                  </a>
                  <span className="breadcrumb-separator" aria-hidden="true">
                    {separator}
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;