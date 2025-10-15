import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Tab from '../../components/Tab';
import type { TabItem } from '../../components/Tab';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { productService, type Product } from '../../api/services/product';
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

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      if (!authUser) return;

      try {
        setLoading(true);

        // 주최한 상품
        const hostingResponse = await productService.getMyProducts();
        if (hostingResponse.success && hostingResponse.data) {
          const items = hostingResponse.data.items.map(p => convertProductToPurchaseItem(p, 'host'));
          setHostingItems(items);
        }

        // 참여중인 상품
        const participatingResponse = await productService.getMyJoinedProducts();
        if (participatingResponse.success && participatingResponse.data) {
          const items = participatingResponse.data.items
            .filter(p => p.status === 'active')
            .map(p => convertProductToPurchaseItem(p, 'participant'));
          setParticipatingItems(items);
        }

        // 완료된 상품 (주최 + 참여)
        const myCompletedResponse = await productService.getMyProducts();
        const joinedCompletedResponse = await productService.getMyJoinedProducts();

        const myCompleted = myCompletedResponse.success && myCompletedResponse.data
          ? myCompletedResponse.data.items.filter(p => p.status === 'completed').map(p => convertProductToPurchaseItem(p, 'host'))
          : [];

        const joinedCompleted = joinedCompletedResponse.success && joinedCompletedResponse.data
          ? joinedCompletedResponse.data.items.filter(p => p.status === 'completed').map(p => convertProductToPurchaseItem(p, 'participant'))
          : [];

        setCompletedItems([...myCompleted, ...joinedCompleted]);

        // 좋아요한 상품
        const likedResponse = await productService.getWishlistedProducts();
        if (likedResponse.success && likedResponse.data) {
          const items = likedResponse.data.items.map(p => convertProductToPurchaseItem(p, 'participant'));
          setLikedItems(items);
        }
      } catch (error) {
        console.error('데이터 로드 실패:', error);
        // Fallback to empty arrays
        setHostingItems([]);
        setParticipatingItems([]);
        setCompletedItems([]);
        setLikedItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [authUser]);

  // 탭 변경 시 URL 업데이트
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // 더미 데이터 (fallback용)
  const fallbackHostingItems: PurchaseItem[] = [
    {
      id: '1',
      title: '유기농 사과 10kg (부사)',
      category: '식품',
      price: 35000,
      status: 'recruiting',
      participants: { current: 15, max: 20 },
      seller: { name: '사과조아' },
      location: '서초동',
      date: '2025-01-15',
      role: 'host'
    },
    {
      id: '2',
      title: '프리미엄 화장지 30롤',
      category: '생활용품',
      price: 18900,
      status: 'completed',
      participants: { current: 10, max: 10 },
      seller: { name: '생활마트' },
      location: '방배동',
      date: '2025-01-10',
      role: 'host'
    }
  ];

  const fallbackParticipatingItems: PurchaseItem[] = [
    {
      id: '3',
      title: '기저귀 대형 4박스',
      category: '육아용품',
      price: 124000,
      status: 'recruiting',
      participants: { current: 19, max: 20 },
      seller: { name: '아기사랑' },
      location: '역삼동',
      date: '2025-01-18',
      role: 'participant'
    },
    {
      id: '4',
      title: '유기농 딸기 2kg',
      category: '식품',
      price: 25000,
      status: 'processing',
      participants: { current: 15, max: 15 },
      seller: { name: '딸기농장' },
      location: '서초동',
      date: '2025-01-12',
      role: 'participant'
    },
    {
      id: '5',
      title: '다이슨 청소기 공동구매',
      category: '전자제품',
      price: 450000,
      status: 'recruiting',
      participants: { current: 8, max: 10 },
      seller: { name: '전자마트' },
      location: '강남역',
      date: '2025-01-20',
      role: 'participant'
    }
  ];

  const fallbackCompletedItems: PurchaseItem[] = [
    {
      id: '6',
      title: '겨울 이불 세트',
      category: '생활용품',
      price: 89000,
      status: 'completed',
      participants: { current: 20, max: 20 },
      seller: { name: '침구전문점' },
      location: '방배동',
      date: '2024-12-25',
      role: 'participant'
    },
    {
      id: '7',
      title: '유기농 쌀 20kg',
      category: '식품',
      price: 65000,
      status: 'completed',
      participants: { current: 30, max: 30 },
      seller: { name: '농협마트' },
      location: '서초동',
      date: '2024-12-20',
      role: 'participant'
    },
    {
      id: '8',
      title: '크리스마스 케이크',
      category: '식품',
      price: 35000,
      status: 'completed',
      participants: { current: 15, max: 15 },
      seller: { name: '베이커리' },
      location: '방배동',
      date: '2024-12-24',
      role: 'host'
    }
  ];

  const fallbackLikedItems: PurchaseItem[] = [
    {
      id: '9',
      title: '프리미엄 에어프라이어',
      category: '전자제품',
      price: 180000,
      status: 'recruiting',
      participants: { current: 5, max: 15 },
      seller: { name: '전자마트' },
      location: '강남역',
      date: '2025-01-22',
      role: 'participant'
    },
    {
      id: '10',
      title: '유기농 아보카도 2kg',
      category: '식품',
      price: 28000,
      status: 'recruiting',
      participants: { current: 8, max: 12 },
      seller: { name: '건강농장' },
      location: '서초동',
      date: '2025-01-21',
      role: 'participant'
    },
    {
      id: '11',
      title: '무지 후드티 3장 세트',
      category: '의류',
      price: 45000,
      status: 'recruiting',
      participants: { current: 12, max: 20 },
      seller: { name: '패션스토어' },
      location: '홍대입구',
      date: '2025-01-19',
      role: 'participant'
    }
  ];

  // 상품 카드 클릭 - 상세 페이지 이동
  const handleCardClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  // 참여 취소
  const handleCancelParticipation = async (productId: string) => {
    if (!confirm('정말 참여를 취소하시겠습니까?')) return;

    try {
      const response = await productService.leaveProduct(productId);
      if (response.success) {
        alert('참여가 취소되었습니다.');
        // 데이터 다시 로드
        setParticipatingItems(prev => prev.filter(item => item.id !== productId));
      }
    } catch (error) {
      console.error('참여 취소 실패:', error);
      alert('참여 취소 중 오류가 발생했습니다.');
    }
  };

  // 좋아요 취소
  const handleRemoveWishlist = async (productId: string) => {
    if (!confirm('좋아요를 취소하시겠습니까?')) return;

    try {
      const response = await productService.toggleWishlist(productId);
      if (response.success) {
        alert('좋아요가 취소되었습니다.');
        // 데이터 다시 로드
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
            <Button size="small" variant="outline" onClick={(e) => { e.stopPropagation(); }}>모집 마감</Button>
          </>
        )}
        {item.status === 'recruiting' && item.role === 'participant' && (
          <Button size="small" variant="outline" onClick={(e) => { e.stopPropagation(); handleCancelParticipation(item.id); }}>참여 취소</Button>
        )}
        {item.status === 'processing' && (
          <Button size="small" variant="primary" onClick={(e) => { e.stopPropagation(); }}>채팅방 입장</Button>
        )}
        {item.status === 'completed' && (
          <>
            <Button size="small" variant="outline" onClick={(e) => { e.stopPropagation(); handleCardClick(item.id); }}>상세보기</Button>
            <Button size="small" variant="primary" onClick={(e) => { e.stopPropagation(); }}>다시 구매</Button>
          </>
        )}
        {activeTab === 'liked' && (
          <Button size="small" variant="outline" onClick={(e) => { e.stopPropagation(); handleRemoveWishlist(item.id); }}>♥ 좋아요 취소</Button>
        )}
      </div>
    </div>
  );

  const tabItems: TabItem[] = [
    {
      key: 'hosting',
      label: `내가 주최한 (${hostingItems.length})`,
      children: (
        <div className="purchase-list">
          {hostingItems.length > 0 ? (
            hostingItems.map(renderPurchaseCard)
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
            participatingItems
              .filter(item => item.status === 'recruiting' || item.status === 'processing')
              .map(renderPurchaseCard)
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
            completedItems.map(renderPurchaseCard)
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
            likedItems.map(renderPurchaseCard)
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
    <Layout isLoggedIn={true} notificationCount={3}>
      <div className="purchase-history-container">
        <div className="purchase-history-header">
          <h1 className="page-title">공동구매 내역</h1>
          <p className="page-subtitle">내가 주최하거나 참여한 공동구매 내역을 확인하세요</p>
        </div>

        <div className="purchase-history-content">
          <div className="filter-section">
            <div className="filter-row">
              <select className="filter-select">
                <option value="">전체 기간</option>
                <option value="1month">최근 1개월</option>
                <option value="3months">최근 3개월</option>
                <option value="6months">최근 6개월</option>
                <option value="1year">최근 1년</option>
              </select>
              
              <select className="filter-select">
                <option value="">전체 카테고리</option>
                <option value="food">식품</option>
                <option value="living">생활용품</option>
                <option value="baby">육아용품</option>
                <option value="electronics">전자제품</option>
              </select>
              
              <input
                type="text"
                className="filter-search"
                placeholder="상품명 검색..."
              />
            </div>
          </div>

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