import React from 'react';
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
  onClose?: () => void;
  chatRooms: ChatRoom[];
  onChatRoomClick?: (chatRoomId: string) => void;
}

const ChatRoomListModal: React.FC<ChatRoomListModalProps> = ({
  isOpen,
  onClose,
  chatRooms,
  onChatRoomClick
}) => {
  if (!isOpen) return null;

  const getStatusBadgeClass = (status: ChatRoom['status']) => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'closing':
        return 'status-closing';
      case 'closed':
        return 'status-closed';
      default:
        return '';
    }
  };

  const getStatusText = (status: ChatRoom['status']) => {
    switch (status) {
      case 'active':
        return '진행중';
      case 'closing':
        return '마감임박';
      case 'closed':
        return '마감';
      default:
        return '';
    }
  };

  return (
    <div className="chat-room-modal-overlay" onClick={onClose}>
      <div className="chat-room-modal" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="chat-room-header">
          <h2 className="chat-room-title">💬 참여중인 채팅방</h2>
        </div>

        {/* 채팅방 리스트 */}
        <div className="chat-room-list">
          {chatRooms.map((room) => (
            <div 
              key={room.id} 
              className="chat-room-item"
              onClick={() => onChatRoomClick?.(room.id)}
            >
              {/* 상품 이미지 */}
              <div className="product-image-wrapper">
                {room.productImage ? (
                  <img 
                    src={room.productImage} 
                    alt={room.productName} 
                    className="product-image"
                  />
                ) : (
                  <div className="product-image-placeholder" />
                )}
              </div>

              {/* 채팅 정보 */}
              <div className="chat-info">
                {/* 상단 행 */}
                <div className="chat-info-top">
                  <h3 className="product-name">{room.productName}</h3>
                  <span className="last-message-time">{room.lastMessageTime}</span>
                </div>

                {/* 중단 행 - 마지막 메시지 */}
                <div className="chat-info-middle">
                  <p className="last-message">{room.lastMessage}</p>
                  {room.unreadCount && room.unreadCount > 0 && (
                    <div className="unread-badge">
                      <span className="unread-count">{room.unreadCount}</span>
                    </div>
                  )}
                </div>

                {/* 하단 행 - 뱃지들 */}
                <div className="chat-info-bottom">
                  <div className="participants-badge">
                    <span className="participants-text">
                      👥 {room.participants.current}/{room.participants.max}명
                    </span>
                  </div>
                  <div className={`status-badge ${getStatusBadgeClass(room.status)}`}>
                    <span className="status-text">{getStatusText(room.status)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatRoomListModal;