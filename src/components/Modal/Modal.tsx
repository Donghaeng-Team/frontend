import type { FC, ReactNode } from 'react';
import { useEffect } from 'react';
import './Modal.css';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'small' | 'medium' | 'large' | 'full';
  closeOnOverlay?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

const Modal: FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'medium',
  closeOnOverlay = true,
  showCloseButton = true,
  className = ''
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  console.log('Modal rendering:', { isOpen, title, size });
  
  // DOM에 실제로 렌더링되는지 확인
  if (isOpen) {
    console.log('Modal should be visible in DOM');
    setTimeout(() => {
      const modalOverlay = document.querySelector('.modal-overlay');
      const modal = document.querySelector('.modal');
      console.log('DOM elements found:', { modalOverlay, modal });
      if (modalOverlay) {
        console.log('Modal overlay styles:', window.getComputedStyle(modalOverlay));
      }
      if (modal) {
        console.log('Modal styles:', window.getComputedStyle(modal));
      }
    }, 100);
  }

  const handleOverlayClick = () => {
    if (closeOnOverlay) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div 
        className={`modal modal-${size} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="modal-header">
            {title && <h2 className="modal-title">{title}</h2>}
            {showCloseButton && (
              <button className="modal-close" onClick={onClose}>
                ✕
              </button>
            )}
          </div>
        )}
        
        <div className="modal-body">{children}</div>
        
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;