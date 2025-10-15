import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import CategorySelector from '../../components/CategorySelector';
import type { CategoryItem } from '../../components/CategorySelector';
import Slider from '../../components/Slider';
import SearchBar from '../../components/SearchBar';
import Dropdown from '../../components/Dropdown';
import ProductCard from '../../components/ProductCard';
import Button from '../../components/Button';
import Skeleton from '../../components/Skeleton';
import { productService, type Product as ApiProduct } from '../../api/services/product';
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

const ProductList: React.FC = () => {
  const navigate = useNavigate();

  // 상태 관리
  const [displayedProducts, setDisplayedProducts] = useState<ApiProduct[]>([]);
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
        setLoading(true);

        // 카테고리 데이터 로드
        const categories = await loadCategoryData();
        setCategoryData(categories);

        // 상품 데이터 로드
        const response = await productService.getProducts({
          page: 1,
          size: ITEMS_PER_PAGE,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });

        if (response.success && response.data) {
          setDisplayedProducts(response.data.content);
          setTotalCount(response.data.totalElements);
          setPage(1);
          setHasMore(response.data.content.length < response.data.totalElements);
        }
      } catch (error) {
        console.error('Failed to initialize data:', error);
        alert('상품 목록을 불러오는데 실패했습니다.');
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
    if (!hasMore || loadingMore) return;

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

      const response = await productService.getProducts({
        page: nextPage,
        size: ITEMS_PER_PAGE,
        query: searchKeyword || undefined,
        category: selectedCategories.length > 0 ? selectedCategories[selectedCategories.length - 1] : undefined,
        sortBy: sortByApi,
        sortOrder: sortOrderApi
      });

      if (response.success && response.data) {
        setDisplayedProducts(prev => [...prev, ...response.data!.content]);
        setPage(nextPage);
        setHasMore(displayedProducts.length + response.data.content.length < response.data.totalElements);
      }
    } catch (error) {
      console.error('Failed to load more products:', error);
      alert('상품을 더 불러오는데 실패했습니다.');
    } finally {
      setLoadingMore(false);
    }
  }, [page, hasMore, loadingMore, sortBy, searchKeyword, selectedCategories, displayedProducts.length]);

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

      const response = await productService.getProducts({
        page: 1,
        size: ITEMS_PER_PAGE,
        category: tempCategories.length > 0 ? tempCategories[tempCategories.length - 1] : undefined,
        query: searchKeyword || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      if (response.success && response.data) {
        setDisplayedProducts(response.data.content);
        setTotalCount(response.data.totalElements);
        setPage(1);
        setHasMore(response.data.content.length < response.data.totalElements);
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

      const response = await productService.getProducts({
        page: 1,
        size: ITEMS_PER_PAGE,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      if (response.success && response.data) {
        setDisplayedProducts(response.data.content);
        setTotalCount(response.data.totalElements);
        setPage(1);
        setHasMore(response.data.content.length < response.data.totalElements);
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

      const response = await productService.getProducts({
        page: 1,
        size: ITEMS_PER_PAGE,
        query: keyword || undefined,
        category: selectedCategories.length > 0 ? selectedCategories[selectedCategories.length - 1] : undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      if (response.success && response.data) {
        setDisplayedProducts(response.data.content);
        setTotalCount(response.data.totalElements);
        setPage(1);
        setHasMore(response.data.content.length < response.data.totalElements);
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

      const response = await productService.getProducts({
        page: 1,
        size: ITEMS_PER_PAGE,
        query: searchKeyword || undefined,
        category: selectedCategories.length > 0 ? selectedCategories[selectedCategories.length - 1] : undefined,
        sortBy: sortByApi,
        sortOrder: sortOrderApi
      });

      if (response.success && response.data) {
        setDisplayedProducts(response.data.content);
        setTotalCount(response.data.totalElements);
        setPage(1);
        setHasMore(response.data.content.length < response.data.totalElements);
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
                  image={product.images && product.images.length > 0 ? product.images[0] : undefined}
                  category={product.category}
                  title={product.title}
                  price={product.price}
                  originalPrice={product.discountPrice}
                  discount={product.discountPrice ? Math.round(((product.discountPrice - product.price) / product.discountPrice) * 100) : undefined}
                  seller={{
                    name: product.seller.name,
                    avatar: product.seller.profileImage
                  }}
                  participants={{
                    current: product.currentQuantity,
                    max: product.targetQuantity
                  }}
                  location={product.location.dong}
                  status={product.status}
                  onClick={() => navigate(`/products/${product.id}`)}
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