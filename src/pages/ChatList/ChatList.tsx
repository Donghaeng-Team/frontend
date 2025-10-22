import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatRoom from '../../components/ChatRoom';
import type { ChatMessage } from '../../components/ChatRoom';
import BottomNav from '../../components/BottomNav';
import type { ChatRoom as ChatRoomType } from '../../components/ChatRoomListModal';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import './ChatList.css';

const ChatList: React.FC = () => {
  const navigate = useNavigate();
  const { chatRooms, chatRoomsLoading, fetchChatRooms, error } = useChatStore();
  const { user } = useAuthStore();
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'system',
      content: '채팅방이 시작되었습니다.'
    },
    {
      id: '2',
      type: 'seller',
      content: '안녕하세요! 공동구매에 참여해주셔서 감사합니다.',
      sender: { name: '판매자', isSeller: true },
      timestamp: '14:30'
    },
    {
      id: '3',
      type: 'buyer',
      content: '언제 배송되나요?',
      sender: { name: '구매자1' },
      timestamp: '14:32'
    }
  ]);

  // 채팅방 목록 로드
  useEffect(() => {
    fetchChatRooms();
  }, [fetchChatRooms]);

  const handleRoomSelect = (roomId: number) => {
    setSelectedRoomId(roomId);
  };

  const handleBackToList = () => {
    setSelectedRoomId(null);
  };

  const handleSendMessage = (message: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'my',
      content: message,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, newMessage]);
  };

  const handleLeave = () => {
    setSelectedRoomId(null);
  };

  const selectedRoom = chatRooms.find(room => room.id === selectedRoomId);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'RECRUITING':
        return { label: '진행중', color: '#339933', bgColor: '#e5ffe5' };
      case 'RECRUITMENT_CLOSED':
        return { label: '마감임박', color: '#cc6633', bgColor: '#fff2e5' };
      case 'COMPLETED':
      case 'CANCELLED':
        return { label: '마감', color: '#666666', bgColor: '#fafafa' };
      default:
        return { label: '진행중', color: '#339933', bgColor: '#e5ffe5' };
    }
  };

  const formatLastMessageTime = (timestamp: string | null) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  return (
    <>
      <div className="chat-list-page">
        {selectedRoomId && selectedRoom ? (
          <ChatRoom
            role="buyer"
            productInfo={{
              name: selectedRoom.title,
              price: 15000,
              image: selectedRoom.thumbnailUrl
            }}
            recruitmentStatus={{
              current: selectedRoom.currentBuyers,
              max: selectedRoom.maxBuyers,
              timeRemaining: '2시간 30분',
              status: selectedRoom.status
            }}
            messages={messages}
            onBack={handleBackToList}
            onLeave={handleLeave}
            onSendMessage={handleSendMessage}
            onApply={() => console.log('구매 신청')}
          />
        ) : (
          <div className="chat-list-container">
            {/* 헤더 */}
            <div className="chat-list-header">
              <h2 className="chat-list-title">💬 참여중인 채팅방</h2>
            </div>

            {/* 채팅방 목록 */}
            <div className="chat-list-content">
              {chatRoomsLoading ? (
                <div className="chat-list-empty">
                  <p className="chat-empty-text">로딩중...</p>
                </div>
              ) : chatRooms.length === 0 ? (
                <div className="chat-list-empty">
                  <span className="chat-empty-icon">💬</span>
                  <p className="chat-empty-text">참여중인 채팅방이 없습니다</p>
                </div>
              ) : (
                <div className="chat-list">
                  {chatRooms.map((room) => {
                    const statusInfo = getStatusInfo(room.status);

                    return (
                      <div
                        key={room.id}
                        className="chat-item"
                        onClick={() => handleRoomSelect(room.id)}
                      >
                        <div className="chat-image-wrapper">
                          {room.thumbnailUrl ? (
                            <img
                              src={room.thumbnailUrl}
                              alt={room.title}
                              className="chat-image"
                            />
                          ) : (
                            <div className="chat-image-placeholder" />
                          )}
                        </div>

                        <div className="chat-info">
                          <div className="chat-top-row">
                            <h3 className="chat-product-name">{room.title}</h3>
                            <span className="chat-time">{formatLastMessageTime(room.lastMessageAt)}</span>
                          </div>

                          <div className="chat-message-row">
                            <p className="chat-last-message">{room.lastMessage || '메시지 없음'}</p>
                            {room.unreadCount && room.unreadCount > 0 && (
                              <div className="chat-unread-badge">
                                <span className="chat-unread-count">{room.unreadCount}</span>
                              </div>
                            )}
                          </div>

                          <div className="chat-bottom-row">
                            <div className="chat-participants-badge">
                              <span className="chat-participants-text">
                                👥 {room.currentBuyers}/{room.maxBuyers}명
                              </span>
                            </div>
                            <div
                              className="chat-status-badge"
                              style={{
                                backgroundColor: statusInfo.bgColor,
                                color: statusInfo.color
                              }}
                            >
                              <span className="chat-status-text">{statusInfo.label}</span>
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
        )}
      </div>
      <BottomNav notificationCount={0} />
    </>
  );
};

export default ChatList;
