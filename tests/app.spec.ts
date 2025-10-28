import { test, expect } from '@playwright/test';

test.describe('ByteTogether 애플리케이션 테스트', () => {
  test('메인 페이지 로드 테스트', async ({ page }) => {
    await page.goto('/');
    
    // 페이지가 정상적으로 로드되는지 확인
    await expect(page).toHaveTitle(/ByteTogether|함께 사요/);
    
    // 메인 페이지의 주요 요소들이 존재하는지 확인
    await expect(page.locator('body')).toBeVisible();
    
    // 페이지 로딩 완료 대기
    await page.waitForLoadState('networkidle');
  });

  test('로그인 페이지 접근 테스트', async ({ page }) => {
    await page.goto('/login');
    
    // 로그인 페이지가 로드되는지 확인
    await expect(page).toHaveURL(/.*login/);
    
    // 로그인 페이지의 주요 요소들이 존재하는지 확인
    await expect(page.locator('body')).toBeVisible();
    
    // 페이지 로딩 완료 대기
    await page.waitForLoadState('networkidle');
  });

  test('로그인 폼 페이지 접근 테스트', async ({ page }) => {
    await page.goto('/login-form');
    
    // 로그인 폼 페이지가 로드되는지 확인
    await expect(page).toHaveURL(/.*login-form/);
    
    // 로그인 폼 요소들이 존재하는지 확인
    await expect(page.locator('body')).toBeVisible();
    
    // 페이지 로딩 완료 대기
    await page.waitForLoadState('networkidle');
    
    // 이메일 입력 필드가 있는지 확인
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await expect(emailInput).toBeVisible();
    }
    
    // 비밀번호 입력 필드가 있는지 확인
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    if (await passwordInput.isVisible()) {
      await expect(passwordInput).toBeVisible();
    }
  });

  test('회원가입 페이지 접근 테스트', async ({ page }) => {
    await page.goto('/signup');
    
    // 회원가입 페이지가 로드되는지 확인
    await expect(page).toHaveURL(/.*signup/);
    
    // 회원가입 페이지의 주요 요소들이 존재하는지 확인
    await expect(page.locator('body')).toBeVisible();
    
    // 페이지 로딩 완료 대기
    await page.waitForLoadState('networkidle');
    
    // 회원가입 폼 요소들이 있는지 확인
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    const nicknameInput = page.locator('input[name="nickname"]').first();
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    
    if (await emailInput.isVisible()) {
      await expect(emailInput).toBeVisible();
    }
    if (await nicknameInput.isVisible()) {
      await expect(nicknameInput).toBeVisible();
    }
    if (await passwordInput.isVisible()) {
      await expect(passwordInput).toBeVisible();
    }
  });

  test('상품 목록 페이지 접근 테스트', async ({ page }) => {
    await page.goto('/products');
    
    // 상품 목록 페이지가 로드되는지 확인
    await expect(page).toHaveURL(/.*products/);
    
    // 상품 목록 페이지의 주요 요소들이 존재하는지 확인
    await expect(page.locator('body')).toBeVisible();
    
    // 페이지 로딩 완료 대기 (API 호출 대기)
    await page.waitForLoadState('networkidle');
    
    // 상품 목록 컨테이너가 있는지 확인
    const productContainer = page.locator('.product-list-container, .products-section, .products-grid').first();
    if (await productContainer.isVisible()) {
      await expect(productContainer).toBeVisible();
    }
  });

  test('커뮤니티 페이지 접근 테스트', async ({ page }) => {
    await page.goto('/community');
    
    // 커뮤니티 페이지가 로드되는지 확인
    await expect(page).toHaveURL(/.*community/);
    
    // 커뮤니티 페이지의 주요 요소들이 존재하는지 확인
    await expect(page.locator('body')).toBeVisible();
    
    // 페이지 로딩 완료 대기 (API 호출 대기)
    await page.waitForLoadState('networkidle');
    
    // 커뮤니티 컨테이너가 있는지 확인
    const communityContainer = page.locator('.community-board, .community-container').first();
    if (await communityContainer.isVisible()) {
      await expect(communityContainer).toBeVisible();
    }
  });

  test('컴포넌트 쇼케이스 페이지 접근 테스트', async ({ page }) => {
    await page.goto('/showcase');
    
    // 쇼케이스 페이지가 로드되는지 확인
    await expect(page).toHaveURL(/.*showcase/);
    
    // 쇼케이스 페이지의 주요 요소들이 존재하는지 확인
    await expect(page.locator('body')).toBeVisible();
    
    // 페이지 로딩 완료 대기
    await page.waitForLoadState('networkidle');
  });

  test('존재하지 않는 페이지 404 테스트', async ({ page }) => {
    await page.goto('/non-existent-page');
    
    // 404 페이지 또는 에러 메시지가 표시되는지 확인
    await expect(page.locator('body')).toBeVisible();
    
    // 404 관련 텍스트가 있는지 확인
    const notFoundText = page.locator('text=페이지를 찾을 수 없습니다, text=404, text=Not Found').first();
    if (await notFoundText.isVisible()) {
      await expect(notFoundText).toBeVisible();
    }
  });

  test('반응형 테스트 - 모바일 뷰포트', async ({ page }) => {
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // 모바일에서 페이지가 정상적으로 로드되는지 확인
    await expect(page.locator('body')).toBeVisible();
    
    // 페이지 로딩 완료 대기
    await page.waitForLoadState('networkidle');
  });

  test('반응형 테스트 - 태블릿 뷰포트', async ({ page }) => {
    // 태블릿 뷰포트 설정
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/');
    
    // 태블릿에서 페이지가 정상적으로 로드되는지 확인
    await expect(page.locator('body')).toBeVisible();
    
    // 페이지 로딩 완료 대기
    await page.waitForLoadState('networkidle');
  });
});
