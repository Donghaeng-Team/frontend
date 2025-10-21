import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatRoom from '../../components/ChatRoom';
import type { ChatMessage } from '../../components/ChatRoom';
import BottomNav from '../../components/BottomNav';
import type { ChatRoom as ChatRoomType } from '../../components/ChatRoomListModal';
import './ChatList.css';

const ChatList: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
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

  // 샘플 채팅방 데이터
  const sampleChatRooms: ChatRoomType[] = [
    {
      id: '1',
      productName: '제주 감귤 10kg 공동구매',
      productImage: '',
      lastMessage: '판매자: 현재 7명 참여중입니다! ...',
      lastMessageTime: '2시간 전',
      unreadCount: 3,
      participants: { current: 7, max: 10 },
      status: 'active'
    },
    {
      id: '2',
      productName: '애플 에어팟 프로 공동구매',
      lastMessage: '구매자: 배송은 언제쯤 받을 수...',
      lastMessageTime: '30분 전',
      unreadCount: 1,
      participants: { current: 5, max: 8 },
      status: 'active'
    },
    {
      id: '3',
      productName: '스타벅스 텀블러 공동구매',
      lastMessage: '판매자: 마감 임박! 2명만 더 모집...',
      lastMessageTime: '1시간 전',
      participants: { current: 18, max: 20 },
      status: 'closing'
    }
  ];

  const handleRoomSelect = (roomId: string) => {
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

  const selectedRoom = sampleChatRooms.find(room => room.id === selectedRoomId);

  const getStatusInfo = (status: ChatRoomType['status']) => {
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

  return (
    <>
      <div className="chat-list-page">
        {selectedRoomId && selectedRoom ? (
          <ChatRoom
            role="buyer"
            productInfo={{
              name: selectedRoom.productName,
              price: 15000,
              image: selectedRoom.productImage
            }}
            recruitmentStatus={{
              current: selectedRoom.participants.current,
              max: selectedRoom.participants.max,
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
              {sampleChatRooms.length === 0 ? (
                <div className="chat-list-empty">
                  <span className="chat-empty-icon">💬</span>
                  <p className="chat-empty-text">참여중인 채팅방이 없습니다</p>
                </div>
              ) : (
                <div className="chat-list">
                  {sampleChatRooms.map((room) => {
                    const statusInfo = getStatusInfo(room.status);

                    return (
                      <div
                        key={room.id}
                        className="chat-item"
                        onClick={() => handleRoomSelect(room.id)}
                      >
                        <div className="chat-image-wrapper">
                          {room.productImage ? (
                            <img
                              src={room.productImage}
                              alt={room.productName}
                              className="chat-image"
                            />
                          ) : (
                            <div className="chat-image-placeholder" />
                          )}
                        </div>

                        <div className="chat-info">
                          <div className="chat-top-row">
                            <h3 className="chat-product-name">{room.productName}</h3>
                            <span className="chat-time">{room.lastMessageTime}</span>
                          </div>

                          <div className="chat-message-row">
                            <p className="chat-last-message">{room.lastMessage}</p>
                            {room.unreadCount && room.unreadCount > 0 && (
                              <div className="chat-unread-badge">
                                <span className="chat-unread-count">{room.unreadCount}</span>
                              </div>
                            )}
                          </div>

                          <div className="chat-bottom-row">
                            <div className="chat-participants-badge">
                              <span className="chat-participants-text">
                                👥 {room.participants.current}/{room.participants.max}명
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
