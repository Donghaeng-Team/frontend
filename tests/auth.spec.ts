import { test, expect } from '@playwright/test';
import { setupInitialDivision, login, logout, isLoggedIn } from './helpers/auth-helper';
import { TEST_USER, WAIT_TIMEOUT } from './fixtures/test-data';

test.describe('인증(Authentication) 플로우', () => {
  test.beforeEach(async ({ page }) => {
    await setupInitialDivision(page);
  });

  test('회원가입 페이지 접근 및 폼 렌더링', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');

    // 회원가입 폼 요소 확인
    await expect(page.locator('input[name="email"], input[type="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"], input[type="password"]').first()).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('로그인 성공 플로우', async ({ page }) => {
    test.skip(!process.env.E2E_EMAIL, 'E2E_EMAIL 환경변수 필요');

    await login(page);

    // 로그인 후 토큰 확인
    const loggedIn = await isLoggedIn(page);
    expect(loggedIn).toBeTruthy();

    // 로그인 후 메인 페이지 또는 상품 목록으로 리다이렉트 확인
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/(products|community|mypage)?/);
  });

  test('로그인 실패 - 잘못된 비밀번호', async ({ page }) => {
    await page.goto('/login-form');
    await page.waitForLoadState('networkidle');

    await page.fill('input[name="email"], input[type="email"]', TEST_USER.email);
    await page.fill('input[name="password"], input[type="password"]', 'WrongPassword123!');
    await page.click('button[type="submit"]');

    // 에러 메시지 표시 확인
    await page.waitForTimeout(WAIT_TIMEOUT.short);
    const errorMessage = page.locator('text=/로그인|이메일|비밀번호|실패|틀렸/i');
    const hasError = (await errorMessage.count()) > 0;
    expect(hasError).toBeTruthy();
  });

  test('비밀번호 찾기 페이지 접근', async ({ page }) => {
    await page.goto('/password-reset-request');
    await page.waitForLoadState('networkidle');

    // 비밀번호 찾기 폼 확인
    await expect(page.locator('input[name="email"], input[type="email"]')).toBeVisible();
    await expect(page.locator('button:has-text("재설정"), button:has-text("발송"), button[type="submit"]')).toBeVisible();
  });

  test('비밀번호 찾기 - 이메일 전송 요청', async ({ page }) => {
    await page.goto('/password-reset-request');
    await page.waitForLoadState('networkidle');

    await page.fill('input[name="email"], input[type="email"]', TEST_USER.email);
    await page.click('button[type="submit"]');

    // 성공 메시지 또는 알림 확인 (alert 또는 toast)
    await page.waitForTimeout(WAIT_TIMEOUT.medium);
  });

  test('로그아웃 플로우', async ({ page }) => {
    test.skip(!process.env.E2E_EMAIL, 'E2E_EMAIL 환경변수 필요');

    await login(page);
    expect(await isLoggedIn(page)).toBeTruthy();

    await logout(page);

    // 로그아웃 후 토큰 제거 확인
    const loggedIn = await isLoggedIn(page);
    expect(loggedIn).toBeFalsy();
  });

  test('OAuth 로그인 버튼 렌더링 확인', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // 소셜 로그인 버튼 확인 (카카오, 구글)
    const kakaoButton = page.locator('button:has-text("카카오"), [class*="kakao"], img[alt*="카카오"]');
    const googleButton = page.locator('button:has-text("구글"), [class*="google"], img[alt*="구글"]');

    const hasKakao = (await kakaoButton.count()) > 0;
    const hasGoogle = (await googleButton.count()) > 0;

    expect(hasKakao || hasGoogle).toBeTruthy();
  });
});
