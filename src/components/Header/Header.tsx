import React, { useState } from 'react';
import './Header.css';

interface HeaderProps {
  currentLocation?: string;
  onLocationChange?: () => void;
  onNotificationClick?: () => void;
  onFavoriteClick?: () => void;
  onChatClick?: () => void;
  onProfileClick?: () => void;
  notificationCount?: number;
  isLoggedIn?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  currentLocation = '문래동 5가',
  onLocationChange,
  onNotificationClick,
  onFavoriteClick,
  onChatClick,
  onProfileClick,
  notificationCount = 0,
  isLoggedIn = false
}) => {
  const [activeMenu, setActiveMenu] = useState<string>('');

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
              <button className="header-icon-btn" onClick={onNotificationClick}>
                <span className="icon">🔔</span>
                {notificationCount > 0 && (
                  <span className="notification-badge">{notificationCount}</span>
                )}
              </button>
              
              <button className="header-icon-btn" onClick={onFavoriteClick}>
                <span className="icon">♥</span>
              </button>
              
              <button className="header-icon-btn" onClick={onChatClick}>
                <span className="icon">💬</span>
              </button>
              
              <button className="header-icon-btn" onClick={onProfileClick}>
                <span className="icon">👤</span>
              </button>
            </>
          ) : (
            <a href="/login" className="header-login-btn">로그인</a>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;