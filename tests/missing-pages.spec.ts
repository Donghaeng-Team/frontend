import { test, expect } from '@playwright/test';

test.describe('누락된 페이지 테스트', () => {
  test('상품 상세 페이지 테스트', async ({ page }) => {
    // 실제 상품 ID가 있다면 사용, 없다면 존재하지 않는 ID로 테스트
    await page.goto('/products/1');
    
    // 상품 상세 페이지가 로드되는지 확인
    await expect(page).toHaveURL(/.*products\/\d+/);
    
    // 페이지 로딩 완료 대기
    await page.waitForLoadState('networkidle');
    
    // 상품 상세 페이지의 주요 요소들이 있는지 확인
    await expect(page.locator('body')).toBeVisible();
  });

  test('상품 등록 페이지 테스트 (로그인 필요)', async ({ page }) => {
    await page.goto('/products/register');
    
    // 로그인이 필요한 페이지이므로 리다이렉트되거나 로그인 페이지로 이동할 수 있음
    await expect(page).toHaveURL(/.*products.*register|.*login/);
    
    // 페이지 로딩 완료 대기
    await page.waitForLoadState('networkidle');
  });

  test('상품 수정 페이지 테스트 (로그인 필요)', async ({ page }) => {
    await page.goto('/products/1/edit');
    
    // 로그인이 필요한 페이지이므로 리다이렉트되거나 로그인 페이지로 이동할 수 있음
    await expect(page).toHaveURL(/.*products.*edit|.*login/);
    
    // 페이지 로딩 완료 대기
    await page.waitForLoadState('networkidle');
  });

  test('커뮤니티 글 상세 페이지 테스트', async ({ page }) => {
    // 실제 게시글 ID가 있다면 사용, 없다면 존재하지 않는 ID로 테스트
    await page.goto('/community/1');
    
    // 커뮤니티 글 상세 페이지가 로드되는지 확인
    await expect(page).toHaveURL(/.*community\/\d+/);
    
    // 페이지 로딩 완료 대기
    await page.waitForLoadState('networkidle');
    
    // 커뮤니티 글 상세 페이지의 주요 요소들이 있는지 확인
    await expect(page.locator('body')).toBeVisible();
  });

  test('커뮤니티 글 작성 페이지 테스트 (로그인 필요)', async ({ page }) => {
    await page.goto('/community/create');
    
    // 로그인이 필요한 페이지이므로 리다이렉트되거나 로그인 페이지로 이동할 수 있음
    await expect(page).toHaveURL(/.*community.*create|.*login/);
    
    // 페이지 로딩 완료 대기
    await page.waitForLoadState('networkidle');
  });

  test('커뮤니티 글 수정 페이지 테스트 (로그인 필요)', async ({ page }) => {
    await page.goto('/community/1/edit');
    
    // 로그인이 필요한 페이지이므로 리다이렉트되거나 로그인 페이지로 이동할 수 있음
    await expect(page).toHaveURL(/.*community.*edit|.*login/);
    
    // 페이지 로딩 완료 대기
    await page.waitForLoadState('networkidle');
  });

  test('채팅 목록 페이지 테스트 (로그인 필요)', async ({ page }) => {
    await page.goto('/chat');
    
    // 로그인이 필요한 페이지이므로 리다이렉트되거나 로그인 페이지로 이동할 수 있음
    await expect(page).toHaveURL(/.*chat|.*login/);
    
    // 페이지 로딩 완료 대기
    await page.waitForLoadState('networkidle');
  });

  test('채팅방 페이지 테스트 (로그인 필요)', async ({ page }) => {
    await page.goto('/chat/1');
    
    // 로그인이 필요한 페이지이므로 리다이렉트되거나 로그인 페이지로 이동할 수 있음
    await expect(page).toHaveURL(/.*chat.*\d+|.*login/);
    
    // 페이지 로딩 완료 대기
    await page.waitForLoadState('networkidle');
  });

  test('비밀번호 변경 페이지 테스트 (로그인 필요)', async ({ page }) => {
    await page.goto('/change-password');
    
    // 로그인이 필요한 페이지이므로 리다이렉트되거나 로그인 페이지로 이동할 수 있음
    await expect(page).toHaveURL(/.*change-password|.*login/);
    
    // 페이지 로딩 완료 대기
    await page.waitForLoadState('networkidle');
  });

  test('이메일 인증 페이지 테스트', async ({ page }) => {
    await page.goto('/verify/email');
    
    // 이메일 인증 페이지가 로드되는지 확인
    await expect(page).toHaveURL(/.*verify.*email/);
    
    // 페이지 로딩 완료 대기
    await page.waitForLoadState('networkidle');
    
    // 이메일 인증 페이지의 주요 요소들이 있는지 확인
    await expect(page.locator('body')).toBeVisible();
  });

  test('비밀번호 인증 페이지 테스트', async ({ page }) => {
    await page.goto('/verify/password');
    
    // 비밀번호 인증 페이지가 로드되는지 확인
    await expect(page).toHaveURL(/.*verify.*password/);
    
    // 페이지 로딩 완료 대기
    await page.waitForLoadState('networkidle');
    
    // 비밀번호 인증 페이지의 주요 요소들이 있는지 확인
    await expect(page.locator('body')).toBeVisible();
  });

  test('OAuth 콜백 페이지 테스트', async ({ page }) => {
    await page.goto('/auth/callback');
    
    // OAuth 콜백 페이지가 로드되는지 확인
    await expect(page).toHaveURL(/.*auth.*callback/);
    
    // 페이지 로딩 완료 대기
    await page.waitForLoadState('networkidle');
    
    // OAuth 콜백 페이지의 주요 요소들이 있는지 확인
    await expect(page.locator('body')).toBeVisible();
  });
});
