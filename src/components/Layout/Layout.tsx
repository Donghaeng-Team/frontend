import React, { useState, useRef } from 'react';
import Header from '../Header';
import Footer from '../Footer';
import FloatingActionButton from '../FloatingActionButton/FloatingActionButton';
import type { NotificationItem } from '../NotificationModal';
import type { ChatRoom } from '../ChatRoomListModal';
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
  const [isChatRoomListModalOpen, setIsChatRoomListModalOpen] = useState(false);
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
    setIsChatRoomListModalOpen(true);
    onChatClick?.();
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

      {/* Floating Action Button - 로그인 시에만 표시 */}
      <FloatingActionButton isLoggedIn={isLoggedIn || false} />
    </div>
  );
};

export default Layout;