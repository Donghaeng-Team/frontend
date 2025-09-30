import React from 'react';
import Header from '../Header';
import Footer from '../Footer';
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
  isLoggedIn = false,
  notificationCount = 0,
  currentLocation,
  onLocationChange,
  onNotificationClick,
  onFavoriteClick,
  onChatClick,
  onProfileClick
}) => {
  return (
    <div className="layout">
      <Header
        isLoggedIn={isLoggedIn}
        notificationCount={notificationCount}
        currentLocation={currentLocation}
        onLocationChange={onLocationChange}
        onNotificationClick={onNotificationClick}
        onFavoriteClick={onFavoriteClick}
        onChatClick={onChatClick}
        onProfileClick={onProfileClick}
      />
      <main className="layout-main">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;