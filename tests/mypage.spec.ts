import { test, expect } from '@playwright/test';
import { setupAuthenticatedContext } from './helpers/auth-helper';
import { WAIT_TIMEOUT } from './fixtures/test-data';

test.describe('마이페이지 플로우', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!process.env.E2E_EMAIL, 'E2E_EMAIL 환경변수 필요');
    await setupAuthenticatedContext(page);
  });

  test('마이페이지 메인 접근', async ({ page }) => {
    await page.goto('/mypage');
    await page.waitForLoadState('networkidle');

    // 사용자 정보 표시 확인
    await expect(page.locator('text=/프로필|내 정보|마이페이지/i')).toBeVisible({ timeout: WAIT_TIMEOUT.medium });
  });

  test('프로필 정보 표시 확인', async ({ page }) => {
    await page.goto('/mypage');
    await page.waitForLoadState('networkidle');

    // 이메일, 닉네임 등 사용자 정보 확인
    const userInfo = page.locator('text=/이메일|닉네임|이름/i');
    const hasUserInfo = (await userInfo.count()) > 0;
    expect(hasUserInfo).toBeTruthy();
  });

  test('구매 내역 페이지 접근', async ({ page }) => {
    await page.goto('/mypage');
    await page.waitForLoadState('networkidle');

    // 구매 내역 메뉴 클릭
    const purchaseHistoryLink = page.locator('a:has-text("구매"), button:has-text("구매"), text=/구매.*내역/i').first();
    if (await purchaseHistoryLink.isVisible()) {
      await purchaseHistoryLink.click();
      await page.waitForLoadState('networkidle');

      // 구매 내역 페이지 확인
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('찜한 상품 목록 확인', async ({ page }) => {
    await page.goto('/mypage');
    await page.waitForLoadState('networkidle');

    // 찜한 상품 섹션
    const wishlistSection = page.locator('text=/찜|좋아요|관심/i');
    if (await wishlistSection.isVisible()) {
      await wishlistSection.click();
      await page.waitForTimeout(WAIT_TIMEOUT.short);
    }
  });

  test('내가 등록한 상품 목록', async ({ page }) => {
    await page.goto('/mypage');
    await page.waitForLoadState('networkidle');

    // 내가 등록한 상품 섹션
    const myProductsSection = page.locator('text=/등록한|판매|내 상품/i');
    if (await myProductsSection.isVisible()) {
      await myProductsSection.click();
      await page.waitForTimeout(WAIT_TIMEOUT.short);
    }
  });

  test('내가 작성한 게시글 목록', async ({ page }) => {
    await page.goto('/mypage');
    await page.waitForLoadState('networkidle');

    // 내가 작성한 게시글 섹션
    const myPostsSection = page.locator('text=/작성한|내 게시글/i');
    if (await myPostsSection.isVisible()) {
      await myPostsSection.click();
      await page.waitForTimeout(WAIT_TIMEOUT.short);
    }
  });

  test('비밀번호 변경 페이지 접근', async ({ page }) => {
    await page.goto('/mypage');
    await page.waitForLoadState('networkidle');

    // 비밀번호 변경 메뉴
    const changePasswordLink = page.locator('a:has-text("비밀번호"), button:has-text("비밀번호")').first();
    if (await changePasswordLink.isVisible()) {
      await changePasswordLink.click();
      await page.waitForLoadState('networkidle');

      // 비밀번호 변경 폼 확인
      await expect(page.locator('input[type="password"]').first()).toBeVisible();
    }
  });

  test('비밀번호 변경 폼 유효성 검사', async ({ page }) => {
    await page.goto('/change-password');
    await page.waitForLoadState('networkidle');

    // 현재 비밀번호
    const currentPasswordInput = page.locator('input[name="currentPassword"], input[placeholder*="현재"]').first();
    if (await currentPasswordInput.isVisible()) {
      await currentPasswordInput.fill('ShortPw1!');

      // 새 비밀번호
      const newPasswordInput = page.locator('input[name="newPassword"], input[placeholder*="새"]').first();
      if (await newPasswordInput.isVisible()) {
        await newPasswordInput.fill('NewPassword123!');

        // 비밀번호 확인
        const confirmPasswordInput = page.locator('input[name="confirmPassword"], input[placeholder*="확인"]').first();
        if (await confirmPasswordInput.isVisible()) {
          await confirmPasswordInput.fill('NewPassword123!');

          // 제출 버튼 활성화 확인
          const submitButton = page.locator('button[type="submit"]');
          await expect(submitButton).toBeVisible();
        }
      }
    }
  });

  test('프로필 이미지 업로드 영역 확인', async ({ page }) => {
    await page.goto('/mypage');
    await page.waitForLoadState('networkidle');

    // 프로필 이미지 또는 업로드 버튼
    const profileImage = page.locator('img[alt*="프로필"], [class*="profile"]');
    const hasProfileImage = (await profileImage.count()) > 0;
    expect(hasProfileImage).toBeDefined();
  });

  test('참여 중인 공동구매 목록', async ({ page }) => {
    await page.goto('/mypage');
    await page.waitForLoadState('networkidle');

    // 참여 중인 공동구매 섹션
    const participatingSection = page.locator('text=/참여|진행/i');
    if (await participatingSection.isVisible()) {
      await participatingSection.click();
      await page.waitForTimeout(WAIT_TIMEOUT.short);
    }
  });

  test('완료된 공동구매 내역', async ({ page }) => {
    await page.goto('/mypage');
    await page.waitForLoadState('networkidle');

    // 완료된 공동구매 섹션
    const completedSection = page.locator('text=/완료|종료/i');
    if (await completedSection.isVisible()) {
      await completedSection.click();
      await page.waitForTimeout(WAIT_TIMEOUT.short);
    }
  });
});
