import { test, expect } from '@playwright/test';

test.describe('메인 페이지', () => {
  test('메인 페이지가 정상적으로 로드되는지 확인', async ({ page }) => {
    await page.goto('/');
    
    // 페이지 제목 확인
    await expect(page).toHaveTitle(/ByteTogether/);
    
    // 메인 페이지의 주요 요소들이 존재하는지 확인
    await expect(page.locator('body')).toBeVisible();
  });

  test('네비게이션 메뉴가 정상적으로 표시되는지 확인', async ({ page }) => {
    await page.goto('/');
    
    // 헤더가 존재하는지 확인
    const header = page.locator('header, [role="banner"], .header');
    await expect(header).toBeVisible();
  });
});

test.describe('인증 페이지', () => {
  test('로그인 페이지 접근', async ({ page }) => {
    await page.goto('/login');
    
    // 로그인 페이지가 로드되는지 확인
    await expect(page).toHaveURL(/.*login/);
  });

  test('회원가입 페이지 접근', async ({ page }) => {
    await page.goto('/signup');
    
    // 회원가입 페이지가 로드되는지 확인
    await expect(page).toHaveURL(/.*signup/);
  });

  test('로그인 폼 페이지 접근', async ({ page }) => {
    await page.goto('/login-form');
    
    // 로그인 폼 페이지가 로드되는지 확인
    await expect(page).toHaveURL(/.*login-form/);
  });
});

test.describe('상품 관련 페이지', () => {
  test('상품 목록 페이지 접근', async ({ page }) => {
    await page.goto('/products');
    
    // 상품 목록 페이지가 로드되는지 확인
    await expect(page).toHaveURL(/.*products/);
  });

  test('상품 등록 페이지 접근 (로그인 필요)', async ({ page }) => {
    await page.goto('/products/register');
    
    // 로그인이 필요한 페이지이므로 리다이렉트되거나 로그인 페이지로 이동할 수 있음
    // 실제 구현에 따라 다를 수 있음
    await expect(page).toHaveURL(/.*products.*register|.*login/);
  });
});

test.describe('커뮤니티 페이지', () => {
  test('커뮤니티 게시판 페이지 접근', async ({ page }) => {
    await page.goto('/community');
    
    // 커뮤니티 페이지가 로드되는지 확인
    await expect(page).toHaveURL(/.*community/);
  });

  test('커뮤니티 글 작성 페이지 접근 (로그인 필요)', async ({ page }) => {
    await page.goto('/community/create');
    
    // 로그인이 필요한 페이지이므로 리다이렉트되거나 로그인 페이지로 이동할 수 있음
    await expect(page).toHaveURL(/.*community.*create|.*login/);
  });
});

test.describe('마이페이지', () => {
  test('마이페이지 접근 (로그인 필요)', async ({ page }) => {
    await page.goto('/mypage');
    
    // 로그인이 필요한 페이지이므로 리다이렉트되거나 로그인 페이지로 이동할 수 있음
    await expect(page).toHaveURL(/.*mypage|.*login/);
  });

  test('구매 내역 페이지 접근 (로그인 필요)', async ({ page }) => {
    await page.goto('/purchase-history');
    
    // 로그인이 필요한 페이지이므로 리다이렉트되거나 로그인 페이지로 이동할 수 있음
    await expect(page).toHaveURL(/.*purchase-history|.*login/);
  });
});

test.describe('404 페이지', () => {
  test('존재하지 않는 페이지 접근 시 404 처리', async ({ page }) => {
    await page.goto('/non-existent-page');
    
    // 404 페이지 또는 에러 메시지가 표시되는지 확인
    await expect(page.locator('body')).toContainText(/페이지를 찾을 수 없습니다|404|Not Found/);
  });
});
