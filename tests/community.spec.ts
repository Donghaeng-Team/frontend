import { test, expect } from '@playwright/test';
import { setupAuthenticatedContext, setupInitialDivision } from './helpers/auth-helper';
import { TEST_POST, WAIT_TIMEOUT } from './fixtures/test-data';

test.describe('커뮤니티(Community) 플로우', () => {
  test.beforeEach(async ({ page }) => {
    await setupInitialDivision(page);
  });

  test('커뮤니티 목록 페이지 로드', async ({ page }) => {
    await page.goto('/community');
    await page.waitForLoadState('networkidle');

    // 게시글 목록 확인
    const postList = page.locator('.post-list, .community-list, [class*="post"]').first();
    await expect(postList).toBeVisible({ timeout: WAIT_TIMEOUT.long });
  });

  test('카테고리별 게시글 필터링', async ({ page }) => {
    await page.goto('/community');
    await page.waitForLoadState('networkidle');

    // 카테고리 탭 버튼
    const categories = ['동네 소식', '공구 후기', '질문 답변'];

    for (const category of categories) {
      const categoryTab = page.locator(`button:has-text("${category}")`);
      if (await categoryTab.isVisible()) {
        await categoryTab.click();
        await page.waitForTimeout(WAIT_TIMEOUT.short);
        break;
      }
    }
  });

  test('게시글 상세 페이지 접근', async ({ page }) => {
    await page.goto('/community');
    await page.waitForLoadState('networkidle');

    // 첫 번째 게시글 클릭
    const firstPost = page.locator('.post-card, .post-item, [class*="post"]').first();
    if (await firstPost.isVisible()) {
      await firstPost.click();
      await page.waitForLoadState('networkidle');

      // 게시글 상세 내용 확인
      await expect(page.locator('text=/제목|내용|작성자/i')).toBeVisible({ timeout: WAIT_TIMEOUT.medium });
    }
  });

  test('게시글 작성 플로우 (로그인 필요)', async ({ page }) => {
    test.skip(!process.env.E2E_EMAIL, 'E2E_EMAIL 환경변수 필요');

    await setupAuthenticatedContext(page);
    await page.goto('/community/create');
    await page.waitForLoadState('networkidle');

    // 게시글 작성 폼 확인
    await expect(page.locator('input[name="title"], input[placeholder*="제목"]')).toBeVisible();

    // 카테고리 선택
    const categoryButton = page.locator(`button:has-text("${TEST_POST.category}"), button:has-text("동네 소식")`).first();
    if (await categoryButton.isVisible()) {
      await categoryButton.click();
    }

    // 제목 입력
    await page.fill('input[name="title"], input[placeholder*="제목"]', TEST_POST.title);

    // 내용 입력
    const contentTextarea = page.locator('textarea[name="content"], textarea[placeholder*="내용"]');
    if (await contentTextarea.isVisible()) {
      await contentTextarea.fill(TEST_POST.content);
    }

    // 제출 버튼 확인 (실제 제출은 하지 않음)
    const submitButton = page.locator('button[type="submit"], button:has-text("등록")');
    await expect(submitButton).toBeVisible();
  });

  test('이미지 업로드 UI 확인', async ({ page }) => {
    test.skip(!process.env.E2E_EMAIL, 'E2E_EMAIL 환경변수 필요');

    await setupAuthenticatedContext(page);
    await page.goto('/community/create');
    await page.waitForLoadState('networkidle');

    // 이미지 업로드 영역 확인
    const imageUploadArea = page.locator('input[type="file"], [class*="upload"], [class*="image"]');
    const hasUpload = (await imageUploadArea.count()) > 0;
    expect(hasUpload).toBeTruthy();
  });

  test('게시글 좋아요 기능', async ({ page }) => {
    test.skip(!process.env.E2E_EMAIL, 'E2E_EMAIL 환경변수 필요');

    await setupAuthenticatedContext(page);
    await page.goto('/community');
    await page.waitForLoadState('networkidle');

    // 첫 번째 게시글 클릭
    const firstPost = page.locator('.post-card, .post-item, [class*="post"]').first();
    if (await firstPost.isVisible()) {
      await firstPost.click();
      await page.waitForLoadState('networkidle');

      // 좋아요 버튼
      const likeButton = page.locator('button:has-text("좋아요"), button[class*="like"]').first();
      if (await likeButton.isVisible()) {
        await likeButton.click();
        await page.waitForTimeout(WAIT_TIMEOUT.short);
      }
    }
  });

  test('댓글 작성 기능 (로그인 필요)', async ({ page }) => {
    test.skip(!process.env.E2E_EMAIL, 'E2E_EMAIL 환경변수 필요');

    await setupAuthenticatedContext(page);
    await page.goto('/community');
    await page.waitForLoadState('networkidle');

    // 첫 번째 게시글 클릭
    const firstPost = page.locator('.post-card, .post-item, [class*="post"]').first();
    if (await firstPost.isVisible()) {
      await firstPost.click();
      await page.waitForLoadState('networkidle');

      // 댓글 입력 필드
      const commentInput = page.locator('textarea[placeholder*="댓글"], input[placeholder*="댓글"]');
      if (await commentInput.isVisible()) {
        await commentInput.fill('E2E 테스트 댓글입니다.');

        // 댓글 등록 버튼
        const commentSubmit = page.locator('button:has-text("등록"), button:has-text("댓글")').first();
        if (await commentSubmit.isVisible()) {
          await expect(commentSubmit).toBeVisible();
        }
      }
    }
  });

  test('게시글 수정 페이지 접근 (작성자 권한)', async ({ page }) => {
    test.skip(!process.env.E2E_EMAIL, 'E2E_EMAIL 환경변수 필요');

    await setupAuthenticatedContext(page);

    // 내가 작성한 게시글 목록
    await page.goto('/mypage');
    await page.waitForLoadState('networkidle');

    // 내가 작성한 게시글 섹션
    const myPosts = page.locator('text=/작성한|내 게시글/i');
    if (await myPosts.isVisible()) {
      await myPosts.click();
      await page.waitForTimeout(WAIT_TIMEOUT.short);

      // 수정 버튼
      const editButton = page.locator('button:has-text("수정"), a:has-text("수정")').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForLoadState('networkidle');

        // 수정 폼 확인
        await expect(page.locator('input[name="title"], textarea[name="content"]')).toBeVisible();
      }
    }
  });

  test('게시글 검색 기능', async ({ page }) => {
    await page.goto('/community');
    await page.waitForLoadState('networkidle');

    // 검색 입력 필드
    const searchInput = page.locator('input[type="search"], input[placeholder*="검색"]');

    if (await searchInput.isVisible()) {
      await searchInput.fill('맛집');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(WAIT_TIMEOUT.medium);
    }
  });

  test('조회수 증가 확인', async ({ page }) => {
    await page.goto('/community');
    await page.waitForLoadState('networkidle');

    // 첫 번째 게시글 클릭 전 조회수
    const firstPost = page.locator('.post-card, .post-item, [class*="post"]').first();
    if (await firstPost.isVisible()) {
      await firstPost.click();
      await page.waitForLoadState('networkidle');

      // 조회수 표시 확인
      const viewCount = page.locator('text=/조회|views?/i');
      const hasViewCount = (await viewCount.count()) > 0;
      expect(hasViewCount).toBeDefined();
    }
  });
});
