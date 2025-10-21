import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import MobileHeader from '../../components/MobileHeader';
import CategorySelector from '../../components/CategorySelector';
import type { CategoryItem } from '../../components/CategorySelector';
import Slider from '../../components/Slider';
import SearchBar from '../../components/SearchBar';
import Dropdown from '../../components/Dropdown';
import ProductCard from '../../components/ProductCard';
import Button from '../../components/Button';
import Skeleton from '../../components/Skeleton';
import { marketService } from '../../api/services/market';
import type { MarketSimpleResponse } from '../../types/market';
import { APP_CONSTANTS } from '../../utils/constants';
import { getCategoryNameWithDepth } from '../../utils/categoryMapping';
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

const ITEMS_PER_PAGE = 12;

// 타입 별칭 정의
type ApiProduct = MarketSimpleResponse;

const ProductList: React.FC = () => {
  const navigate = useNavigate();

  // 상태 관리
  const [displayedProducts, setDisplayedProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
  const [divisionId, setDivisionId] = useState<string>('11650510'); // 기본값: 서초구 서초동
  const [isFilterOpen, setIsFilterOpen] = useState(false); // 모바일 필터 토글 상태
  
  // 초기 데이터 로드
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);

        // 카테고리 데이터 로드
        const categories = await loadCategoryData();
        setCategoryData(categories);

        // 로컬스토리지에서 선택된 위치 정보 가져오기
        const selectedLocationStr = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.SELECTED_LOCATION);
        let currentDivisionId = '11650510'; // 기본값: 서초구 서초동
        
        if (selectedLocationStr) {
          try {
            const selectedLocation = JSON.parse(selectedLocationStr);
            if (selectedLocation && selectedLocation.id) {
              currentDivisionId = selectedLocation.id;
            }
          } catch (error) {
            console.error('Failed to parse selected location:', error);
          }
        }

        setDivisionId(currentDivisionId);
        console.log('📍 Using divisionId:', currentDivisionId);

        // 상품 데이터 로드 (Public API 사용)
        const response = await marketService.getMarketPosts({
          divisionId: currentDivisionId,
          depth: 1,
          pageNum: 0,
          pageSize: ITEMS_PER_PAGE
        });

        console.log('✅ Market API Response:', response);

        if (response.success && response.data && response.data.markets.length > 0) {
          console.log('📦 Markets content:', response.data.markets);
          console.log('📊 Total elements:', response.data.totalElements);
          setDisplayedProducts(response.data.markets);
          setTotalCount(response.data.totalElements);
          setPage(0);  // 0-based로 변경
          setHasMore(response.data.markets.length < response.data.totalElements);
        } else {
          console.warn('⚠️ API returned no data');
          setDisplayedProducts([]);
          setTotalCount(0);
          setPage(0);
          setHasMore(false);
        }
      } catch (error: any) {
        console.error('❌ Failed to load markets from API:', error);
        
        // 500 에러는 데이터가 없는 것으로 처리 (에러 표시 안 함)
        if (error.response?.status === 500) {
          console.warn('⚠️ 500 error - treating as no data available');
          setDisplayedProducts([]);
          setTotalCount(0);
          setPage(0);
          setHasMore(false);
        } else {
          // 다른 에러는 에러 메시지 표시
          const errorMessage = error.response?.data?.message || error.message || '상품 목록을 불러오는 데 실패했습니다.';
          setError(errorMessage);
          setDisplayedProducts([]);
          setTotalCount(0);
          setPage(0);
          setHasMore(false);
        }
      } finally {
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
  const handleLoadMore = useCallback(async () => {
    if (!hasMore || loadingMore || loading) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;

      // 정렬 기준 변환
      let sortByApi: 'createdAt' | 'deadline' | 'price' | 'popularity' = 'createdAt';
      let sortOrderApi: 'asc' | 'desc' = 'desc';

      if (sortBy === 'price-low') {
        sortByApi = 'price';
        sortOrderApi = 'asc';
      } else if (sortBy === 'price-high') {
        sortByApi = 'price';
        sortOrderApi = 'desc';
      } else if (sortBy === 'popular') {
        sortByApi = 'popularity';
        sortOrderApi = 'desc';
      } else if (sortBy === 'closing') {
        sortByApi = 'deadline';
        sortOrderApi = 'asc';
      }

      // 현재 필터 적용
      const categoryId = selectedCategories.length > 0 ? selectedCategories.join('') : undefined;

      const response = await marketService.getMarketPosts({
        divisionId: divisionId,
        depth: distanceRange,
        categoryId: categoryId,
        keyword: searchKeyword || undefined,
        pageNum: nextPage,
        pageSize: ITEMS_PER_PAGE
      });

      if (response.success && response.data) {
        setDisplayedProducts(prev => [...prev, ...response.data!.markets]);
        setPage(nextPage);
        setHasMore(displayedProducts.length + response.data.markets.length < response.data.totalElements);
      }
    } catch (error) {
      console.error('Failed to load more products:', error);
      alert('상품을 더 불러오는데 실패했습니다.');
    } finally {
      setLoadingMore(false);
    }
  }, [page, hasMore, loadingMore, sortBy, searchKeyword, selectedCategories, displayedProducts.length, divisionId]);

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
  const handleApplyFilters = async () => {
    try {
      setDistanceRange(tempDistanceRange);
      setSelectedCategories(tempCategories);
      setIsFilterChanged(false);
      setLoadingMore(true);

      // 카테고리 ID: 선택된 카테고리의 마지막 값 사용 (8자리 전체)
      const categoryId = tempCategories.length > 0 ? tempCategories.join('') : undefined;

      console.log('🔍 Applying filters:', {
        divisionId,
        depth: tempDistanceRange,
        categoryId,
        pageNum: 0,
        pageSize: ITEMS_PER_PAGE
      });

      const response = await marketService.getMarketPosts({
        divisionId: divisionId,
        depth: tempDistanceRange,
        categoryId: categoryId,
        pageNum: 0,
        pageSize: ITEMS_PER_PAGE
      });

      if (response.success && response.data) {
        setDisplayedProducts(response.data.markets);
        setTotalCount(response.data.totalElements);
        setPage(0);
        setHasMore(response.data.markets.length < response.data.totalElements);
      }
    } catch (error) {
      console.error('Failed to apply filters:', error);
      alert('필터 적용에 실패했습니다.');
    } finally {
      setLoadingMore(false);
    }
  };

  // 필터 초기화 핸들러
  const handleResetFilters = async () => {
    try {
      setTempDistanceRange(2);
      setTempCategories([]);
      setDistanceRange(2);
      setSelectedCategories([]);
      setIsFilterChanged(false);
      setLoadingMore(true);

      const response = await marketService.getMarketPosts({
        divisionId: divisionId,
        depth: 1,
        pageNum: 0,
        pageSize: ITEMS_PER_PAGE
      });

      if (response.success && response.data) {
        setDisplayedProducts(response.data.markets);
        setTotalCount(response.data.totalElements);
        setPage(0);
        setHasMore(response.data.markets.length < response.data.totalElements);
      }
    } catch (error) {
      console.error('Failed to reset filters:', error);
      alert('필터 초기화에 실패했습니다.');
    } finally {
      setLoadingMore(false);
    }
  };

  // 검색 핸들러
  const handleSearch = async (keyword: string) => {
    try {
      setSearchKeyword(keyword);
      setLoadingMore(true);

      // 현재 필터 적용
      const categoryId = selectedCategories.length > 0 ? selectedCategories.join('') : undefined;

      const response = await marketService.getMarketPosts({
        divisionId: divisionId,
        depth: distanceRange,
        categoryId: categoryId,
        keyword: keyword || undefined,
        pageNum: 0,
        pageSize: ITEMS_PER_PAGE
      });

      if (response.success && response.data) {
        setDisplayedProducts(response.data.markets);
        setTotalCount(response.data.totalElements);
        setPage(0);
        setHasMore(response.data.markets.length < response.data.totalElements);
      }
    } catch (error) {
      console.error('Failed to search products:', error);
      alert('검색에 실패했습니다.');
    } finally {
      setLoadingMore(false);
    }
  };

  // 정렬 핸들러
  const handleSort = async (value: string | number) => {
    try {
      setSortBy(value as string);
      setLoadingMore(true);

      // 정렬 기준 변환
      let sortByApi: 'createdAt' | 'deadline' | 'price' | 'popularity' = 'createdAt';
      let sortOrderApi: 'asc' | 'desc' = 'desc';

      if (value === 'price-low') {
        sortByApi = 'price';
        sortOrderApi = 'asc';
      } else if (value === 'price-high') {
        sortByApi = 'price';
        sortOrderApi = 'desc';
      } else if (value === 'popular') {
        sortByApi = 'popularity';
        sortOrderApi = 'desc';
      } else if (value === 'closing') {
        sortByApi = 'deadline';
        sortOrderApi = 'asc';
      }

      // 현재 필터 적용
      const categoryId = selectedCategories.length > 0 ? selectedCategories.join('') : undefined;

      const response = await marketService.getMarketPosts({
        divisionId: divisionId,
        depth: distanceRange,
        categoryId: categoryId,
        keyword: searchKeyword || undefined,
        pageNum: 0,
        pageSize: ITEMS_PER_PAGE
      });

      if (response.success && response.data) {
        setDisplayedProducts(response.data.markets);
        setTotalCount(response.data.totalElements);
        setPage(0);
        setHasMore(response.data.markets.length < response.data.totalElements);
      }
    } catch (error) {
      console.error('Failed to sort products:', error);
      alert('정렬에 실패했습니다.');
    } finally {
      setLoadingMore(false);
    }
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
    <>
      <MobileHeader />
      <Layout isLoggedIn={true} notificationCount={3}>
      <div className="product-list-container">
        {/* 필터 섹션 */}
        <section className="filter-section">
          {/* 모바일 필터 토글 버튼 */}
          <button 
            className="filter-toggle-button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            aria-label="필터 열기/닫기"
          >
            <span className="filter-toggle-icon">{isFilterOpen ? '▲' : '▼'}</span>
            <span className="filter-toggle-text">필터</span>
          </button>

          <div className={`filter-content ${isFilterOpen ? 'filter-content-open' : ''}`}>
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
            {error ? (
              // 에러 표시
              <div className="error-container">
                <div className="error-icon">⚠️</div>
                <h3>상품 목록을 불러올 수 없습니다</h3>
                <p className="error-message-text">{error}</p>
                <p className="error-hint">백엔드 서버 연결을 확인해주세요.</p>
                <Button
                  variant="primary"
                  onClick={() => {
                    setError(null);
                    window.location.reload();
                  }}
                >
                  다시 시도
                </Button>
              </div>
            ) : loading ? (
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
                  key={product.marketId}
                  image={product.thumbnailImageUrl || undefined}
                  category={getCategoryNameWithDepth(product.categoryId, 4)}
                  title={product.title}
                  price={product.price}
                  seller={{
                    name: product.nickname,
                    avatar: product.userProfileImageUrl || undefined
                  }}
                  participants={{
                    current: product.recruitNow,
                    max: product.recruitMax
                  }}
                  location={product.emdName}
                  status={product.status === 'RECRUITING' ? 'active' :
                         product.status === 'ENDED' ? 'completed' : 'pending'}
                  onClick={() => navigate(`/products/${product.marketId}`)}
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
    </>
  );
};

export default ProductList;