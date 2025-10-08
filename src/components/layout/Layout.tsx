import React, { useState, useRef } from 'react';
import Header from '../Header';
import Footer from '../Footer';
import type { NotificationItem } from '../NotificationModal';
import type { ChatRoom } from '../ChatRoomListModal';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  notificationCount?: number;
  currentLocation?: string;
  onLocationChange?: () => void;
  onNotificationClick?: () => void;
  onFavoriteClick?: () => void;
  onChatClick?: () => void;
  onProfileClick?: () => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  notificationCount = 0,
  currentLocation,
  onLocationChange,
  onNotificationClick,
  onFavoriteClick,
  onChatClick,
  onProfileClick
}) => {
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isChatRoomListModalOpen, setIsChatRoomListModalOpen] = useState(false);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);

  console.log('Layout rendered:', {
    isNotificationModalOpen,
    isChatRoomListModalOpen
  });

  // 샘플 알림 데이터
  const sampleNotifications: NotificationItem[] = [
    {
      id: '1',
      type: 'completed',
      icon: '✅',
      title: '공동구매 완료',
      content: '제주 감귤 10kg 공동구매가 성공적으로 완료되었습니다.',
      time: '10분 전'
    },
    {
      id: '2',
      type: 'message',
      icon: '💬',
      title: '새로운 메시지',
      content: '사과 공동구매에서 새로운 메시지가 도착했습니다.',
      time: '1시간 전'
    },
    {
      id: '3',
      type: 'deadline',
      icon: '⏰',
      title: '마감 임박',
      content: '유기농 사과 공동구매 마감까지 2시간 남았습니다.',
      time: '2시간 전'
    }
  ];

  const handleNotificationClick = () => {
    console.log('handleNotificationClick called in Layout!');
    setIsNotificationModalOpen(true);
    onNotificationClick?.();
  };

  const handleNotificationItemClick = (notification: NotificationItem) => {
    console.log('Notification clicked:', notification);
    setIsNotificationModalOpen(false);
  };

  const handleMarkAllRead = () => {
    console.log('Mark all as read');
  };

  // 샘플 채팅방 데이터
  const sampleChatRooms: ChatRoom[] = [
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

  const handleChatClick = () => {
    console.log('handleChatClick called in Layout!');
    setIsChatRoomListModalOpen(true);
    onChatClick?.();
  };

  const handleChatRoomClick = (roomId: string) => {
    console.log('Chat room clicked:', roomId);
    setIsChatRoomListModalOpen(false);
  };

  return (
    <div className="layout">
      <Header
        notificationCount={notificationCount}
        currentLocation={currentLocation}
        onLocationChange={onLocationChange}
        onNotificationClick={handleNotificationClick}
        onFavoriteClick={onFavoriteClick}
        onChatClick={handleChatClick}
        onProfileClick={onProfileClick}
        notificationButtonRef={notificationButtonRef}
      />
      <main className="layout-main">
        {children}
      </main>
      <Footer />
      
      {/* 알림 모달 */}
      {isNotificationModalOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255,0,0,0.8)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => {
            console.log('NotificationModal closing');
            setIsNotificationModalOpen(false);
          }}
        >
          <div 
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '20px',
              maxWidth: '400px',
              width: '90vw',
              maxHeight: '80vh',
              overflow: 'auto',
              border: '5px solid #00ff00'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>
              🔔 알림
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sampleNotifications.map((notification) => (
                <div
                  key={notification.id}
                  style={{
                    padding: '16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: '#f9f9f9'
                  }}
                  onClick={() => handleNotificationItemClick(notification)}
                >
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                    {notification.icon} {notification.title}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                    {notification.content}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    {notification.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* 채팅방 목록 모달 */}
      {isChatRoomListModalOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255,0,0,0.8)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => {
            console.log('ChatRoomListModal closing');
            setIsChatRoomListModalOpen(false);
          }}
        >
          <div 
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '20px',
              maxWidth: '600px',
              width: '90vw',
              maxHeight: '80vh',
              overflow: 'auto',
              border: '5px solid #0000ff'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>
              💬 참여중인 채팅방
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sampleChatRooms.map((room) => (
                <div
                  key={room.id}
                  style={{
                    padding: '16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: '#f9f9f9'
                  }}
                  onClick={() => handleChatRoomClick(room.id)}
                >
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                    {room.productName}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                    {room.lastMessage}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    {room.lastMessageTime} • {room.participants.current}/{room.participants.max}명
                    {room.unreadCount && room.unreadCount > 0 && (
                      <span style={{ 
                        backgroundColor: '#ff4444', 
                        color: 'white', 
                        borderRadius: '10px', 
                        padding: '2px 6px', 
                        fontSize: '10px',
                        marginLeft: '8px'
                      }}>
                        {room.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;