import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import './BottomNav.css';

interface BottomNavProps {
  onChatClick?: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ onChatClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleChatClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/chat');
  };

  return (
    <nav className="bottom-nav">
      <button
        className={`bottom-nav-item ${isActive('/products') ? 'active' : ''}`}
        onClick={() => navigate('/products')}
      >
        <span className="bottom-nav-icon">🏠</span>
        <span className="bottom-nav-label">홈</span>
      </button>

      <button
        className={`bottom-nav-item ${isActive('/community') ? 'active' : ''}`}
        onClick={() => navigate('/community')}
      >
        <span className="bottom-nav-icon">💬</span>
        <span className="bottom-nav-label">커뮤니티</span>
      </button>

      <button
        className={`bottom-nav-item ${isActive('/chat') ? 'active' : ''}`}
        onClick={handleChatClick}
      >
        <span className="bottom-nav-icon">💭</span>
        <span className="bottom-nav-label">채팅</span>
      </button>

      <button
        className={`bottom-nav-item ${isActive('/mypage') ? 'active' : ''}`}
        onClick={() => {
          if (isAuthenticated) {
            navigate('/mypage');
          } else {
            navigate('/login');
          }
        }}
      >
        <span className="bottom-nav-icon">👤</span>
        <span className="bottom-nav-label">MY</span>
      </button>
    </nav>
  );
};

export default BottomNav;
