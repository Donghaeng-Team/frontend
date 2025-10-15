import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductDetail.css';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';
import Button from '../../components/Button';
import Progress from '../../components/Progress';
import Accordion from '../../components/Accordion';
import type { AccordionItem } from '../../components/Accordion';
import { useAuthStore } from '../../stores/authStore';

interface ProductDetailProps {
  productId?: string;
}

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  color?: string;
}

interface RelatedProduct {
  id: string;
  category: string;
  title: string;
  price: number;
  seller: {
    name: string;
    avatar?: string;
  };
  participants: {
    current: number;
    max: number;
  };
  location: string;
  image?: string;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ productId }) => {
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.user);
  const [isWished, setIsWished] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string[]>(['1']);

  // 샘플 데이터
  const product = {
    id: '1', // 샘플 ID 추가
    category: '식품',
    title: '유기농 사과 10kg (부사)',
    price: 35000,
    originalPrice: 50000,
    discount: 30,
    currentParticipants: 15,
    maxParticipants: 20,
    remainingTime: '2일 3시간',
    minParticipants: 10,
    description: {
      main: '🍎 프리미엄 유기농 사과',
      features: [
        '품종: 부사 (당도 15Brix 이상)',
        '중량: 10kg (30~35과)',
        '산지: 충청북도 충주시 직송',
        '재배방법: 100% 유기농 인증'
      ],
      details: [
        'GAP 인증 농장에서 재배한 프리미엄 사과',
        '농약과 화학비료를 전혀 사용하지 않은 친환경 재배',
        '수확 후 24시간 이내 발송으로 신선도 보장',
        '개별 완충포장으로 안전하게 배송'
      ],
      process: [
        '최소 모집 인원: 10명',
        '최대 모집 인원: 20명',
        '모집 기간: 2025년 9월 27일까지',
        '발송 예정일: 모집 완료 후 3일 이내'
      ],
      storage: [
        '받으신 후 냉장보관 권장',
        '서늘한 곳에 보관 시 2주 이상 신선도 유지'
      ]
    },
    seller: {
      id: authUser?.userId?.toString() || '1', // 샘플: 현재 로그인한 사용자를 작성자로 설정 (테스트용)
      name: '김농부네 과수원',
      avatar: '김농',
      rating: 4.8,
      reviewCount: 124,
      successRate: 95,
      location: '서초동',
      verified: true
    }
  };

  // 작성자 여부 확인
  const isAuthor = authUser && product.seller.id === authUser.userId?.toString();

  const participants: Participant[] = [
    { id: '1', name: '김민', color: '#ff8080' },
    { id: '2', name: '이수', color: '#4dcc4d' },
    { id: '3', name: '박진', color: '#ff994d' },
    { id: '4', name: '최은', color: '#4dccff' },
    { id: '5', name: '정호', color: '#cc4dcc' },
  ];

  const faqItems: AccordionItem[] = [
    {
      key: '1',
      title: 'Q. 최소 인원이 모집되지 않으면 어떻게 되나요?',
      content: 'A. 모집 기간 내 최소 인원(10명)이 모이지 않으면 공동구매는 자동 취소되며, 참여 신청하신 분들께 알림을 드립니다.'
    },
    {
      key: '2',
      title: 'Q. 구매 확정은 언제 해야 하나요?',
      content: 'A. 상품 수령 후 3일 이내에 구매 확정을 해주세요. 문제가 있을 경우 채팅방을 통해 판매자와 소통하실 수 있습니다.'
    }
  ];

  const relatedProducts: RelatedProduct[] = [
    {
      id: '1',
      category: '식품',
      title: '유기농 사과 10kg (부사)',
      price: 35000,
      seller: { name: '사과조아' },
      participants: { current: 15, max: 20 },
      location: '서초동'
    },
    {
      id: '2',
      category: '생활용품',
      title: '프리미엄 화장지 30롤',
      price: 18900,
      seller: { name: '생활마트' },
      participants: { current: 8, max: 10 },
      location: '방배동'
    },
    {
      id: '3',
      category: '육아용품',
      title: '기저귀 대형 4박스',
      price: 124000,
      seller: { name: '아기사랑' },
      participants: { current: 19, max: 20 },
      location: '역삼동'
    }
  ];

  const progressPercent = (product.currentParticipants / product.maxParticipants) * 100;

  const handleJoinChat = () => {
    // 채팅방 참여 로직
    console.log('채팅방 참여');
  };

  const handleWish = () => {
    setIsWished(!isWished);
  };

  const formatPrice = (price: number) => {
    return `₩${price.toLocaleString()}`;
  };

  return (
    <div className="product-detail-page">
      <Header isLoggedIn={true} notificationCount={3} />
      
      <main className="product-detail-container">
        {/* 상품 메인 섹션 */}
        <section className="product-main-section">
          <div className="product-image-container">
            <div className="product-image-placeholder">
              🍎 유기농 사과 이미지
            </div>
          </div>

          <div className="product-info-section">
            <div className="product-category">{product.category}</div>
            <h1 className="product-title">{product.title}</h1>
            
            <div className="price-container">
              <span className="current-price">{formatPrice(product.price)}</span>
              <span className="original-price">{formatPrice(product.originalPrice)}</span>
              <span className="discount-badge">{product.discount}%</span>
            </div>

            <div className="recruitment-status">
              <div className="recruitment-header">
                <span className="participants-count">
                  🔥 {product.currentParticipants}/{product.maxParticipants}명 참여중
                </span>
                <span className="time-badge">
                  ⏰ {product.remainingTime}
                </span>
              </div>
              
              <Progress 
                percent={progressPercent} 
                strokeColor="#ff5e2f"
                showInfo={false}
              />
              
              <div className="progress-text">
                최소 인원 {product.minParticipants}명 달성! • {Math.round(progressPercent)}% 진행
              </div>
            </div>

            <div className="action-buttons">
              {isAuthor ? (
                <>
                  <Button
                    variant="outline"
                    size="large"
                    fullWidth
                    onClick={() => navigate(`/products/${product.id}/edit`)}
                    className="edit-button"
                  >
                    ✏️ 수정
                  </Button>
                  <Button
                    variant={isWished ? "primary" : "outline"}
                    size="large"
                    onClick={handleWish}
                    className="wish-button"
                  >
                    ♥
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="large"
                    fullWidth
                    onClick={handleJoinChat}
                    className="chat-button"
                  >
                    💬 채팅방 참여
                  </Button>
                  <Button
                    variant={isWished ? "primary" : "outline"}
                    size="large"
                    onClick={handleWish}
                    className="wish-button"
                  >
                    ♥
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* 판매자 정보 섹션 */}
        <section className="seller-section">
          <h2 className="section-title">👤 판매자 정보</h2>
          <div className="seller-card">
            <div className="seller-avatar">
              <span>{product.seller.avatar}</span>
            </div>
            <div className="seller-info">
              <h3 className="seller-name">{product.seller.name}</h3>
              <div className="seller-rating">
                ⭐ {product.seller.rating} ({product.seller.reviewCount}개 평가) • 
                성공률 {product.seller.successRate}% • 
                {product.seller.location} {product.seller.verified && '인증'}
              </div>
            </div>
          </div>
        </section>

        {/* 상품 상세 설명 섹션 */}
        <section className="description-section">
          <h2 className="section-title">📝 상품 상세 설명</h2>
          <div className="description-content">
            <h3>{product.description.main}</h3>
            <div className="description-group">
              {product.description.features.map((feature, index) => (
                <p key={index}>- {feature}</p>
              ))}
            </div>
            
            <h4>📦 상품 특징</h4>
            <div className="description-group">
              {product.description.details.map((detail, index) => (
                <p key={index}>• {detail}</p>
              ))}
            </div>
            
            <h4>⏰ 공동구매 진행 안내</h4>
            <div className="description-group">
              {product.description.process.map((item, index) => (
                <p key={index}>• {item}</p>
              ))}
            </div>
            
            <h4>💡 보관 방법</h4>
            <div className="description-group">
              {product.description.storage.map((item, index) => (
                <p key={index}>• {item}</p>
              ))}
            </div>
          </div>
        </section>

        {/* 참여자 현황 섹션 */}
        <section className="participants-section">
          <h2 className="section-title">
            👥 참여자 현황 ({product.currentParticipants}/{product.maxParticipants}명)
          </h2>
          <div className="participants-list">
            {participants.map((participant) => (
              <div 
                key={participant.id} 
                className="participant-avatar"
                style={{ backgroundColor: participant.color }}
              >
                {participant.name}
              </div>
            ))}
            {product.currentParticipants > 5 && (
              <div className="participant-more">
                +{product.currentParticipants - 5}
              </div>
            )}
          </div>
        </section>

        {/* 관련 상품 섹션 */}
        <section className="related-section">
          <h2 className="section-title">🔥 이런 상품도 함께 보세요</h2>
          <div className="related-products">
            {relatedProducts.map((item) => (
              <ProductCard
                key={item.id}
                category={item.category}
                title={item.title}
                price={item.price}
                seller={item.seller}
                participants={item.participants}
                location={item.location}
                image={item.image}
              />
            ))}
          </div>
        </section>

        {/* FAQ 섹션 */}
        <section className="faq-section">
          <h2 className="section-title">❓ 자주 묻는 질문</h2>
          <Accordion
            items={faqItems}
            activeKeys={activeAccordion}
            onChange={setActiveAccordion}
            accordion
          />
        </section>

        {/* 구매 프로세스 섹션 */}
        <section className="process-section">
          <h2 className="section-title">🚀 구매 프로세스</h2>
          <div className="process-steps">
            <div className="process-step">
              <div className="step-icon">1</div>
              <div className="step-text">채팅방 참여</div>
            </div>
            <div className="step-arrow">→</div>
            
            <div className="process-step">
              <div className="step-icon">2</div>
              <div className="step-text">구매 신청</div>
            </div>
            <div className="step-arrow">→</div>
            
            <div className="process-step">
              <div className="step-icon">3</div>
              <div className="step-text">모집 완료</div>
            </div>
            <div className="step-arrow">→</div>
            
            <div className="process-step">
              <div className="step-icon">4</div>
              <div className="step-text">물품 수령</div>
            </div>
            <div className="step-arrow">→</div>
            
            <div className="process-step">
              <div className="step-icon step-icon-success">5</div>
              <div className="step-text">구매 확정</div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;