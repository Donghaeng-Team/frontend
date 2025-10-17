// 카테고리 ID를 읽기 쉬운 이름으로 매핑
// 계층적 카테고리 코드 (8자리): 대분류(2) + 중분류(2) + 소분류(2) + 세분류(2)

interface CategoryInfo {
  id: string;
  name: string;
  parent?: string;
}

// 대분류 카테고리
const majorCategories: Record<string, string> = {
  '01': '식품',
  '02': '생활용품',
  '03': '육아용품',
  '04': '가전제품',
  '05': '패션·의류',
  '06': '뷰티·화장품',
  '07': '스포츠·레저',
  '08': '도서·문구',
  '09': '반려동물용품',
  '10': '기타'
};

// 중분류 카테고리 (식품 예시)
const subCategories: Record<string, string> = {
  '0101': '과일',
  '0102': '채소',
  '0103': '정육·계란',
  '0104': '수산물',
  '0105': '쌀·잡곡',
  '0106': '간편식',
  '0107': '음료·생수',
  '0108': '유제품',
  '0109': '베이커리',
  '0110': '기타 식품',

  '0201': '화장지·휴지',
  '0202': '세제·청소용품',
  '0203': '욕실용품',
  '0204': '주방용품',
  '0205': '생활잡화',

  '0301': '기저귀',
  '0302': '분유·이유식',
  '0303': '아기용품',
  '0304': '장난감',
};

/**
 * 카테고리 ID를 읽기 쉬운 이름으로 변환
 * @param categoryId - 8자리 카테고리 코드 (예: "01010101")
 * @returns 카테고리 이름 (예: "식품 > 과일")
 */
export const getCategoryName = (categoryId: string): string => {
  if (!categoryId || categoryId.length !== 8) {
    return '카테고리 미분류';
  }

  // 대분류 코드 추출 (첫 2자리)
  const majorCode = categoryId.substring(0, 2);
  const majorName = majorCategories[majorCode];

  // 중분류 코드 추출 (첫 4자리)
  const subCode = categoryId.substring(0, 4);
  const subName = subCategories[subCode];

  // 중분류가 있으면 "대분류 > 중분류" 형식으로 반환
  if (majorName && subName) {
    return `${majorName} > ${subName}`;
  }

  // 중분류가 없으면 대분류만 반환
  if (majorName) {
    return majorName;
  }

  // 매핑되지 않은 경우 ID 그대로 반환
  return categoryId;
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

  const majorCode = categoryId.substring(0, 2);
  return majorCategories[majorCode] || '미분류';
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

  const subCode = categoryId.substring(0, 4);
  return subCategories[subCode] || '';
};

/**
 * 카테고리 선택 옵션 목록 생성 (상품 등록 시 사용)
 */
export const getCategoryOptions = () => {
  const options: Array<{ value: string; label: string; parent?: string }> = [];

  // 대분류 옵션
  Object.entries(majorCategories).forEach(([code, name]) => {
    options.push({ value: `${code}000000`, label: name });
  });

  // 중분류 옵션
  Object.entries(subCategories).forEach(([code, name]) => {
    const majorCode = code.substring(0, 2);
    const majorName = majorCategories[majorCode];
    options.push({
      value: `${code}0000`,
      label: `${majorName} > ${name}`,
      parent: majorCode
    });
  });

  return options;
};
