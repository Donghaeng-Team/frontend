import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts';
import './Header.css';
import NotificationModal from '../NotificationModal/NotificationModal';
import ChatRoomListModal from '../ChatRoomListModal/ChatRoomListModal';
import LocationModal, { type SelectedLocation, type LocationItem } from '../LocationModal/LocationModal';

interface HeaderProps {
  currentLocation?: string;
  onLocationChange?: () => void;
  onNotificationClick?: () => void;
  onFavoriteClick?: () => void;
  onChatClick?: () => void;
  onProfileClick?: () => void;
  notificationCount?: number;
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
  notificationButtonRef
}) => {
  const [activeMenu, setActiveMenu] = useState<string>('');
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const internalNotificationButtonRef = useRef<HTMLButtonElement>(null);
  const chatButtonRef = useRef<HTMLButtonElement>(null);

  // addresses.json 데이터를 사용하는 함수들
  const fetchSidoList = async (): Promise<LocationItem[]> => {
    try {
      const response = await import('../../data/addresses.json');
      const addressData = response.default;

      return addressData.map(sido => ({
        code: sido.code,
        name: sido.name
      }));
    } catch (error) {
      console.error('Failed to load sido data:', error);
      return [];
    }
  };

  const fetchGugunList = async (sidoCode: string): Promise<LocationItem[]> => {
    try {
      const response = await import('../../data/addresses.json');
      const addressData = response.default;

      const sido = addressData.find(s => s.code === sidoCode);
      if (!sido || !sido.sgg) return [];

      return sido.sgg.map(gugun => ({
        code: sidoCode + gugun.code,
        name: gugun.name
      }));
    } catch (error) {
      console.error('Failed to load gugun data:', error);
      return [];
    }
  };

  const fetchDongList = async (gugunCode: string): Promise<LocationItem[]> => {
    try {
      const response = await import('../../data/addresses.json');
      const addressData = response.default;

      // gugunCode는 sidoCode + gugunCode 형태로 되어 있음
      const sidoCode = gugunCode.substring(0, 2);
      const gugunCodeOnly = gugunCode.substring(2);

      const sido = addressData.find(s => s.code === sidoCode);
      if (!sido || !sido.sgg) return [];

      const gugun = sido.sgg.find(g => g.code === gugunCodeOnly);
      if (!gugun || !gugun.emd) return [];

      return gugun.emd.map(dong => ({
        code: gugunCode + dong.code,
        name: dong.name
      }));
    } catch (error) {
      console.error('Failed to load dong data:', error);
      return [];
    }
  };

  const handleLocationConfirm = (location: SelectedLocation) => {
    const locationString = `${location.dong?.name || ''}`;
    // 여기에서 location 상태를 업데이트하거나 상위 컴포넌트로 전달
  };

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
          <button className="location-selector" onClick={() => setIsLocationModalOpen(true)}>
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
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onConfirm={handleLocationConfirm}
        fetchSidoList={fetchSidoList}
        fetchGugunList={fetchGugunList}
        fetchDongList={fetchDongList}
      />
    </header>
  );
};

export default Header;