import React from 'react';
import Layout from '../../components/Layout';
import SearchBar from '../../components/SearchBar';
import './Main.css';

const Main: React.FC = () => {
  const handleSearch = (value: string) => {
    console.log('검색:', value);
    // 검색 로직 구현
  };

  return (
    <Layout isLoggedIn={false}>
      {/* 메인 섹션 */}
      <section className="main-hero">
        <div className="main-hero-content">
          <h1 className="main-title">함께 사면 더 저렴해요</h1>
          <p className="main-subtitle">동네 이웃과 함께하는 공동구매 플랫폼</p>
          <div className="main-search">
            <SearchBar
              placeholder="어떤 상품을 찾으세요?"
              onSearch={handleSearch}
              size="large"
              fullWidth
            />
          </div>
        </div>
      </section>

      {/* 특징 섹션 */}
      <section className="main-features">
        <div className="main-features-container">
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3 className="feature-title">저렴한 가격</h3>
            <p className="feature-description">대량 구매로 더 저렴한 가격</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3 className="feature-title">이웃과 함께</h3>
            <p className="feature-description">동네 이웃과 함께 구매</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📦</div>
            <h3 className="feature-title">편리한 수령</h3>
            <p className="feature-description">가까운 장소에서 간편 수령</p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Main;