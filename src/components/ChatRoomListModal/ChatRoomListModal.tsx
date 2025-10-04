import type { FC } from 'react';
import './ChatRoomListModal.css';

export interface ChatRoom {
  id: string;
  productName: string;
  productImage?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount?: number;
  participants: {
    current: number;
    max: number;
  };
  status: 'active' | 'closing' | 'closed';
}

interface ChatRoomListModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatRooms: ChatRoom[];
  onRoomClick: (roomId: string) => void;
  className?: string;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

const ChatRoomListModal: FC<ChatRoomListModalProps> = ({
  isOpen,
  onClose,
  chatRooms,
  onRoomClick,
  className = '',
  triggerRef
}) => {
  console.log('ChatRoomListModal rendered:', { isOpen, chatRoomsLength: chatRooms.length });

  if (!isOpen) return null;

  const getModalPosition = () => {
    if (!triggerRef?.current) {
      console.log('ChatRoomListModal: triggerRef not found, using fallback position');
      return { top: '100px', right: '20px' };
    }

    const rect = triggerRef.current.getBoundingClientRect();
    console.log('ChatRoomListModal: Button rect:', rect);

    const position = {
      top: `${rect.bottom + 10}px`,
      right: `${window.innerWidth - rect.right}px`,
      minWidth: '420px'
    };

    console.log('ChatRoomListModal: Calculated position:', position);
    return position;
  };

  const modalPosition = getModalPosition();

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getStatusInfo = (status: ChatRoom['status']) => {
    switch (status) {
      case 'active':
        return { label: '진행중', color: '#339933', bgColor: '#e5ffe5' };
      case 'closing':
        return { label: '마감임박', color: '#cc6633', bgColor: '#fff2e5' };
      case 'closed':
        return { label: '마감', color: '#fafafa', bgColor: '#666666' };
      default:
        return { label: '진행중', color: '#339933', bgColor: '#e5ffe5' };
    }
  };

  console.log('ChatRoomListModal returning positioned modal with isOpen:', isOpen);

  return (
    <div className="chat-room-modal-overlay" onClick={handleOverlayClick}>
      <div
        className={`chat-room-list-modal ${className}`}
        style={{
          position: 'fixed',
          top: modalPosition.top,
          right: modalPosition.right,
          minWidth: 'minWidth' in modalPosition ? modalPosition.minWidth : undefined
        }}
      >
        {/* 헤더 */}
        <div className="chat-room-list-header">
          <h2 className="chat-room-list-title">💬 참여중인 채팅방</h2>
          <button
            className="chat-room-modal-close"
            onClick={onClose}
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* 채팅방 목록 */}
        <div className="chat-room-list-content">
          {chatRooms.length === 0 ? (
            <div className="chat-room-list-empty">
              <span className="chat-room-empty-icon">💬</span>
              <p className="chat-room-empty-text">참여중인 채팅방이 없습니다</p>
            </div>
          ) : (
            <div className="chat-room-list">
              {chatRooms.map((room) => {
                const statusInfo = getStatusInfo(room.status);

                return (
                  <div
                    key={room.id}
                    className="chat-room-item"
                    onClick={() => onRoomClick(room.id)}
                  >
                    <div className="chat-room-image-wrapper">
                      {room.productImage ? (
                        <img
                          src={room.productImage}
                          alt={room.productName}
                          className="chat-room-image"
                        />
                      ) : (
                        <div className="chat-room-image-placeholder" />
                      )}
                    </div>

                    <div className="chat-room-info">
                      <div className="chat-room-top-row">
                        <h3 className="chat-room-product-name">{room.productName}</h3>
                        <span className="chat-room-time">{room.lastMessageTime}</span>
                      </div>

                      <div className="chat-room-message-row">
                        <p className="chat-room-last-message">{room.lastMessage}</p>
                        {room.unreadCount && room.unreadCount > 0 && (
                          <div className="chat-room-unread-badge">
                            <span className="chat-room-unread-count">{room.unreadCount}</span>
                          </div>
                        )}
                      </div>

                      <div className="chat-room-bottom-row">
                        <div className="chat-room-participants-badge">
                          <span className="chat-room-participants-text">
                            👥 {room.participants.current}/{room.participants.max}명
                          </span>
                        </div>
                        <div
                          className="chat-room-status-badge"
                          style={{
                            backgroundColor: statusInfo.bgColor,
                            color: statusInfo.color
                          }}
                        >
                          <span className="chat-room-status-text">{statusInfo.label}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatRoomListModal;