import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FloatingActionButton.css';

interface FloatingActionButtonProps {
  isLoggedIn: boolean;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // 로그인하지 않은 경우 렌더링하지 않음
  if (!isLoggedIn) {
    return null;
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    setIsOpen(false);
  };

  const handleNavigateToCommunity = () => {
    navigate('/community/create');
    setIsOpen(false);
  };

  const handleNavigateToProduct = () => {
    navigate('/products/create');
    setIsOpen(false);
  };

  return (
    <>
      {/* 배경 오버레이 (열렸을 때만 표시) */}
      {isOpen && (
        <div className="fab-overlay" onClick={() => setIsOpen(false)} />
      )}

      <div className="fab-container">
        {/* 서브 버튼들 */}
        <div className={`fab-actions ${isOpen ? 'fab-actions-open' : ''}`}>
          {/* 맨 위로 가기 */}
          <div className="fab-action-item">
            <span className="fab-label">맨 위로</span>
            <button
              className="fab-action-button"
              onClick={handleScrollToTop}
              aria-label="맨 위로 가기"
            >
              ⬆️
            </button>
          </div>

          {/* 커뮤니티 글쓰기 */}
          <div className="fab-action-item">
            <span className="fab-label">커뮤니티 글쓰기</span>
            <button
              className="fab-action-button"
              onClick={handleNavigateToCommunity}
              aria-label="커뮤니티 글쓰기"
            >
              💬
            </button>
          </div>

          {/* 공동구매 글쓰기 */}
          <div className="fab-action-item">
            <span className="fab-label">공동구매 글쓰기</span>
            <button
              className="fab-action-button"
              onClick={handleNavigateToProduct}
              aria-label="공동구매 글쓰기"
            >
              🛒
            </button>
          </div>
        </div>

        {/* 메인 FAB 버튼 */}
        <button
          className={`fab-main-button ${isOpen ? 'fab-main-button-open' : ''}`}
          onClick={toggleMenu}
          aria-label="글쓰기 메뉴"
          aria-expanded={isOpen}
        >
          <span className="fab-icon">
            {isOpen ? '✕' : '✏️'}
          </span>
        </button>
      </div>
    </>
  );
};

export default FloatingActionButton;
