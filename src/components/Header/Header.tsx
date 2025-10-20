import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useLocationStore } from '../../stores/locationStore';
import { divisionApi } from '../../api/divisionApi';
import './Header.css';
import NotificationModal from '../NotificationModal/NotificationModal';
import ChatRoomListModal from '../ChatRoomListModal/ChatRoomListModal';
import LocationModalWrapper from '../LocationModal/LocationModalWrapper';

interface HeaderProps {
  onLocationChange?: () => void;
  onNotificationClick?: () => void;
  onFavoriteClick?: () => void;
  onChatClick?: () => void;
  onProfileClick?: () => void;
  notificationCount?: number;
  notificationButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

const Header: React.FC<HeaderProps> = ({
  onLocationChange,
  onNotificationClick,
  onFavoriteClick,
  onChatClick,
  onProfileClick,
  notificationCount = 0,
  notificationButtonRef
}) => {
  const [activeMenu, setActiveMenu] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const internalNotificationButtonRef = useRef<HTMLButtonElement>(null);
  const chatButtonRef = useRef<HTMLButtonElement>(null);

  // Zustand store에서 현재 위치 가져오기
  const currentDivision = useLocationStore((state) => state.currentDivision);
  const isLoadingLocation = useLocationStore((state) => state.isLoading);

  // 위치 표시 텍스트 생성
  const getLocationText = (): string => {
    if (isLoadingLocation) return '위치 확인 중...';
    if (!currentDivision) return '위치 설정';
    return divisionApi.formatDivisionShortName(currentDivision);
  };

  const handleLocationModalClose = () => {
    setIsLocationModalOpen(false);
    onLocationChange?.();
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Hamburger Menu (Mobile) */}
        <button 
          className="hamburger-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="메뉴 열기"
        >
          <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
        </button>

        {/* Logo */}
        <div className="header-logo">
          <a href="/">
            <span className="logo-icon">🛒</span>
            <span className="logo-text">함께 사요</span>
          </a>
        </div>

        {/* Navigation */}
        <nav className={`header-nav ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
          <button className="location-selector" onClick={() => setIsLocationModalOpen(true)}>
            <span className="location-icon">📍</span>
            <span className="location-text">{getLocationText()}</span>
            <span className="location-arrow">▽</span>
          </button>
          
          <a 
            href="/products" 
            className={`nav-link ${activeMenu === 'products' ? 'active' : ''}`}
            onClick={() => {
              setActiveMenu('products');
              setIsMobileMenuOpen(false);
            }}
          >
            공동구매
          </a>
          
          <a 
            href="/community" 
            className={`nav-link ${activeMenu === 'community' ? 'active' : ''}`}
            onClick={() => {
              setActiveMenu('community');
              setIsMobileMenuOpen(false);
            }}
          >
            커뮤니티
          </a>

          {/* Mobile Only - User Actions */}
          <div className="mobile-user-actions">
            {isAuthenticated && (
              <>
                <button
                  className="mobile-menu-item"
                  onClick={() => {
                    setIsNotificationModalOpen(true);
                    setIsMobileMenuOpen(false);
                    onNotificationClick?.();
                  }}
                >
                  <span className="icon">🔔</span>
                  <span>알림</span>
                  {notificationCount > 0 && (
                    <span className="mobile-notification-badge">{notificationCount}</span>
                  )}
                </button>

                <button
                  className="mobile-menu-item"
                  onClick={() => {
                    navigate('/purchase-history?tab=liked');
                    setIsMobileMenuOpen(false);
                    onFavoriteClick?.();
                  }}
                >
                  <span className="icon">♥</span>
                  <span>찜한 상품</span>
                </button>

                <button
                  className="mobile-menu-item"
                  onClick={() => {
                    setIsChatModalOpen(true);
                    setIsMobileMenuOpen(false);
                    onChatClick?.();
                  }}
                >
                  <span className="icon">💬</span>
                  <span>채팅</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Only - Auth Actions */}
          <div className="mobile-auth-section">
            {isAuthenticated ? (
              <>
                <button
                  className="mobile-menu-item"
                  onClick={() => {
                    navigate('/mypage');
                    setIsMobileMenuOpen(false);
                    onProfileClick?.();
                  }}
                >
                  <span className="icon">👤</span>
                  <span>마이페이지</span>
                </button>

                <button
                  className="mobile-menu-item"
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <span>로그아웃</span>
                </button>
              </>
            ) : (
              <a 
                href="/login" 
                className="mobile-menu-item"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                로그인
              </a>
            )}
          </div>
        </nav>

        {/* Right Icons */}
        <div className="header-actions">
          {isAuthenticated ? (
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

              <button
                className="header-logout-btn"
                onClick={logout}
                title="로그아웃"
              >
                로그아웃
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
          setIsChatModalOpen(false);
        }}
      />

      {/* LocationModal */}
      <LocationModalWrapper
        isOpen={isLocationModalOpen}
        onClose={handleLocationModalClose}
      />
    </header>
  );
};

export default Header;