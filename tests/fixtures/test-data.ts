/**
 * E2E 테스트용 공통 데이터
 */

export const TEST_USER = {
  email: process.env.E2E_EMAIL || 'test@example.com',
  password: process.env.E2E_PASSWORD || 'Test1234!@',
  name: '테스트유저',
};

export const TEST_DIVISION = {
  id: '11680101',
  sidoCode: '11',
  sidoName: '서울특별시',
  sggCode: '680',
  sggName: '강남구',
  emdCode: '101',
  emdName: '역삼동',
  centroidLat: '37.5000',
  centroidLng: '127.0364',
};

export const TEST_PRODUCT = {
  title: '[E2E테스트] 유기농 사과 공동구매',
  categoryId: '01',
  price: 15000,
  recruitMin: 2,
  recruitMax: 10,
  content: '신선한 유기농 사과를 함께 구매해요! 최소 2명부터 최대 10명까지 모집합니다. 픽업 장소는 강남역 2번 출구입니다.',
  locationText: '서울 강남구 역삼동',
  latitude: 37.498095,
  longitude: 127.027610,
};

export const TEST_POST = {
  category: 'local-news',
  title: '[E2E테스트] 동네 맛집 추천합니다',
  content: '역삼동에 새로 생긴 맛집 추천드려요. 파스타가 정말 맛있습니다!',
};

export const WAIT_TIMEOUT = {
  short: 3000,
  medium: 5000,
  long: 10000,
  navigation: 15000,
};
