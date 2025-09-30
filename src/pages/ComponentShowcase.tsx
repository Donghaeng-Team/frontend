import React, { useState } from 'react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Input from '../components/Input';
import FormField from '../components/FormField';
import SearchBar from '../components/SearchBar';
import Card from '../components/Card';
import ProductCard from '../components/ProductCard';
import StatCard from '../components/StatCard';
import './ComponentShowcase.css';

const ComponentShowcase: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <Layout isLoggedIn={true} notificationCount={3}>
      <div className="showcase-container">
        <h1 className="showcase-title">🛒 함께사요 - 컴포넌트 시스템</h1>
        
        {/* Button Section */}
        <section className="showcase-section">
          <h2>Buttons</h2>
          <div className="component-grid">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="text">Text Button</Button>
            <Button variant="kakao" size="large">💬 카카오로 시작하기</Button>
            <Button variant="google" size="large">🔍 구글로 시작하기</Button>
            <Button disabled>Disabled</Button>
            <Button size="small">Small</Button>
            <Button size="large">Large</Button>
          </div>
        </section>

        {/* Input Section */}
        <section className="showcase-section">
          <h2>Inputs</h2>
          <div className="component-grid">
            <Input 
              placeholder="기본 Input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Input 
              placeholder="에러 상태"
              error="에러 메시지입니다"
            />
            <Input 
              placeholder="비활성화"
              disabled
            />
            <SearchBar 
              placeholder="상품 검색..."
              onSearch={(value) => alert(`검색: ${value}`)}
            />
          </div>
        </section>

        {/* FormField Section */}
        <section className="showcase-section">
          <h2>Form Fields</h2>
          <div style={{ maxWidth: '400px' }}>
            <FormField
              label="이메일"
              name="email"
              type="email"
              placeholder="example@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              helperText="이메일 주소를 입력하세요"
            />
            <FormField
              label="비밀번호"
              name="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={password && password.length < 8 ? "8자 이상 입력하세요" : ""}
            />
          </div>
        </section>

        {/* Card Section */}
        <section className="showcase-section">
          <h2>Cards</h2>
          <div className="card-grid">
            <Card title="기본 카드" subtitle="서브타이틀">
              카드 내용이 들어갑니다. 다양한 컨텐츠를 담을 수 있습니다.
            </Card>
            <Card variant="elevated" title="Elevated 카드">
              그림자가 있는 카드입니다
            </Card>
            <Card 
              variant="outlined" 
              title="클릭 가능한 카드"
              hoverable
              onClick={() => alert('카드 클릭!')}
            >
              마우스를 올려보세요
            </Card>
          </div>
        </section>

        {/* StatCard Section */}
        <section className="showcase-section">
          <h2>Stat Cards</h2>
          <div className="stat-grid">
            <StatCard 
              label="진행중인 공동구매"
              value="3"
              unit="건"
              color="#ff5e2f"
            />
            <StatCard 
              label="참여중인 공동구매"
              value="12"
              unit="건"
              color="#3399ff"
            />
            <StatCard 
              label="완료된 공동구매"
              value="28"
              unit="건"
              color="#6633cc"
              change={{ value: 15, type: 'increase' }}
            />
            <StatCard 
              label="찜한 상품"
              value="8"
              unit="개"
              color="#ff3333"
            />
          </div>
        </section>

        {/* ProductCard Section */}
        <section className="showcase-section">
          <h2>Product Cards</h2>
          <div className="product-grid">
            <ProductCard
              category="식품"
              title="유기농 사과 10kg (부사)"
              price={35000}
              originalPrice={45000}
              discount={22}
              seller={{ name: "사과조아" }}
              participants={{ current: 15, max: 20 }}
              location="서초동"
              status="active"
            />
            <ProductCard
              category="생활용품"
              title="프리미엄 화장지 30롤"
              price={18900}
              seller={{ name: "생활마트" }}
              participants={{ current: 8, max: 10 }}
              location="방배동"
              status="active"
            />
            <ProductCard
              category="육아용품"
              title="기저귀 대형 4박스"
              price={124000}
              originalPrice={156000}
              discount={20}
              seller={{ name: "아기사랑" }}
              participants={{ current: 19, max: 20 }}
              location="역삼동"
              status="active"
            />
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ComponentShowcase;