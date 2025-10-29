import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Tab from '../../components/Tab';
import type { TabItem } from '../../components/Tab';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { productService, type Product } from '../../api/services/product';
import { cartService } from '../../api/services/cart';
import { useAuthStore } from '../../stores/authStore';
import './PurchaseHistory.css';

interface PurchaseItem {
  id: string;
  title: string;
  category: string;
  price: number;
  image?: string;
  status: 'recruiting' | 'processing' | 'completed' | 'cancelled';
  participants: {
    current: number;
    max: number;
  };
  seller: {
    name: string;
    avatar?: string;
  };
  location: string;
  date: string;
  role: 'host' | 'participant';
}

interface PaginationState {
  pageNum: number;
  hasMore: boolean;
  loading: boolean;
}

const PurchaseHistory: React.FC = () => {
  const [activeTab, setActiveTab] = useState('hosting');
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.user);

  const [loading, setLoading] = useState(false);
  const [hostingItems, setHostingItems] = useState<PurchaseItem[]>([]);
  const [participatingItems, setParticipatingItems] = useState<PurchaseItem[]>([]);
  const [completedItems, setCompletedItems] = useState<PurchaseItem[]>([]);
  const [likedItems, setLikedItems] = useState<PurchaseItem[]>([]);

  // 각 탭별 페이징 상태
  const [hostingPage, setHostingPage] = useState<PaginationState>({ pageNum: 0, hasMore: true, loading: false });
  const [participatingPage, setParticipatingPage] = useState<PaginationState>({ pageNum: 0, hasMore: true, loading: false });
  const [completedPage, setCompletedPage] = useState<PaginationState>({ pageNum: 0, hasMore: true, loading: false });
  const [likedPage, setLikedPage] = useState<PaginationState>({ pageNum: 0, hasMore: true, loading: false });

  // Intersection Observer ref
  const observerTarget = useRef<HTMLDivElement>(null);

  const PAGE_SIZE = 10; // 한 번에 로드할 아이템 수

  // URL 파라미터에서 탭 설정
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['hosting', 'participating', 'completed', 'liked'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Product를 PurchaseItem으로 변환
  const convertProductToPurchaseItem = (product: Product, role: 'host' | 'participant'): PurchaseItem => {
    return {
      id: product.id,
      title: product.title,
      category: product.category,
      price: product.price,
      image: product.images && product.images.length > 0 ? product.images[0] : undefined,
      status: product.status === 'active' ? 'recruiting' : product.status === 'completed' ? 'completed' : 'cancelled',
      participants: {
        current: product.currentQuantity,
        max: product.targetQuantity
      },
      seller: {
        name: product.seller.name,
        avatar: product.seller.profileImage
      },
      location: product.location.dong,
      date: new Date(product.createdAt).toISOString().split('T')[0],
      role
    };
  };

  // 주최한 상품 로드
  const loadHostingItems = useCallback(async (pageNum: number) => {
    if (hostingPage.loading || !hostingPage.hasMore) return;

    try {
      setHostingPage(prev => ({ ...prev, loading: true }));

      const response = await productService.getMyProducts({ pageNum, pageSize: PAGE_SIZE });
      if (response.success && response.data) {
        const markets = (response.data as any).markets || [];
        const items = markets.map((market: any) => ({
          id: market.marketId.toString(),
          title: market.title,
          category: market.categoryId,
          price: market.price,
          image: market.thumbnailImageUrl,
          status: market.status === 'RECRUITING' ? 'recruiting' as const :
                  market.status === 'ENDED' ? 'completed' as const :
                  'cancelled' as const,
          participants: {
            current: market.recruitNow,
            max: market.recruitMax
          },
          seller: {
            name: market.nickname,
            avatar: market.userProfileImageUrl
          },
          location: market.emdName,
          date: new Date().toISOString().split('T')[0],
          role: 'host' as const
        }));

        setHostingItems(prev => {
          const newItems = pageNum === 0 ? items : [...prev, ...items];
          // 최신순 정렬 (marketId 내림차순)
          return newItems.sort((a: any, b: any) => parseInt(b.id) - parseInt(a.id));
        });

        setHostingPage({
          pageNum: pageNum + 1,
          hasMore: items.length === PAGE_SIZE,
          loading: false
        });
      }
    } catch (error) {
      console.error('주최한 상품 로드 실패:', error);
      setHostingPage(prev => ({ ...prev, loading: false, hasMore: false }));
    }
  }, [hostingPage.loading, hostingPage.hasMore]);

  // 참여중인 상품 로드
  const loadParticipatingItems = useCallback(async (pageNum: number) => {
    if (participatingPage.loading || !participatingPage.hasMore) return;

    try {
      setParticipatingPage(prev => ({ ...prev, loading: true }));

      const response = await productService.getMyJoinedProducts({ pageNum, pageSize: PAGE_SIZE });
      if (response.success && response.data) {
        const markets = (response.data as any).markets || [];
        const items = markets.map((market: any) => ({
          id: market.marketId.toString(),
          title: market.title,
          category: market.categoryId,
          price: market.price,
          image: market.thumbnailImageUrl,
          status: market.status === 'RECRUITING' ? 'recruiting' as const :
                  market.status === 'ENDED' ? 'completed' as const :
                  'cancelled' as const,
          participants: {
            current: market.recruitNow,
            max: market.recruitMax
          },
          seller: {
            name: market.nickname,
            avatar: market.userProfileImageUrl
          },
          location: market.emdName,
          date: new Date().toISOString().split('T')[0],
          role: 'participant' as const
        }));

        setParticipatingItems(prev => {
          const newItems = pageNum === 0 ? items : [...prev, ...items];
          return newItems.sort((a: any, b: any) => parseInt(b.id) - parseInt(a.id));
        });

        setParticipatingPage({
          pageNum: pageNum + 1,
          hasMore: items.length === PAGE_SIZE,
          loading: false
        });
      }
    } catch (error) {
      console.error('참여중인 상품 로드 실패:', error);
      setParticipatingPage(prev => ({ ...prev, loading: false, hasMore: false }));
    }
  }, [participatingPage.loading, participatingPage.hasMore]);

  // 완료된 상품 로드
  const loadCompletedItems = useCallback(async (pageNum: number) => {
    if (completedPage.loading || !completedPage.hasMore) return;

    try {
      setCompletedPage(prev => ({ ...prev, loading: true }));

      const response = await productService.getMyCompletedProducts({ pageNum, pageSize: PAGE_SIZE });
      if (response.success && response.data) {
        const markets = (response.data as any).markets || [];
        const items = markets.map((market: any) => ({
          id: market.marketId.toString(),
          title: market.title,
          category: market.categoryId,
          price: market.price,
          image: market.thumbnailImageUrl,
          status: 'completed' as const,
          participants: {
            current: market.recruitNow,
            max: market.recruitMax
          },
          seller: {
            name: market.nickname,
            avatar: market.userProfileImageUrl
          },
          location: market.emdName,
          date: new Date().toISOString().split('T')[0],
          role: 'host' as const
        }));

        setCompletedItems(prev => {
          const newItems = pageNum === 0 ? items : [...prev, ...items];
          return newItems.sort((a: any, b: any) => parseInt(b.id) - parseInt(a.id));
        });

        setCompletedPage({
          pageNum: pageNum + 1,
          hasMore: items.length === PAGE_SIZE,
          loading: false
        });
      }
    } catch (error) {
      console.error('완료된 상품 로드 실패:', error);
      setCompletedPage(prev => ({ ...prev, loading: false, hasMore: false }));
    }
  }, [completedPage.loading, completedPage.hasMore]);

  // 좋아요한 상품 로드
  const loadLikedItems = useCallback(async (pageNum: number) => {
    if (!authUser?.userId || likedPage.loading || !likedPage.hasMore) return;

    try {
      setLikedPage(prev => ({ ...prev, loading: true }));

      const response = await cartService.getMyCarts(authUser.userId, {
        pageNum,
        pageSize: PAGE_SIZE
      });

      if (response.success && response.data) {
        const items = response.data.markets.map((market: any) => ({
          id: market.marketId.toString(),
          title: market.title,
          category: market.categoryId,
          price: market.price,
          image: market.thumbnailImageUrl,
          status: market.status === 'RECRUITING' ? 'recruiting' as const :
                  market.status === 'ENDED' ? 'completed' as const :
                  'cancelled' as const,
          participants: {
            current: market.recruitNow,
            max: market.recruitMax
          },
          seller: {
            name: market.nickname,
            avatar: market.userProfileImageUrl
          },
          location: market.emdName,
          date: new Date().toISOString().split('T')[0],
          role: 'participant' as const
        }));

        setLikedItems(prev => {
          const newItems = pageNum === 0 ? items : [...prev, ...items];
          return newItems.sort((a: any, b: any) => parseInt(b.id) - parseInt(a.id));
        });

        setLikedPage({
          pageNum: pageNum + 1,
          hasMore: items.length === PAGE_SIZE,
          loading: false
        });
      }
    } catch (error: any) {
      if (error?.response?.status === 404) {
        console.log('ℹ️ 좋아요한 항목이 없습니다.');
        setLikedItems([]);
      } else {
        console.error('좋아요 목록 로드 실패:', error);
      }
      setLikedPage(prev => ({ ...prev, loading: false, hasMore: false }));
    }
  }, [authUser, likedPage.loading, likedPage.hasMore]);

  // 초기 데이터 로드
  useEffect(() => {
    if (!authUser) return;

    loadHostingItems(0);
    loadParticipatingItems(0);
    loadCompletedItems(0);
    loadLikedItems(0);
  }, [authUser]);

  // Intersection Observer 설정
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // 현재 활성 탭에 따라 추가 데이터 로드
          switch (activeTab) {
            case 'hosting':
              if (hostingPage.hasMore && !hostingPage.loading) {
                loadHostingItems(hostingPage.pageNum);
              }
              break;
            case 'participating':
              if (participatingPage.hasMore && !participatingPage.loading) {
                loadParticipatingItems(participatingPage.pageNum);
              }
              break;
            case 'completed':
              if (completedPage.hasMore && !completedPage.loading) {
                loadCompletedItems(completedPage.pageNum);
              }
              break;
            case 'liked':
              if (likedPage.hasMore && !likedPage.loading) {
                loadLikedItems(likedPage.pageNum);
              }
              break;
          }
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [activeTab, hostingPage, participatingPage, completedPage, likedPage, loadHostingItems, loadParticipatingItems, loadCompletedItems, loadLikedItems]);

  // 탭 변경 시 URL 업데이트
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // 상품 카드 클릭 - 상세 페이지 이동
  const handleCardClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  // 좋아요 취소
  const handleRemoveWishlist = async (productId: string) => {
    if (!confirm('좋아요를 취소하시겠습니까?')) return;

    try {
      if (!authUser?.userId) {
        alert('로그인이 필요합니다.');
        return;
      }

      const response = await cartService.deleteCart(authUser.userId, parseInt(productId, 10));
      if (response.success) {
        alert('좋아요가 취소되었습니다.');
        setLikedItems(prev => prev.filter(item => item.id !== productId));
      }
    } catch (error) {
      console.error('좋아요 취소 실패:', error);
      alert('좋아요 취소 중 오류가 발생했습니다.');
    }
  };

  const getStatusBadge = (status: PurchaseItem['status']) => {
    const statusConfig = {
      recruiting: { label: '모집중', color: 'success' as const },
      processing: { label: '진행중', color: 'info' as const },
      completed: { label: '완료', color: 'primary' as const },
      cancelled: { label: '취소', color: 'error' as const }
    };

    const config = statusConfig[status];
    return <Badge count={0} color={config.color}>{config.label}</Badge>;
  };

  const renderPurchaseCard = (item: PurchaseItem) => (
    <div key={item.id} className="purchase-card">
      <div className="purchase-card-header">
        <div className="purchase-date">{item.date}</div>
        <div className="purchase-status">
          {getStatusBadge(item.status)}
        </div>
      </div>

      <div className="purchase-card-body" onClick={() => handleCardClick(item.id)} style={{ cursor: 'pointer' }}>
        <div className="purchase-image-container">
          {item.image ? (
            <img src={item.image} alt={item.title} className="purchase-image" />
          ) : (
            <div className="purchase-image-placeholder">
              <span>📦</span>
            </div>
          )}
        </div>

        <div className="purchase-info">
          <div className="purchase-category">{item.category}</div>
          <h3 className="purchase-title">{item.title}</h3>
          <div className="purchase-price">₩{item.price.toLocaleString()}</div>

          <div className="purchase-meta">
            <span className="purchase-participants">
              {item.participants.current}/{item.participants.max}명
              {item.status === 'recruiting' ? ' 모집중' : ' 모집완료'}
            </span>
            <span className="purchase-location">• {item.location}</span>
            {item.role === 'host' && (
              <span className="purchase-role">• 주최자</span>
            )}
          </div>
        </div>
      </div>

      <div className="purchase-card-footer">
        {item.status === 'recruiting' && item.role === 'host' && (
          <>
            <Button size="small" variant="outline" onClick={(e) => { e.stopPropagation(); navigate(`/products/${item.id}/edit`); }}>수정</Button>
          </>
        )}
        {item.status === 'completed' && (
          <Button size="small" variant="outline" onClick={(e) => { e.stopPropagation(); handleCardClick(item.id); }}>상세보기</Button>
        )}
        {activeTab === 'liked' && (
          <Button size="small" variant="outline" onClick={(e) => { e.stopPropagation(); handleRemoveWishlist(item.id); }}>♥ 좋아요 취소</Button>
        )}
      </div>
    </div>
  );

  // 로딩 스피너
  const renderLoadingSpinner = () => (
    <div className="loading-spinner" style={{ textAlign: 'center', padding: '20px' }}>
      <span>로딩 중...</span>
    </div>
  );

  const tabItems: TabItem[] = [
    {
      key: 'hosting',
      label: `내가 주최한 (${hostingItems.length})`,
      children: (
        <div className="purchase-list">
          {hostingItems.length > 0 ? (
            <>
              {hostingItems.map(renderPurchaseCard)}
              {hostingPage.loading && renderLoadingSpinner()}
              <div ref={observerTarget} style={{ height: '20px' }} />
            </>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">📦</span>
              <p className="empty-text">주최한 공동구매가 없습니다</p>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'participating',
      label: `참여중 (${participatingItems.filter(item => item.status === 'recruiting' || item.status === 'processing').length})`,
      children: (
        <div className="purchase-list">
          {participatingItems.filter(item => item.status === 'recruiting' || item.status === 'processing').length > 0 ? (
            <>
              {participatingItems
                .filter(item => item.status === 'recruiting' || item.status === 'processing')
                .map(renderPurchaseCard)}
              {participatingPage.loading && renderLoadingSpinner()}
              <div ref={observerTarget} style={{ height: '20px' }} />
            </>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">🛒</span>
              <p className="empty-text">참여중인 공동구매가 없습니다</p>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'completed',
      label: `완료 (${completedItems.length})`,
      children: (
        <div className="purchase-list">
          {completedItems.length > 0 ? (
            <>
              {completedItems.map(renderPurchaseCard)}
              {completedPage.loading && renderLoadingSpinner()}
              <div ref={observerTarget} style={{ height: '20px' }} />
            </>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">✅</span>
              <p className="empty-text">완료된 공동구매가 없습니다</p>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'liked',
      label: `좋아요 (${likedItems.length})`,
      children: (
        <div className="purchase-list">
          {likedItems.length > 0 ? (
            <>
              {likedItems.map(renderPurchaseCard)}
              {likedPage.loading && renderLoadingSpinner()}
              <div ref={observerTarget} style={{ height: '20px' }} />
            </>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">♥</span>
              <p className="empty-text">좋아요한 공동구매가 없습니다</p>
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <Layout isLoggedIn={true}>
      <div className="purchase-history-container">
        <div className="purchase-history-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← 뒤로가기
          </button>
          <h1 className="page-title">공동구매 내역</h1>
          <p className="page-subtitle">내가 주최하거나 참여한 공동구매 내역을 확인하세요</p>
        </div>

        <div className="purchase-history-content">
          <Tab
            items={tabItems}
            activeKey={activeTab}
            onChange={handleTabChange}
            variant="default"
          />
        </div>
      </div>
    </Layout>
  );
};

export default PurchaseHistory;
