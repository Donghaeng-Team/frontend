import React, { useState, useRef } from 'react';
import Header from '../Header';
import Footer from '../Footer';
import FloatingActionButton from '../FloatingActionButton/FloatingActionButton';
import BottomNav from '../BottomNav';
import type { NotificationItem } from '../NotificationModal';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  isLoggedIn?: boolean;
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
  isLoggedIn,
  notificationCount = 0,
  currentLocation,
  onLocationChange,
  onNotificationClick,
  onFavoriteClick,
  onChatClick,
  onProfileClick
}) => {
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);


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
    setIsNotificationModalOpen(true);
    onNotificationClick?.();
  };



  return (
    <div className="layout">
      <Header
        className="desktop-header"
        notificationCount={notificationCount}
        currentLocation={currentLocation}
        onLocationChange={onLocationChange}
        onNotificationClick={handleNotificationClick}
        onFavoriteClick={onFavoriteClick}
        onChatClick={onChatClick}
        onProfileClick={onProfileClick}
        notificationButtonRef={notificationButtonRef}
        onChatModalStateChange={setIsChatModalOpen}
      />
      <main className="layout-main">
        {children}
      </main>
      <Footer />

      {/* Floating Action Button - 로그인 시에만 표시 */}
      <FloatingActionButton isLoggedIn={isLoggedIn || false} isChatModalOpen={isChatModalOpen} />

      {/* Bottom Navigation - 모바일 전용 */}
      <BottomNav notificationCount={notificationCount} />
    </div>
  );
};

export default Layout;