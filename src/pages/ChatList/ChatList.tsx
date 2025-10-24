import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import './ChatList.css';

const ChatList: React.FC = () => {
  const navigate = useNavigate();
  const { chatRooms, chatRoomsLoading, fetchChatRooms, error } = useChatStore();
  const { user } = useAuthStore();

  // 채팅방 목록 로드
  useEffect(() => {
    fetchChatRooms();
  }, [fetchChatRooms]);

  const handleRoomSelect = (roomId: number) => {
    navigate(`/chat/${roomId}`);
  };

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
                            <p className="chat-last-message">최근 메시지</p>
                            {/* TODO: 백엔드에서 lastMessage와 unreadCount API 지원 필요 */}
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
      </div>
      <BottomNav />
    </>
  );
};

export default ChatList;
