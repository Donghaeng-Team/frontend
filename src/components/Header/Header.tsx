import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useLocationStore } from '../../stores/locationStore';
import { useChatStore } from '../../stores/chatStore';
import { divisionApi } from '../../api/divisionApi';
import { transformChatRoomsForUI } from '../../utils/chatUtils';
import './Header.css';
import NotificationModal from '../NotificationModal/NotificationModal';
import ChatModal from '../ChatModal';
import LocationModalWrapper from '../LocationModal/LocationModalWrapper';

interface HeaderProps {
  onLocationChange?: () => void;
  onNotificationClick?: () => void;
  onFavoriteClick?: () => void;
  onChatClick?: () => void;
  onProfileClick?: () => void;
  notificationCount?: number;
  chatNotificationCount?: number;
  notificationButtonRef?: React.RefObject<HTMLButtonElement | null>;
  onChatModalStateChange?: (isOpen: boolean) => void;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  onLocationChange,
  onNotificationClick,
  onFavoriteClick,
  onChatClick,
  onProfileClick,
  notificationCount = 0,
  chatNotificationCount = 0,
  notificationButtonRef,
  onChatModalStateChange,
  className = ''
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

  // Zustand store에서 채팅방 목록 가져오기
  const { chatRooms: chatRoomsFromStore, chatRoomsLoading, fetchChatRooms } = useChatStore();

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

  // ChatModal 상태 변경 시 Layout에 알림
  useEffect(() => {
    onChatModalStateChange?.(isChatModalOpen);
  }, [isChatModalOpen, onChatModalStateChange]);

  // 채팅방 목록 로드 (모달이 열릴 때만)
  useEffect(() => {
    if (isChatModalOpen && isAuthenticated) {
      fetchChatRooms();
    }
  }, [isChatModalOpen, isAuthenticated, fetchChatRooms]);

  // ChatRoomResponse를 ChatRoom 타입으로 변환
  const chatRooms = transformChatRoomsForUI(chatRoomsFromStore);

  const handleChatClick = () => {
    // 화면 크기 확인
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      // 모바일: 페이지로 이동
      navigate('/chat');
    } else {
      // 데스크톱: 모달 열기
      setIsChatModalOpen(true);
    }
    onChatClick?.();
  };



  return (
    <header className={`header ${className}`}>
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
                    handleChatClick();
                    setIsMobileMenuOpen(false);
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
              {/* 알림 기능 추후 구현 예정
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
              */}

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
                onClick={handleChatClick}
              >
                <span className="icon">💬</span>
                {chatNotificationCount > 0 && (
                  <span className="notification-badge">{chatNotificationCount}</span>
                )}
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



      {/* ChatModal - 데스크톱 전용 */}
      <ChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        triggerRef={chatButtonRef}
        chatRooms={chatRooms}
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