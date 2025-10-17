// 카테고리 ID를 읽기 쉬운 이름으로 매핑
// 계층적 카테고리 코드 (8자리): 대분류(2) + 중분류(2) + 소분류(2) + 세분류(2)

interface CategoryInfo {
  id: string;
  name: string;
  parent?: string;
}

// foodCategories.json 구조
interface FoodCategory {
  code: string;
  name: string;
  sub?: FoodCategory[];
}

// foodCategories.json 데이터를 캐시
let categoriesCache: FoodCategory[] | null = null;

// foodCategories.json 로드
const loadCategories = async (): Promise<FoodCategory[]> => {
  if (categoriesCache) return categoriesCache;
  
  try {
    const response = await fetch('/foodCategories.json');
    const data = await response.json();
    categoriesCache = data;
    return data;
  } catch (error) {
    console.error('Failed to load categories:', error);
    return [];
  }
};

// 카테고리 ID로 이름 경로 찾기
const findCategoryPath = (categories: FoodCategory[], codes: string[], depth: number = 0): string[] => {
  if (depth >= codes.length || !categories) return [];
  
  const targetCode = codes[depth];
  const category = categories.find(cat => cat.code === targetCode);
  
  if (!category) return [];
  
  const path = [category.name];
  
  if (depth < codes.length - 1 && category.sub) {
    const subPath = findCategoryPath(category.sub, codes, depth + 1);
    return [...path, ...subPath];
  }
  
  return path;
};

/**
 * 카테고리 ID를 읽기 쉬운 이름으로 변환
 * @param categoryId - 8자리 카테고리 코드 (예: "01010101")
 * @returns 카테고리 이름 (예: "가공식품 > 조미료 > 종합조미료 > 천연/발효조미료")
 */
export const getCategoryName = (categoryId: string): string => {
  if (!categoryId || categoryId.length !== 8) {
    return '카테고리 미분류';
  }

  // 동기적으로 캐시된 데이터 사용 (비동기 로딩은 컴포넌트 레벨에서 처리)
  if (!categoriesCache) {
    // 캐시가 없으면 ID 그대로 반환 (초기 로딩 중)
    return categoryId;
  }

  // 8자리 코드를 2자리씩 분할
  const codes = [
    categoryId.substring(0, 2),
    categoryId.substring(2, 4),
    categoryId.substring(4, 6),
    categoryId.substring(6, 8)
  ].filter(code => code !== '00'); // '00'은 무시

  const path = findCategoryPath(categoriesCache, codes);
  
  return path.length > 0 ? path.join(' > ') : categoryId;
};

/**
 * 대분류 카테고리 이름만 반환
 * @param categoryId - 8자리 카테고리 코드
 * @returns 대분류 이름
 */
export const getMajorCategoryName = (categoryId: string): string => {
  if (!categoryId || categoryId.length < 2) {
    return '미분류';
  }

  if (!categoriesCache) {
    return '로딩 중';
  }

  const majorCode = categoryId.substring(0, 2);
  const category = categoriesCache.find(cat => cat.code === majorCode);
  
  return category ? category.name : '미분류';
};

/**
 * 중분류 카테고리 이름만 반환
 * @param categoryId - 8자리 카테고리 코드
 * @returns 중분류 이름
 */
export const getSubCategoryName = (categoryId: string): string => {
  if (!categoryId || categoryId.length < 4) {
    return '';
  }

  if (!categoriesCache) {
    return '';
  }

  const majorCode = categoryId.substring(0, 2);
  const subCode = categoryId.substring(2, 4);
  
  const major = categoriesCache.find(cat => cat.code === majorCode);
  if (!major || !major.sub) return '';
  
  const sub = major.sub.find(cat => cat.code === subCode);
  return sub ? sub.name : '';
};

/**
 * 카테고리 경로를 제한된 깊이로 반환 (리스트용)
 * @param categoryId - 8자리 카테고리 코드
 * @param maxDepth - 최대 표시 깊이 (기본값: 2)
 * @returns 제한된 깊이의 카테고리 이름
 */
export const getCategoryNameWithDepth = (categoryId: string, maxDepth: number = 2): string => {
  if (!categoryId || categoryId.length !== 8) {
    return '카테고리 미분류';
  }

  if (!categoriesCache) {
    return categoryId;
  }

  // 8자리 코드를 2자리씩 분할
  const codes = [
    categoryId.substring(0, 2),
    categoryId.substring(2, 4),
    categoryId.substring(4, 6),
    categoryId.substring(6, 8)
  ].filter(code => code !== '00'); // '00'은 무시

  // maxDepth만큼만 사용
  const limitedCodes = codes.slice(0, maxDepth);
  const path = findCategoryPath(categoriesCache, limitedCodes);
  
  return path.length > 0 ? path.join(' > ') : categoryId;
};

// 초기화: 앱 시작 시 카테고리 데이터 로드
loadCategories();


