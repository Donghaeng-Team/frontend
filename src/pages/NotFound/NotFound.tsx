import React from 'react';
import Button from '../../components/Button';
import './NotFound.css';

const NotFound: React.FC = () => {
  return (
    <div className="notfound-container">
    <div className="notfound-content">
        <div className="notfound-icon">🛒</div>
        <h1 className="notfound-number">404</h1>
        <h2 className="notfound-title">페이지를 찾을 수 없어요</h2>
        <p className="notfound-description">
        요청하신 페이지가 사라졌거나 잘못된 경로입니다.<br />
        주소를 다시 확인해 주시거나, 홈으로 돌아가서 원하는 상품을 찾아보세요!
        </p>
        <div className="notfound-buttons">
        <Button 
            variant="primary" 
            size="large"
            onClick={() => window.location.href = '/'}
        >
            🏠 홈으로 돌아가기
        </Button>
        <Button 
            variant="secondary"
            size="large"
            onClick={() => window.location.href = '/products'}
        >
            공동구매 보러가기
        </Button>
        </div>
    </div>
    </div>
  );
};

export default NotFound;