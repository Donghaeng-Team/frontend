import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ProductDetail.css';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BottomNav from '../../components/BottomNav';
import ProductCard from '../../components/ProductCard';
import Button from '../../components/Button';
import Progress from '../../components/Progress';
import Accordion from '../../components/Accordion';
import type { AccordionItem } from '../../components/Accordion';
import ChatModal from '../../components/ChatModal/ChatModal';
import { useAuthStore } from '../../stores/authStore';
import { useChatStore } from '../../stores/chatStore';
import { getCategoryName } from '../../utils/categoryMapping';
import { convertToCloudFrontUrl } from '../../utils/urlHelper';
import { transformChatRoomsForUI } from '../../utils/chatUtils';
import { productService } from '../../api/services/product';
import { chatService } from '../../api/services/chat';
import type { MarketDetailResponse } from '../../types/market';

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
const generateFallbackMockProduct = (id: string): MarketDetailResponse => {
  return {
    marketId: parseInt(id, 10),
    categoryId: '01010101',
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    price: 35000,
    recruitMin: 10,
    recruitMax: 20,
    recruitNow: 15,
    status: 'RECRUITING' as const,
    title: '유기농 사과 10kg (부사) - 샘플 상품',
    content: `신선한 유기농 사과입니다. 직접 재배한 부사 품종으로 달콤하고 아삭합니다.

이 상품은 API 연동 전 샘플 데이터입니다.
실제 상품을 등록하시면 이 데이터 대신 표시됩니다.`,
    authorId: 101,
    authorNickname: '사과조아',
    authorProfileImageUrl: null,
    locationText: '서울시 서초구 서초동 인근',
    divisionId: '11650510',
    emdName: '서초동',
    latitude: 37.5665,
    longitude: 126.9780,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    views: 0,
    images: []
  };
};

const ProductDetail: React.FC<ProductDetailProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.user);
  const { chatRooms, fetchChatRooms } = useChatStore();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<MarketDetailResponse | null>(null);
  const [isWished, setIsWished] = useState(false);
  const [isJoinedChat, setIsJoinedChat] = useState(false);
  const [isBuyer, setIsBuyer] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // localStorage 키 생성 헬퍼 함수
  const getWishStorageKey = (marketId: number, userId: number) =>
    `product_wished_${marketId}_${userId}`;

  // 상품 데이터 로드 및 좋아요 상태 확인
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

        console.log('✅ 상품 데이터:', response.data);
        console.log('📸 이미지 정보:', response.data.images);
        setProduct(response.data);

        // 좋아요 상태 확인 (로그인 사용자만)
        if (authUser && authUser.userId) {
          try {
            const wishlistResponse = await productService.getWishlistedProducts({ pageSize: 100 });
            let initialWished = false;

            if (wishlistResponse.success && wishlistResponse.data) {
              const isInWishlist = wishlistResponse.data.content.some(
                (item: any) => item.marketId === response.data.marketId
              );
              initialWished = isInWishlist;
            }

            // localStorage와 동기화
            const storageKey = getWishStorageKey(response.data.marketId, authUser.userId);
            localStorage.setItem(storageKey, initialWished.toString());
            setIsWished(initialWished);
          } catch (wishlistError: any) {
            // 404는 위시리스트가 비어있는 정상 상태이므로 무시
            if (wishlistError?.response?.status !== 404) {
              console.error('좋아요 상태 확인 실패:', wishlistError);
            }

            // localStorage에서 복원 시도
            const storageKey = getWishStorageKey(response.data.marketId, authUser.userId);
            const storedWished = localStorage.getItem(storageKey);
            setIsWished(storedWished === 'true');
          }
        }
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
  }, [id, navigate, authUser]);

  // 채팅방 목록 가져오기 (초기 로드)
  useEffect(() => {
    const loadChatRooms = async () => {
      if (!authUser) return;

      try {
        await fetchChatRooms();
      } catch (error) {
        console.error('❌ 채팅방 목록 로드 실패:', error);
      }
    };

    loadChatRooms();
  }, [authUser, fetchChatRooms]);

  // chatRooms 변경 시 참여 상태 재확인
  useEffect(() => {
    console.log('🔄 useEffect 실행:', {
      hasProduct: !!product,
      chatRoomsLength: chatRooms.length,
      productChatRoomId: product?.chatRoomId
    });

    if (product && chatRooms.length > 0) {
      console.log('📊 채팅방 매칭 시작');
      console.log('  - chatRooms:', chatRooms.map(r => ({ id: r.id, type: typeof r.id, buyer: r.buyer })));
      console.log('  - product.chatRoomId:', product.chatRoomId, typeof product.chatRoomId);

      // chatRoomId가 있으면 그걸로 우선 매칭, 없으면 marketId로 매칭
      const joinedRoom = product.chatRoomId
        ? chatRooms.find(room => {
            const match = Number(room.id) === product.chatRoomId;
            console.log(`  - room.id ${room.id} === chatRoomId ${product.chatRoomId}? ${match}`);
            return match;
          })
        : chatRooms.find(room => room.marketId === product.marketId);

      console.log('  - 찾은 채팅방:', joinedRoom);
      console.log('  - buyer 값:', joinedRoom?.buyer);

      setIsJoinedChat(!!joinedRoom);
      setIsBuyer(joinedRoom?.buyer || false);

      console.log('✅ 상태 업데이트 완료:', {
        isJoinedChat: !!joinedRoom,
        isBuyer: joinedRoom?.buyer || false
      });
    }
  }, [chatRooms, product]);

  // 작성자 여부 확인
  const isAuthor = authUser && product && product.authorId === authUser.userId;

  // 렌더링 시 상태 로그
  console.log('🎨 렌더링 시점 상태:', {
    isJoinedChat,
    isBuyer,
    chatRoomsLength: chatRooms.length,
    productChatRoomId: product?.chatRoomId
  });

  // TODO: 백엔드 참여자 목록 API 구현 후 실제 데이터로 대체
  const participants: Participant[] = [];

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

  const handleJoinChat = async () => {
    // 인증 확인
    if (!authUser) {
      alert('로그인이 필요한 기능입니다.');
      navigate('/login');
      return;
    }

    // 채팅방 ID 확인
    if (!product?.chatRoomId) {
      alert('채팅방 정보를 불러올 수 없습니다.');
      console.error('❌ chatRoomId is missing');
      return;
    }

    try {
      // 아직 참여하지 않은 경우에만 joinChatRoom API 호출
      if (!isJoinedChat) {
        console.log('✅ 채팅방 참여 API 호출:', product.chatRoomId);
        try {
          await chatService.joinChatRoom(product.chatRoomId);
          console.log('✅ 채팅방 참여 성공');
        } catch (joinError: any) {
          // "이미 참여중인 채팅방입니다" 에러는 정상 케이스로 처리
          if (joinError?.response?.data?.message === '이미 참여중인 채팅방입니다') {
            console.log('✅ 이미 참여중인 채팅방');
          } else {
            // 다른 에러는 상위로 전파
            throw joinError;
          }
        }

        // 즉시 UI 업데이트
        setIsJoinedChat(true);

        // 채팅방 목록 새로고침 (백그라운드에서)
        fetchChatRooms();
      }

      // PC에서는 모달로, 모바일에서는 페이지 이동
      const isMobile = window.innerWidth <= 768;

      if (isMobile) {
        // 모바일: 전체 페이지로 이동
        navigate(`/chat/${product.chatRoomId}`);
      } else {
        // PC: 모달 열기
        setIsChatModalOpen(true);
      }
    } catch (error) {
      console.error('❌ 채팅방 참여 실패:', error);
      alert('채팅방 참여에 실패했습니다.');
    }
  };

  const handleWish = async () => {
    if (!authUser || !authUser.userId || !product) return;

    const storageKey = getWishStorageKey(product.marketId, authUser.userId);

    // Optimistic update
    const newWishedState = !isWished;
    setIsWished(newWishedState);

    try {
      if (isWished) {
        // 좋아요 취소
        await productService.removeWishlist(product.marketId);
        console.log('✅ 좋아요 취소 성공');
        localStorage.setItem(storageKey, 'false');
      } else {
        // 좋아요 추가
        try {
          await productService.addWishlist(product.marketId);
          console.log('✅ 좋아요 추가 성공');
          localStorage.setItem(storageKey, 'true');
        } catch (addError: any) {
          // "이미 좋아요" 에러 감지 시 자동으로 취소로 전환
          const errorMessage = addError?.response?.data?.message || '';
          if (
            errorMessage.includes('이미') ||
            errorMessage.includes('already') ||
            addError?.response?.status === 409
          ) {
            console.log('⚠️ 이미 좋아요한 상태 - 자동으로 취소로 전환');
            await productService.removeWishlist(product.marketId);
            setIsWished(false);
            localStorage.setItem(storageKey, 'false');
            return;
          } else {
            throw addError;
          }
        }
      }

      // 서버 상태와 동기화
      try {
        const wishlistResponse = await productService.getWishlistedProducts({ pageSize: 100 });
        if (wishlistResponse.success && wishlistResponse.data) {
          const isInWishlist = wishlistResponse.data.content.some(
            (item: any) => item.marketId === product.marketId
          );
          setIsWished(isInWishlist);
          localStorage.setItem(storageKey, isInWishlist.toString());
        }
      } catch (syncError) {
        console.warn('⚠️ 서버 동기화 실패 (무시):', syncError);
      }
    } catch (error: any) {
      console.error('❌ 좋아요 처리 실패:', error);
      // Optimistic update 원복
      setIsWished(isWished);
      alert('좋아요 처리에 실패했습니다.');
    }
  };

  // 이미지 캐러셀 핸들러
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
    setCurrentX(clientX);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setCurrentX(clientX);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const diff = startX - currentX;
    const threshold = 50; // 최소 드래그 거리

    if (Math.abs(diff) > threshold && product?.images) {
      if (diff > 0 && currentImageIndex < product.images.length - 1) {
        // 다음 이미지
        setCurrentImageIndex(prev => prev + 1);
      } else if (diff < 0 && currentImageIndex > 0) {
        // 이전 이미지
        setCurrentImageIndex(prev => prev - 1);
      }
    }

    setStartX(0);
    setCurrentX(0);
  };

  const handleDotClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  const formatPrice = (price: number) => {
    return `₩${price.toLocaleString()}`;
  };

  // 로딩 중
  if (loading) {
    return (
      <div className="product-detail-page">
        <Header notificationCount={3} className="desktop-header" />
        <div className="product-detail-container">
          <div className="loading-message">상품 정보를 불러오는 중...</div>
        </div>
        <Footer className="desktop-footer" />
        <BottomNav notificationCount={3} />
      </div>
    );
  }

  // 상품 없음
  if (!product) {
    return (
      <div className="product-detail-page">
        <Header notificationCount={3} className="desktop-header" />
        <div className="product-detail-container">
          <div className="loading-message">상품을 찾을 수 없습니다.</div>
        </div>
        <Footer className="desktop-footer" />
        <BottomNav notificationCount={3} />
      </div>
    );
  }

  const progressPercent = (product.recruitNow / product.recruitMax) * 100;

  return (
    <div className="product-detail-page">
      <Header notificationCount={3} className="desktop-header" />

      <main className="product-detail-container">
        {/* 상품 메인 섹션 */}
        <section className="product-main-section">
          <div 
            className="product-image-container"
            ref={imageContainerRef}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            {product.images && product.images.length > 0 ? (
              <>
                <div className="product-image-carousel">
                  {product.images.map((image, index) => (
                    <img
                      key={index}
                      src={convertToCloudFrontUrl(image.imageUrl)}
                      alt={`${product.title} - ${index + 1}`}
                      className={`product-image ${index === currentImageIndex ? 'active' : ''}`}
                      style={{
                        transform: `translateX(${(index - currentImageIndex) * 100}%)`,
                        transition: isDragging ? 'none' : 'transform 0.3s ease-in-out'
                      }}
                      onError={(e) => {
                        console.error('❌ 이미지 로드 실패:', image.imageUrl);
                      }}
                      onLoad={() => console.log('✅ 이미지 로드 성공:', image.imageUrl)}
                      draggable={false}
                    />
                  ))}
                </div>
                {product.images.length > 1 && (
                  <div className="product-image-indicators">
                    {product.images.map((_, index) => (
                      <button
                        key={index}
                        className={`indicator-dot ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => handleDotClick(index)}
                        aria-label={`이미지 ${index + 1}로 이동`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="product-image-placeholder">
                📦 상품 이미지 없음
              </div>
            )}
          </div>

          <div className="product-info-section">
            <div className="product-header-info">
              <div className="product-category">{getCategoryName(product.categoryId)}</div>
              <h1 className="product-title">{product.title}</h1>
              <div className="price-container">
                <div className="price-label">현재 가격</div>
                <div className="price-current">
                  {product.recruitNow > 0
                    ? formatPrice(Math.ceil(product.price / product.recruitNow))
                    : formatPrice(product.price)
                  }
                </div>
                <div className="price-max-info">
                  최대 {product.recruitMax}명 모집 시 {formatPrice(Math.ceil(product.price / product.recruitMax))}
                </div>
              </div>
            </div>

            <div className="product-action-info">
              <div className="recruitment-status">
                <div className="recruitment-header">
                  <span className="participants-count">
                    🔥 {product.recruitNow}/{product.recruitMax}명 참여중
                  </span>
                  <span className="time-badge">
                    ⏰ {new Date(product.endTime) > new Date() ? '모집중' : '마감'}
                  </span>
                </div>

                <Progress
                  percent={progressPercent}
                  strokeColor="#ff5e2f"
                  showInfo={false}
                />

                <div className="progress-text">
                  목표 인원 {product.recruitMax}명 • {Math.round(progressPercent)}% 진행
                </div>
              </div>

              <div className="action-buttons">
                {isAuthor ? (
                  // 작성자일 때: 수정 버튼만 표시
                  <Button
                    variant="primary"
                    size="large"
                    onClick={() => navigate(`/products/${product.marketId}/edit`)}
                    className="edit-button"
                    style={{ width: '100%' }}
                  >
                    ✏️ 수정하기
                  </Button>
                ) : (
                  // 일반 사용자일 때: 채팅방 참여 + 좋아요 버튼
                  <>
                    <button
                      onClick={handleJoinChat}
                      className={`chat-button ${isJoinedChat ? 'chat-button-joined' : ''}`}
                    >
                      {isBuyer ? '💳 구매중' : isJoinedChat ? '💬 참여중' : '💬 채팅방 참여'}
                    </button>
                    <button
                      onClick={handleWish}
                      className="wish-button"
                      data-variant={isWished ? "primary" : "outline"}
                    >
                      {isWished ? '❤️' : '🤍'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 판매자 정보 섹션 */}
        <section className="seller-section">
          <h2 className="section-title">👤 판매자 정보</h2>
          <div className="seller-card">
            <div className="seller-avatar">
              {product.authorProfileImageUrl ? (
                <img src={product.authorProfileImageUrl} alt={product.authorNickname} />
              ) : (
                <span>{product.authorNickname.slice(0, 2)}</span>
              )}
            </div>
            <div className="seller-info">
              <h3 className="seller-name">{product.authorNickname}</h3>
              <div className="seller-location">
                📍 {product.emdName}
              </div>
            </div>
          </div>
        </section>

        {/* 상품 상세 설명 섹션 */}
        <section className="description-section">
          <h2 className="section-title">📝 상품 상세 설명</h2>
          <div className="description-content">
            <div className="description-text">
              {product.content.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>

            <h4>⏰ 공동구매 진행 안내</h4>
            <div className="description-group">
              <p>• 목표 수량: {product.recruitMax}개</p>
              <p>• 현재 수량: {product.recruitNow}개</p>
              <p>• 모집 마감: {new Date(product.endTime).toLocaleDateString('ko-KR')}</p>
              <p>• 거래 장소: {product.locationText}</p>
            </div>
          </div>
        </section>

        {/* 참여자 현황 섹션 */}
        <section className="participants-section">
          <h2 className="section-title">
            👥 참여자 현황 ({product.recruitNow}/{product.recruitMax}개)
          </h2>
          <div className="participants-list">
            {participants.length > 0 ? (
              <>
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="participant-avatar"
                    style={{ backgroundColor: participant.color }}
                  >
                    {participant.name}
                  </div>
                ))}
                {product.recruitNow > 5 && (
                  <div className="participant-more">
                    +{product.recruitNow - 5}
                  </div>
                )}
              </>
            ) : (
              <p style={{ color: '#999', padding: '20px 0' }}>
                참여자 정보를 불러올 수 없습니다. (API 준비 중)
              </p>
            )}
          </div>
        </section>

        {/* 관련 상품 섹션 - 숨김 처리 */}
        {/* <section className="related-section">
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
        </section> */}

        {/* FAQ 섹션 */}
        <section className="faq-section">
          <h2 className="section-title">❓ 자주 묻는 질문</h2>
          <Accordion
            items={faqItems}
            activeKeys={activeAccordion}
            onChange={setActiveAccordion}
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

      {/* 채팅 모달 (PC 전용) */}
      {isChatModalOpen && product && (
        <ChatModal
          isOpen={isChatModalOpen}
          onClose={async () => {
            console.log('🚪 모달 닫기 - 채팅방 목록 새로고침 시작');
            setIsChatModalOpen(false);
            // 모달 닫을 때 채팅방 목록 새로고침 (구매 상태 업데이트 반영)
            await fetchChatRooms();
            console.log('🚪 모달 닫기 - 채팅방 목록 새로고침 완료, 채팅방 개수:', chatRooms.length);
            console.log('🚪 채팅방 목록:', chatRooms);
          }}
          chatRooms={transformChatRoomsForUI(chatRooms)}
          initialRoomId={product.chatRoomId?.toString()}
          initialProductInfo={{
            name: product.title,
            price: product.price,
            image: product.images?.[0]?.imageUrl ? convertToCloudFrontUrl(product.images[0].imageUrl) : undefined
          }}
          initialRecruitmentStatus={{
            current: product.recruitNow || 0,
            max: product.recruitMax,
            timeRemaining: '진행 중',
            status: 'active'
          }}
          initialRole="buyer"
        />
      )}

      <Footer className="desktop-footer" />
      <BottomNav notificationCount={3} />
    </div>
  );
};

export default ProductDetail;