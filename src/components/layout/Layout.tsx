import React, { useRef } from 'react';
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
  className?: string;
  showFooter?: boolean;
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
  onProfileClick,
  className = '',
  showFooter = true
}) => {
  const notificationButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className={`layout ${className}`}>
      <Header
        isLoggedIn={isLoggedIn}
        notificationCount={notificationCount}
        currentLocation={currentLocation}
        onLocationChange={onLocationChange}
        onNotificationClick={onNotificationClick}
        onFavoriteClick={onFavoriteClick}
        onChatClick={onChatClick}
        onProfileClick={onProfileClick}
        notificationButtonRef={notificationButtonRef}
      />
      <main className="layout-main" role="main">
        <div className="layout-content">
          {children}
        </div>
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;