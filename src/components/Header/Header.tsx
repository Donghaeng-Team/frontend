import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import NotificationModal from '../NotificationModal/NotificationModal';
import ChatRoomListModal from '../ChatRoomListModal/ChatRoomListModal';

interface HeaderProps {
  currentLocation?: string;
  onLocationChange?: () => void;
  onNotificationClick?: () => void;
  onFavoriteClick?: () => void;
  onChatClick?: () => void;
  onProfileClick?: () => void;
  notificationCount?: number;
  isLoggedIn?: boolean;
  notificationButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

const Header: React.FC<HeaderProps> = ({
  currentLocation = '문래동 5가',
  onLocationChange,
  onNotificationClick,
  onFavoriteClick,
  onChatClick,
  onProfileClick,
  notificationCount = 0,
  isLoggedIn = false,
  notificationButtonRef
}) => {
  const [activeMenu, setActiveMenu] = useState<string>('');
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const navigate = useNavigate();
  const internalNotificationButtonRef = useRef<HTMLButtonElement>(null);
  const chatButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="header-logo">
          <a href="/">
            <span className="logo-icon">🛒</span>
            <span className="logo-text">함께 사요</span>
          </a>
        </div>

        {/* Navigation */}
        <nav className="header-nav">
          <button className="location-selector" onClick={onLocationChange}>
            <span className="location-icon">📍</span>
            <span className="location-text">{currentLocation}</span>
            <span className="location-arrow">▽</span>
          </button>
          
          <a 
            href="/products" 
            className={`nav-link ${activeMenu === 'products' ? 'active' : ''}`}
            onClick={() => setActiveMenu('products')}
          >
            공동구매
          </a>
          
          <a 
            href="/community" 
            className={`nav-link ${activeMenu === 'community' ? 'active' : ''}`}
            onClick={() => setActiveMenu('community')}
          >
            커뮤니티
          </a>
        </nav>

        {/* Right Icons */}
        <div className="header-actions">
          {isLoggedIn ? (
            <>
              <button
                ref={internalNotificationButtonRef}
                className="header-icon-btn"
                onClick={() => {
                  setIsNotificationModalOpen(true);
                  onNotificationClick?.();
                }}
              >
                <span className="icon">🔔</span>
                {notificationCount > 0 && (
                  <span className="notification-badge">{notificationCount}</span>
                )}
              </button>
              
              <button
                className="header-icon-btn"
                onClick={() => {
                  navigate('/purchase-history?tab=liked');
                  onFavoriteClick?.();
                }}
              >
                <span className="icon">♥</span>
              </button>

              <button
                ref={chatButtonRef}
                className="header-icon-btn"
                onClick={() => {
                  setIsChatModalOpen(true);
                  onChatClick?.();
                }}
              >
                <span className="icon">💬</span>
              </button>
              
              <button 
                className="header-icon-btn" 
                onClick={() => {
                  navigate('/mypage');
                  onProfileClick?.();
                }}
              >
                <span className="icon">👤</span>
              </button>
            </>
          ) : (
            <a href="/login" className="header-login-btn">로그인</a>
          )}
        </div>
      </div>

      {/* NotificationModal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        triggerRef={internalNotificationButtonRef}
        notifications={[
          {
            id: '1',
            type: 'completed',
            icon: '✅',
            title: '구매 완료',
            content: '공동구매가 성공적으로 완료되었습니다.',
            time: '방금 전'
          },
          {
            id: '2',
            type: 'message',
            icon: '💬',
            title: '새 메시지',
            content: '채팅방에 새로운 메시지가 도착했습니다.',
            time: '5분 전'
          }
        ]}
      />

      {/* ChatRoomListModal */}
      <ChatRoomListModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        triggerRef={chatButtonRef}
        chatRooms={[
          {
            id: '1',
            productName: '신선한 유기농 사과',
            lastMessage: '내일 픽업 가능한가요?',
            lastMessageTime: '15:30',
            unreadCount: 2,
            participants: { current: 5, max: 10 },
            status: 'active'
          },
          {
            id: '2',
            productName: '프리미엄 쌀 10kg',
            lastMessage: '공동구매 성공했습니다!',
            lastMessageTime: '14:22',
            participants: { current: 8, max: 8 },
            status: 'closing'
          }
        ]}
        onRoomClick={(roomId) => {
          console.log('채팅방 클릭:', roomId);
          setIsChatModalOpen(false);
        }}
      />
    </header>
  );
};

export default Header;