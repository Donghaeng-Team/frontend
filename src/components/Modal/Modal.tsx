import { type FC, type ReactNode, useEffect } from 'react';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

const Modal: FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className = ''
}) => {
  // 모달 열릴 때 body 스크롤 막기
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // cleanup: 컴포넌트 언마운트 시 스크롤 복원
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={`modal-container ${className}`}>
        {children}
      </div>
    </div>
  );
};

export default Modal;
