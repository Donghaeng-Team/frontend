import React from 'react';
import './NotificationModal.css';

export interface NotificationItem {
  id: string;
  type: 'completed' | 'message' | 'deadline';
  icon: string;
  title: string;
  content: string;
  time: string;
}

export interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications?: NotificationItem[];
  onNotificationClick?: (notification: NotificationItem) => void;
  onMarkAllRead?: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications = [],
  onNotificationClick,
  onMarkAllRead,
  triggerRef
}) => {
  if (!isOpen) return null;

  const getModalPosition = () => {
    // 모바일에서는 위치 계산하지 않음 (CSS에서 전체화면으로 처리)
    if (window.innerWidth <= 768) {
      return null;
    }

    if (!triggerRef?.current) {
      return { top: '100px', right: '20px' };
    }

    const rect = triggerRef.current.getBoundingClientRect();

    return {
      top: `${rect.bottom + 10}px`,
      right: `${window.innerWidth - rect.right}px`,
      minWidth: '380px'
    };
  };

  const modalPosition = getModalPosition();

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'completed':
        return '#3366ff';
      case 'message':
        return '#ff6633';
      case 'deadline':
        return '#cc6633';
      default:
        return '#333333';
    }
  };

  return (
    <div className="notification-modal-overlay" onClick={handleOverlayClick}>
      <div
        className="notification-modal"
        style={modalPosition ? {
          position: 'fixed',
          top: modalPosition.top,
          right: modalPosition.right,
          minWidth: 'minWidth' in modalPosition ? modalPosition.minWidth : undefined
        } : undefined}
      >
        {/* 헤더 */}
        <div className="notification-modal-header">
          <h2 className="notification-modal-title">🔔 알림</h2>
          <div className="notification-modal-actions">
            {notifications.length > 0 && onMarkAllRead && (
              <button
                className="notification-mark-all-read"
                onClick={onMarkAllRead}
              >
                모두 읽음
              </button>
            )}
            <button
              className="notification-modal-close"
              onClick={onClose}
              aria-label="닫기"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 알림 목록 */}
        <div className="notification-list-container">
          {notifications.length === 0 ? (
            <div className="notification-empty">
              <span className="notification-empty-icon">🔔</span>
              <p className="notification-empty-text">새로운 알림이 없습니다</p>
            </div>
          ) : (
            <div className="notification-list">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="notification-item"
                  onClick={() => onNotificationClick?.(notification)}
                >
                  <div className="notification-item-header">
                    <span
                      className="notification-type"
                      style={{ color: getTypeColor(notification.type) }}
                    >
                      {notification.icon} {notification.title}
                    </span>
                  </div>
                  <p className="notification-content">{notification.content}</p>
                  <span className="notification-time">{notification.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;