import { Page } from '@playwright/test';
import { TEST_USER, TEST_DIVISION } from '../fixtures/test-data';

/**
 * 로그인 헬퍼 함수
 */
export async function login(page: Page, email = TEST_USER.email, password = TEST_USER.password) {
  await page.goto('/login-form');
  await page.waitForLoadState('networkidle');

  await page.fill('input[name="email"], input[type="email"]', email);
  await page.fill('input[name="password"], input[type="password"]', password);
  await page.click('button[type="submit"]');

  // 로그인 성공 후 리다이렉트 대기
  await page.waitForURL(/^\/(products|community|mypage)?/, { timeout: 10000 });
}

/**
 * 로그아웃 헬퍼 함수
 */
export async function logout(page: Page) {
  // 마이페이지 또는 헤더에서 로그아웃
  await page.goto('/mypage');
  await page.waitForLoadState('networkidle');

  const logoutButton = page.locator('button:has-text("로그아웃"), a:has-text("로그아웃")');
  if (await logoutButton.isVisible()) {
    await logoutButton.click();
    await page.waitForURL('/login', { timeout: 5000 });
  }
}

/**
 * 로그인 상태 확인
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  // localStorage에서 토큰 확인
  const hasToken = await page.evaluate(() => {
    return !!localStorage.getItem('accessToken') || !!localStorage.getItem('auth-storage');
  });
  return hasToken;
}

/**
 * 초기 지역 설정
 */
export async function setupInitialDivision(page: Page) {
  await page.addInitScript((division) => {
    localStorage.setItem('currentDivision', JSON.stringify(division));
  }, TEST_DIVISION);
}

/**
 * 브라우저 컨텍스트 초기화 (로그인 + 지역 설정)
 */
export async function setupAuthenticatedContext(page: Page) {
  await setupInitialDivision(page);
  await login(page);
}
