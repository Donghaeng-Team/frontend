import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ProductDetail.css';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';
import Button from '../../components/Button';
import Progress from '../../components/Progress';
import Accordion from '../../components/Accordion';
import type { AccordionItem } from '../../components/Accordion';
import { useAuthStore } from '../../stores/authStore';
import { productService, type Product } from '../../api/services/product';

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

// Fallback Mock 상품 데이터 생성 함수
const generateFallbackMockProduct = (id: string): Product => {
  return {
    id: id,
    title: '유기농 사과 10kg (부사) - 샘플 상품',
    description: '신선한 유기농 사과입니다. 직접 재배한 부사 품종으로 달콤하고 아삭합니다.\n\n이 상품은 API 연동 전 샘플 데이터입니다.\n실제 상품을 등록하시면 이 데이터 대신 표시됩니다.',
    price: 35000,
    discountPrice: 45000,
    category: '식품',
    images: [],
    targetQuantity: 20,
    currentQuantity: 15,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    location: {
      sido: '서울',
      gugun: '서초구',
      dong: '서초동',
      fullAddress: '서울시 서초구 서초동'
    },
    seller: {
      id: '101',
      name: '사과조아',
      rating: 4.8
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

const ProductDetail: React.FC<ProductDetailProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [isWished, setIsWished] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string[]>(['1']);

  // 상품 데이터 로드
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        alert('상품 ID가 없습니다.');
        navigate('/products');
        return;
      }

      try {
        setLoading(true);
        const response = await productService.getProduct(id);

        if (!response.success || !response.data) {
          throw new Error('상품을 찾을 수 없습니다.');
        }

        setProduct(response.data);
      } catch (error: any) {
        console.error('❌ 상품 로드 실패:', error);
        console.warn('⚠️ Using fallback mock product data');

        // Fallback: mock 데이터 사용
        const mockProduct = generateFallbackMockProduct(id);
        setProduct(mockProduct);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, navigate]);

  // 작성자 여부 확인
  const isAuthor = authUser && product && product.seller.id === authUser.userId?.toString();

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

  // 로딩 중
  if (loading) {
    return (
      <div className="product-detail-page">
        <Header isLoggedIn={true} notificationCount={3} />
        <div className="product-detail-container">
          <div className="loading-message">상품 정보를 불러오는 중...</div>
        </div>
        <Footer />
      </div>
    );
  }

  // 상품 없음
  if (!product) {
    return (
      <div className="product-detail-page">
        <Header isLoggedIn={true} notificationCount={3} />
        <div className="product-detail-container">
          <div className="loading-message">상품을 찾을 수 없습니다.</div>
        </div>
        <Footer />
      </div>
    );
  }

  const progressPercent = (product.currentQuantity / product.targetQuantity) * 100;

  return (
    <div className="product-detail-page">
      <Header isLoggedIn={true} notificationCount={3} />

      <main className="product-detail-container">
        {/* 상품 메인 섹션 */}
        <section className="product-main-section">
          <div className="product-image-container">
            {product.images && product.images.length > 0 ? (
              <img src={product.images[0]} alt={product.title} className="product-image" />
            ) : (
              <div className="product-image-placeholder">
                📦 상품 이미지
              </div>
            )}
          </div>

          <div className="product-info-section">
            <div className="product-category">{product.category}</div>
            <h1 className="product-title">{product.title}</h1>

            <div className="price-container">
              <span className="current-price">{formatPrice(product.price)}</span>
              {product.discountPrice && (
                <>
                  <span className="original-price">{formatPrice(product.discountPrice)}</span>
                  <span className="discount-badge">
                    {Math.round(((product.discountPrice - product.price) / product.discountPrice) * 100)}%
                  </span>
                </>
              )}
            </div>

            <div className="recruitment-status">
              <div className="recruitment-header">
                <span className="participants-count">
                  🔥 {product.currentQuantity}/{product.targetQuantity}명 참여중
                </span>
                <span className="time-badge">
                  ⏰ {new Date(product.deadline) > new Date() ? '모집중' : '마감'}
                </span>
              </div>

              <Progress
                percent={progressPercent}
                strokeColor="#ff5e2f"
                showInfo={false}
              />

              <div className="progress-text">
                목표 인원 {product.targetQuantity}명 • {Math.round(progressPercent)}% 진행
              </div>
            </div>

            <div className="action-buttons">
              {isAuthor ? (
                <>
                  <Button
                    variant="outline"
                    size="large"
                    onClick={() => navigate(`/products/${product.id}/edit`)}
                    className="edit-button"
                  >
                    ✏️ 수정
                  </Button>
                  <button
                    onClick={handleWish}
                    className="wish-button"
                    data-variant={isWished ? "primary" : "outline"}
                  >
                    ♥
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleJoinChat}
                    className="chat-button"
                  >
                    💬 채팅방 참여
                  </button>
                  <button
                    onClick={handleWish}
                    className="wish-button"
                    data-variant={isWished ? "primary" : "outline"}
                  >
                    ♥
                  </button>
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
              {product.seller.profileImage ? (
                <img src={product.seller.profileImage} alt={product.seller.name} />
              ) : (
                <span>{product.seller.name.slice(0, 2)}</span>
              )}
            </div>
            <div className="seller-info">
              <h3 className="seller-name">{product.seller.name}</h3>
              <div className="seller-rating">
                ⭐ {product.seller.rating.toFixed(1)} • {product.location.dong}
              </div>
            </div>
          </div>
        </section>

        {/* 상품 상세 설명 섹션 */}
        <section className="description-section">
          <h2 className="section-title">📝 상품 상세 설명</h2>
          <div className="description-content">
            <div className="description-text">
              {product.description.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>

            <h4>⏰ 공동구매 진행 안내</h4>
            <div className="description-group">
              <p>• 목표 수량: {product.targetQuantity}개</p>
              <p>• 현재 수량: {product.currentQuantity}개</p>
              <p>• 모집 마감: {new Date(product.deadline).toLocaleDateString('ko-KR')}</p>
              <p>• 거래 장소: {product.location.fullAddress}</p>
            </div>
          </div>
        </section>

        {/* 참여자 현황 섹션 */}
        <section className="participants-section">
          <h2 className="section-title">
            👥 참여자 현황 ({product.currentQuantity}/{product.targetQuantity}개)
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
            {product.currentQuantity > 5 && (
              <div className="participant-more">
                +{product.currentQuantity - 5}
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
                onClick={() => navigate(`/products/${item.id}`)}
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