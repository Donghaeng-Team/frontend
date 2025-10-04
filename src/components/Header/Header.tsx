import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const navigate = useNavigate();
  const internalNotificationButtonRef = useRef<HTMLButtonElement>(null);
  const chatButtonRef = useRef<HTMLButtonElement>(null);

  // 임시 API 함수들 (실제로는 API 서비스에서 가져와야 함)
  const fetchSidoList = async (): Promise<LocationItem[]> => {
    return [
      { code: '11', name: '서울특별시' },
      { code: '26', name: '부산광역시' },
      { code: '27', name: '대구광역시' },
      { code: '28', name: '인천광역시' },
      { code: '29', name: '광주광역시' },
      { code: '30', name: '대전광역시' },
      { code: '31', name: '울산광역시' },
      { code: '41', name: '경기도' },
      { code: '42', name: '강원도' },
      { code: '43', name: '충청북도' },
    ];
  };

  const fetchGugunList = async (sidoCode: string): Promise<LocationItem[]> => {
    if (sidoCode === '11') { // 서울
      return [
        { code: '11110', name: '종로구' },
        { code: '11140', name: '중구' },
        { code: '11170', name: '용산구' },
        { code: '11200', name: '성동구' },
        { code: '11215', name: '광진구' },
        { code: '11230', name: '동대문구' },
        { code: '11260', name: '중랑구' },
        { code: '11290', name: '성북구' },
        { code: '11305', name: '강북구' },
        { code: '11320', name: '도봉구' },
        { code: '11350', name: '노원구' },
        { code: '11380', name: '은평구' },
        { code: '11410', name: '서대문구' },
        { code: '11440', name: '마포구' },
        { code: '11470', name: '양천구' },
        { code: '11500', name: '강서구' },
        { code: '11530', name: '구로구' },
        { code: '11545', name: '금천구' },
        { code: '11560', name: '영등포구' },
        { code: '11590', name: '동작구' },
        { code: '11620', name: '관악구' },
        { code: '11650', name: '서초구' },
        { code: '11680', name: '강남구' },
        { code: '11710', name: '송파구' },
        { code: '11740', name: '강동구' },
      ];
    }
    return [];
  };

  const fetchDongList = async (gugunCode: string): Promise<LocationItem[]> => {
    if (gugunCode === '11440') { // 마포구
      return [
        { code: '1144010100', name: '공덕동' },
        { code: '1144010200', name: '아현동' },
        { code: '1144010300', name: '용강동' },
        { code: '1144010400', name: '대흥동' },
        { code: '1144010500', name: '염리동' },
        { code: '1144010600', name: '신수동' },
        { code: '1144010700', name: '서강동' },
        { code: '1144010800', name: '문래동' },
        { code: '1144010900', name: '당인동' },
        { code: '1144011000', name: '도화동' },
        { code: '1144011100', name: '마포동' },
        { code: '1144011200', name: '동교동' },
        { code: '1144011300', name: '합정동' },
        { code: '1144011400', name: '망원동' },
        { code: '1144011500', name: '연남동' },
        { code: '1144011600', name: '성산동' },
        { code: '1144011700', name: '상암동' },
      ];
    }
    return [];
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