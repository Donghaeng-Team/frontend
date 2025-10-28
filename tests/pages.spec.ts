import { test, expect } from '@playwright/test';

test.describe('상품 목록 페이지 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/products');
  });

  test('상품 목록 페이지가 정상적으로 로드되는지 확인', async ({ page }) => {
    // 페이지가 로드되는지 확인
    await expect(page).toHaveURL(/.*products/);
    
    // 주요 요소들이 존재하는지 확인
    await expect(page.locator('.product-list-container')).toBeVisible();
  });

  test('필터 섹션이 정상적으로 표시되는지 확인', async ({ page }) => {
    // 필터 토글 버튼 확인
    await expect(page.locator('.filter-toggle-button')).toBeVisible();
    await expect(page.locator('.filter-toggle-text')).toContainText('필터');
    
    // 필터 토글 버튼 클릭
    await page.click('.filter-toggle-button');
    
    // 필터 내용이 표시되는지 확인
    await expect(page.locator('.filter-content')).toBeVisible();
    await expect(page.locator('.filter-title')).toContainText('카테고리');
    await expect(page.locator('.filter-title')).toContainText('동네 범위');
  });

  test('검색 기능 테스트', async ({ page }) => {
    // 검색바가 존재하는지 확인
    const searchBar = page.locator('input[placeholder*="상품 검색"]');
    await expect(searchBar).toBeVisible();
    
    // 검색어 입력
    await searchBar.fill('테스트 상품');
    await searchBar.press('Enter');
    
    // 검색이 실행되는지 확인 (실제 API 응답에 따라 다를 수 있음)
    await expect(page).toHaveURL(/.*keyword=테스트%20상품/);
  });

  test('정렬 드롭다운 테스트', async ({ page }) => {
    // 정렬 드롭다운이 존재하는지 확인
    const sortDropdown = page.locator('.products-sort select, .products-sort [role="button"]');
    await expect(sortDropdown).toBeVisible();
    
    // 드롭다운 클릭 (실제 구현에 따라 다를 수 있음)
    if (await sortDropdown.getAttribute('role') === 'button') {
      await sortDropdown.click();
      // 드롭다운 옵션들이 표시되는지 확인
      await expect(page.locator('text=최신순')).toBeVisible();
      await expect(page.locator('text=인기순')).toBeVisible();
    }
  });

  test('상품 카드 클릭 테스트', async ({ page }) => {
    // 상품 카드가 있는지 확인 (로딩 완료 후)
    await page.waitForTimeout(2000); // API 응답 대기
    
    const productCard = page.locator('.product-card').first();
    
    if (await productCard.isVisible()) {
      // 상품 카드 클릭
      await productCard.click();
      
      // 상품 상세 페이지로 이동하는지 확인
      await expect(page).toHaveURL(/.*products\/\d+/);
    } else {
      // 상품이 없는 경우의 메시지 확인
      await expect(page.locator('text=등록된 공동구매가 없습니다')).toBeVisible();
    }
  });

  test('더보기 버튼 테스트', async ({ page }) => {
    // 페이지 로딩 대기
    await page.waitForTimeout(2000);
    
    const loadMoreButton = page.locator('text=더보기');
    
    if (await loadMoreButton.isVisible()) {
      // 더보기 버튼 클릭
      await loadMoreButton.click();
      
      // 로딩 상태 확인
      await expect(page.locator('text=로딩 중...')).toBeVisible();
    }
  });
});

test.describe('커뮤니티 페이지 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/community');
  });

  test('커뮤니티 페이지가 정상적으로 로드되는지 확인', async ({ page }) => {
    // 페이지가 로드되는지 확인
    await expect(page).toHaveURL(/.*community/);
    
    // 주요 요소들이 존재하는지 확인
    await expect(page.locator('.community-board')).toBeVisible();
    await expect(page.locator('.banner-title')).toContainText('우리 동네 소식');
  });

  test('카테고리 탭 테스트', async ({ page }) => {
    // 카테고리 탭들이 존재하는지 확인
    await expect(page.locator('text=전체')).toBeVisible();
    await expect(page.locator('text=동네 소식')).toBeVisible();
    await expect(page.locator('text=공구 후기')).toBeVisible();
    await expect(page.locator('text=질문 답변')).toBeVisible();
    
    // 카테고리 탭 클릭
    await page.click('text=동네 소식');
    
    // 활성 상태 확인
    await expect(page.locator('text=동네 소식').locator('..')).toHaveClass(/active/);
  });

  test('검색 기능 테스트', async ({ page }) => {
    // 검색 입력창이 존재하는지 확인
    const searchInput = page.locator('input[placeholder*="게시글 검색"]');
    await expect(searchInput).toBeVisible();
    
    // 검색어 입력
    await searchInput.fill('테스트 게시글');
    await searchInput.press('Enter');
    
    // 검색이 실행되는지 확인
    await expect(page).toHaveURL(/.*search=테스트%20게시글/);
  });

  test('글쓰기 버튼 테스트', async ({ page }) => {
    // 글쓰기 버튼이 존재하는지 확인
    const writeButton = page.locator('text=글쓰기');
    await expect(writeButton).toBeVisible();
    
    // 글쓰기 버튼 클릭
    await writeButton.click();
    
    // 글쓰기 페이지로 이동하는지 확인 (로그인 필요할 수 있음)
    await expect(page).toHaveURL(/.*community.*create|.*login/);
  });

  test('게시글 클릭 테스트', async ({ page }) => {
    // 페이지 로딩 대기
    await page.waitForTimeout(2000);
    
    const postItem = page.locator('.post-item').first();
    
    if (await postItem.isVisible()) {
      // 게시글 클릭
      await postItem.click();
      
      // 게시글 상세 페이지로 이동하는지 확인
      await expect(page).toHaveURL(/.*community\/\d+/);
    } else {
      // 게시글이 없는 경우의 메시지 확인
      await expect(page.locator('text=아직 게시글이 없어요')).toBeVisible();
    }
  });

  test('무한 스크롤 테스트', async ({ page }) => {
    // 페이지 로딩 대기
    await page.waitForTimeout(2000);
    
    // 스크롤 다운
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    // 로딩 인디케이터가 표시되는지 확인
    const loadingIndicator = page.locator('.loading-container, .load-more-trigger');
    if (await loadingIndicator.isVisible()) {
      await expect(page.locator('text=게시글 불러오는 중')).toBeVisible();
    }
  });
});

test.describe('반응형 테스트', () => {
  test('모바일 뷰포트에서 상품 목록 페이지 테스트', async ({ page }) => {
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/products');
    
    // 모바일에서 필터 토글 버튼이 잘 보이는지 확인
    await expect(page.locator('.filter-toggle-button')).toBeVisible();
    
    // 필터 토글 버튼 클릭
    await page.click('.filter-toggle-button');
    
    // 필터 내용이 모바일에서도 잘 표시되는지 확인
    await expect(page.locator('.filter-content')).toBeVisible();
  });

  test('모바일 뷰포트에서 커뮤니티 페이지 테스트', async ({ page }) => {
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/community');
    
    // 모바일에서 카테고리 탭들이 잘 보이는지 확인
    await expect(page.locator('.category-tabs')).toBeVisible();
    
    // 모바일에서 검색창과 글쓰기 버튼이 잘 보이는지 확인
    await expect(page.locator('.toolbar-actions')).toBeVisible();
  });
});
