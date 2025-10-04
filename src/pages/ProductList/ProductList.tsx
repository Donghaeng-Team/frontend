import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import CategorySelector from '../../components/CategorySelector';
import type { CategoryItem } from '../../components/CategorySelector';
import Slider from '../../components/Slider';
import SearchBar from '../../components/SearchBar';
import Dropdown from '../../components/Dropdown';
import ProductCard from '../../components/ProductCard';
import Button from '../../components/Button';
import Skeleton from '../../components/Skeleton';
// 임시로 작은 샘플 데이터를 사용하여 테스트
const sampleFoodCategoriesData = [
  {
    "code": "01",
    "name": "가공식품",
    "sub": [
      {
        "code": "01",
        "name": "조미료",
        "sub": [
          {
            "code": "01",
            "name": "종합조미료",
            "sub": [
              { "code": "01", "name": "천연/발효조미료" },
              { "code": "02", "name": "식초" }
            ]
          }
        ]
      },
      {
        "code": "02",
        "name": "유제품",
        "sub": [
          { "code": "01", "name": "우유" },
          { "code": "02", "name": "요구르트" }
        ]
      }
    ]
  },
  {
    "code": "02",
    "name": "신선식품",
    "sub": []
  }
];
import './ProductList.css';

// 상품 데이터 타입
interface Product {
  id: string;
  category: string;
  title: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  seller: {
    name: string;
    avatar?: string;
  };
  participants: {
    current: number;
    max: number;
  };
  location: string;
  status: 'active' | 'completed' | 'pending';
  image?: string;
}

// foodCategories.json 데이터 타입
interface FoodCategoryData {
  code: string;
  name: string;
  sub?: FoodCategoryData[];
}

// foodCategories.json 데이터를 CategoryItem 형태로 변환
const transformFoodCategories = (categories: FoodCategoryData[]): CategoryItem[] => {
  return categories.map(category => ({
    value: category.code,
    label: category.name,
    children: category.sub ? transformFoodCategories(category.sub) : []
  }));
};

// 카테고리 데이터 로드 함수
const loadCategoryData = async (): Promise<CategoryItem[]> => {
  try {
    // 실제 JSON 파일에서 로드
    const response = await fetch('/foodCategories.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const foodCategories = await response.json() as FoodCategoryData[];
    const transformed = transformFoodCategories(foodCategories);
    return transformed;
  } catch (error) {
    console.error('Failed to load food categories from file, using sample data:', error);
    // 실패 시 샘플 데이터 사용
    const foodCategories = sampleFoodCategoriesData as FoodCategoryData[];
    const transformed = transformFoodCategories(foodCategories);
    return transformed;
  }
};

// 정렬 옵션
const sortOptions = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'price-low', label: '가격 낮은순' },
  { value: 'price-high', label: '가격 높은순' },
  { value: 'closing', label: '마감 임박순' }
];

// 더미 상품 생성 함수
const generateMockProducts = (start: number, count: number): Product[] => {
  const categories = ['식품', '생활용품', '육아용품', '전자제품', '패션/뷰티', '가구/인테리어', '기타'];
  const titles = [
    '유기농 사과 10kg (부사)', '프리미엄 화장지 30롤', '기저귀 대형 4박스',
    '공기청정기 렌탈', '겨울 패딩 공동구매', '유기농 닭가슴살 100팩',
    '사무용 의자 10개 세트', '반려동물 사료 대량구매'
  ];
  const sellers = ['사과조아', '생활마트', '아기사랑', '렌탈킹', '패션매니아', '헬스마트', '오피스매니아', '펫러버'];
  const locations = ['서초동', '방배동', '역삼동', '잠원동', '반포동', '양재동', '삼성동', '대치동'];

  return Array.from({ length: count }, (_, i) => {
    return {
      id: generateUniqueId(),
      category: categories[Math.floor(Math.random() * categories.length)],
      title: `${titles[Math.floor(Math.random() * titles.length)]} #${start + i}`,
      price: Math.floor(Math.random() * 200000) + 10000,
      originalPrice: Math.random() > 0.5 ? Math.floor(Math.random() * 250000) + 50000 : undefined,
      discount: Math.random() > 0.7 ? Math.floor(Math.random() * 50) + 10 : undefined,
      seller: { name: sellers[Math.floor(Math.random() * sellers.length)] },
      participants: {
        current: Math.floor(Math.random() * 20) + 1,
        max: 20
      },
      location: locations[Math.floor(Math.random() * locations.length)],
      status: Math.random() > 0.8 ? 'completed' : 'active' as 'active' | 'completed'
    };
  });
};

const ITEMS_PER_PAGE = 12;

// 고유 ID 생성기
let productIdCounter = 1;
const generateUniqueId = (): string => {
  return `product-${Date.now()}-${productIdCounter++}-${Math.random().toString(36).substr(2, 9)}`;
};

const ProductList: React.FC = () => {
  // 상태 관리
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [tempCategories, setTempCategories] = useState<string[]>([]);
  const [distanceRange, setDistanceRange] = useState(2);
  const [tempDistanceRange, setTempDistanceRange] = useState(2);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [isFilterChanged, setIsFilterChanged] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [categoryData, setCategoryData] = useState<CategoryItem[]>([]);
  
  // 초기 데이터 로드
  useEffect(() => {
    const initializeData = async () => {
      try {
        // 카테고리 데이터 로드
        const categories = await loadCategoryData();
        setCategoryData(categories);

        // 상품 데이터 로드 시뮬레이션
        setTimeout(() => {
          const mockProducts = generateMockProducts(1, 100);
          setAllProducts(mockProducts);
          setDisplayedProducts(mockProducts.slice(0, ITEMS_PER_PAGE));
          setTotalCount(mockProducts.length);
          setHasMore(mockProducts.length > ITEMS_PER_PAGE);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Failed to initialize data:', error);
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // 필터 변경 감지
  useEffect(() => {
    const hasChanges = 
      tempDistanceRange !== distanceRange || 
      JSON.stringify(tempCategories) !== JSON.stringify(selectedCategories);
    setIsFilterChanged(hasChanges);
  }, [tempDistanceRange, distanceRange, tempCategories, selectedCategories]);

  // 무한 스크롤 - 더보기 버튼 클릭
  const handleLoadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;

    setLoadingMore(true);
    
    // API 호출 시뮬레이션
    setTimeout(() => {
      const nextPage = page + 1;
      const startIndex = page * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const nextProducts = allProducts.slice(startIndex, endIndex);
      
      if (nextProducts.length > 0) {
        setDisplayedProducts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newProducts = nextProducts.filter(p => !existingIds.has(p.id));
          return [...prev, ...newProducts];
        });
        setPage(nextPage);
        setHasMore(endIndex < allProducts.length);
      } else {
        setHasMore(false);
      }
      
      setLoadingMore(false);
    }, 500);
  }, [page, allProducts, hasMore, loadingMore]);

  // 스크롤 이벤트 처리 (자동 로드)
  useEffect(() => {
    const handleScroll = () => {
      // 스크롤이 하단에서 200px 이내에 도달하면 자동으로 더 로드
      if (window.innerHeight + document.documentElement.scrollTop 
          >= document.documentElement.offsetHeight - 200) {
        handleLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleLoadMore]);

  // 카테고리 선택 핸들러
  const handleCategoryChange = (values: string[], labels: string[]) => {
    setTempCategories(values);
  };

  // 거리 범위 변경 핸들러
  const handleDistanceChange = (value: number) => {
    setTempDistanceRange(value);
  };

  // 조건 적용 핸들러
  const handleApplyFilters = () => {
    setDistanceRange(tempDistanceRange);
    setSelectedCategories(tempCategories);
    setIsFilterChanged(false);
    
    // 실제로는 API 호출하여 필터링된 상품 목록 가져오기
    
    // 필터 적용 시 목록 초기화
    setPage(1);
    setLoadingMore(true);
    
    setTimeout(() => {
      // 더미 필터링 (실제로는 서버에서 필터링된 데이터 받아옴)
      let filtered = [...allProducts];
      if (tempCategories.length > 0) {
        // 카테고리 필터링 로직
      }
      setDisplayedProducts(filtered.slice(0, ITEMS_PER_PAGE));
      setHasMore(filtered.length > ITEMS_PER_PAGE);
      setLoadingMore(false);
    }, 500);
  };

  // 필터 초기화 핸들러
  const handleResetFilters = () => {
    setTempDistanceRange(2);
    setTempCategories([]);
    setDistanceRange(2);
    setSelectedCategories([]);
    setIsFilterChanged(false);
    setPage(1);
    setDisplayedProducts(allProducts.slice(0, ITEMS_PER_PAGE));
    setHasMore(allProducts.length > ITEMS_PER_PAGE);
  };

  // 검색 핸들러
  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    setPage(1);
    
    const filtered = allProducts.filter(product => 
      product.title.toLowerCase().includes(keyword.toLowerCase()) ||
      product.category.toLowerCase().includes(keyword.toLowerCase())
    );
    
    setDisplayedProducts(filtered.slice(0, ITEMS_PER_PAGE));
    setHasMore(filtered.length > ITEMS_PER_PAGE);
    setTotalCount(filtered.length);
  };

  // 정렬 핸들러
  const handleSort = (value: string | number) => {
    setSortBy(value as string);
    const sorted = [...displayedProducts];
    
    switch(value) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        sorted.sort((a, b) => 
          (b.participants.current / b.participants.max) - 
          (a.participants.current / a.participants.max)
        );
        break;
      default:
        // 최신순 정렬
        break;
    }
    
    setDisplayedProducts(sorted);
  };

  // 카테고리 경로 생성
  const getCategoryPath = () => {
    if (selectedCategories.length === 0) return '전체';

    // 실제로는 선택된 카테고리의 라벨을 가져와서 표시
    return '가공식품 > 유제품 > 요구르트 > 기타요구르트';
  };

  // 내부 스크롤 시 외부 스크롤 방지
  const handleWheel = (e: React.WheelEvent) => {
    const target = e.currentTarget as HTMLElement;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;

    // 스크롤이 맨 위 또는 맨 아래에 도달했을 때만 외부 스크롤 허용
    if ((scrollTop === 0 && e.deltaY < 0) ||
        (scrollTop + clientHeight >= scrollHeight && e.deltaY > 0)) {
      return; // 기본 동작 허용
    }

    e.stopPropagation(); // 외부 스크롤 이벤트 전파 차단
  };

  return (
    <Layout isLoggedIn={true} notificationCount={3}>
      <div className="product-list-container">
        {/* 필터 섹션 */}
        <section className="filter-section">
          <div className="filter-content">
              {/* 카테고리 필터 */}
              <div className="category-filter-container">
                <h3 className="filter-title">카테고리</h3>
                <CategorySelector
                  data={categoryData}
                  maxLevel={4}
                  onChange={handleCategoryChange}
                  value={tempCategories}
                  className="product-category-selector"
                />
              </div>

              {/* 동네 범위 필터 */}
              <div className="distance-filter-container">
                <h3 className="filter-title">동네 범위</h3>
                <div className="distance-slider-wrapper">
                  <Slider 
                    min={0}
                    max={3}
                    value={tempDistanceRange}
                    defaultValue={2}
                    onChange={handleDistanceChange}
                    step={1}
                    marks={[
                      { value: 0, label: '가까운 동네' },
                      { value: 1 },
                      { value: 2 },
                      { value: 3, label: '먼 동네' }
                    ]}
                    snapToMarks={true}
                  />
                </div>
              </div>

              {/* 필터 버튼 영역 */}
              <div className="filter-actions">
                <Button 
                  variant="outline"
                  onClick={handleResetFilters}
                  disabled={!isFilterChanged}
                >
                  초기화
                </Button>
                <Button 
                  variant="primary"
                  onClick={handleApplyFilters}
                  disabled={!isFilterChanged}
                >
                  조건 적용
                </Button>
              </div>
          </div>
        </section>

        {/* 상품 목록 섹션 */}
        <section className="products-section">
          {/* 목록 헤더 */}
          <div className="products-header">
            <div className="products-info">
              <div className="products-count">
                전체 {totalCount}개 ({getCategoryPath()})
              </div>
              <div className="products-search">
                <SearchBar 
                  placeholder="상품 검색..."
                  onSearch={handleSearch}
                  size="medium"
                />
              </div>
            </div>
            <div className="products-sort">
              <Dropdown 
                options={sortOptions}
                value={sortBy}
                onChange={handleSort}
                size="small"
              />
            </div>
          </div>

          {/* 상품 그리드 */}
          <div className="products-grid" onWheel={handleWheel}>
            {loading ? (
              // 초기 로딩 스켈레톤
              Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                <Skeleton 
                  key={index}
                  variant="rounded"
                  height={369}
                  animation="wave"
                />
              ))
            ) : displayedProducts.length > 0 ? (
              // 상품 카드 목록
              displayedProducts.map(product => (
                <ProductCard 
                  key={product.id}
                  {...product}
                  onClick={() => {}}
                />
              ))
            ) : (
              // 검색 결과 없음
              <div className="no-results">
                <p>검색 결과가 없습니다.</p>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchKeyword('');
                    handleResetFilters();
                  }}
                >
                  필터 초기화
                </Button>
              </div>
            )}
          </div>

          {/* 로딩 중 표시 (더 로드할 때) */}
          {loadingMore && (
            <div className="products-loading-more">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton 
                  key={`loading-${index}`}
                  variant="rounded"
                  height={369}
                  animation="wave"
                />
              ))}
            </div>
          )}

          {/* 더보기 버튼 (수동 로드) */}
          {!loading && hasMore && displayedProducts.length >= ITEMS_PER_PAGE && (
            <div className="products-more">
              <Button 
                variant="outline"
                size="large"
                fullWidth
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? '로딩 중...' : `더보기 (${displayedProducts.length}/${totalCount})`}
              </Button>
            </div>
          )}

          {/* 모든 상품 로드 완료 */}
          {!hasMore && displayedProducts.length > 0 && (
            <div className="products-end">
              <p>모든 상품을 불러왔습니다</p>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default ProductList;