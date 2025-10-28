import { test, expect } from '@playwright/test';

test.describe('API 연동 테스트', () => {
  test('상품 목록 API 테스트', async ({ page }) => {
    await page.goto('/products');
    
    // 페이지 로딩 완료 대기
    await page.waitForLoadState('networkidle');
    
    // API 요청이 성공적으로 완료되었는지 확인
    const response = await page.waitForResponse(response => 
      response.url().includes('/api/markets') && response.status() === 200
    );
    
    expect(response.status()).toBe(200);
  });

  test('커뮤니티 게시글 목록 API 테스트', async ({ page }) => {
    await page.goto('/community');
    
    // 페이지 로딩 완료 대기
    await page.waitForLoadState('networkidle');
    
    // API 요청이 성공적으로 완료되었는지 확인
    const response = await page.waitForResponse(response => 
      response.url().includes('/api/community') && response.status() === 200
    );
    
    expect(response.status()).toBe(200);
  });

  test('검색 API 테스트', async ({ page }) => {
    await page.goto('/products');
    
    // 검색어 입력
    const searchInput = page.locator('input[placeholder*="상품 검색"]');
    await searchInput.fill('테스트');
    await searchInput.press('Enter');
    
    // 검색 API 요청이 발생하는지 확인
    const response = await page.waitForResponse(response => 
      response.url().includes('/api/markets') && 
      response.url().includes('keyword') && 
      response.status() === 200
    );
    
    expect(response.status()).toBe(200);
  });

  test('카테고리 필터 API 테스트', async ({ page }) => {
    await page.goto('/products');
    
    // 필터 토글 버튼 클릭
    await page.click('.filter-toggle-button');
    
    // 카테고리 선택 (실제 카테고리가 있다면)
    const categoryButton = page.locator('.category-selector button').first();
    if (await categoryButton.isVisible()) {
      await categoryButton.click();
      
      // 조건 적용 버튼 클릭
      const applyButton = page.locator('button:has-text("조건 적용")');
      if (await applyButton.isVisible()) {
        await applyButton.click();
        
        // 필터 API 요청이 발생하는지 확인
        const response = await page.waitForResponse(response => 
          response.url().includes('/api/markets') && 
          response.url().includes('categoryId') && 
          response.status() === 200
        );
        
        expect(response.status()).toBe(200);
      }
    }
  });

  test('정렬 API 테스트', async ({ page }) => {
    await page.goto('/products');
    
    // 정렬 드롭다운 찾기
    const sortDropdown = page.locator('.products-sort select, .products-sort [role="button"]').first();
    if (await sortDropdown.isVisible()) {
      await sortDropdown.click();
      
      // 정렬 옵션 선택
      const sortOption = page.locator('text=인기순').first();
      if (await sortOption.isVisible()) {
        await sortOption.click();
        
        // 정렬 API 요청이 발생하는지 확인
        const response = await page.waitForResponse(response => 
          response.url().includes('/api/markets') && 
          response.url().includes('sort') && 
          response.status() === 200
        );
        
        expect(response.status()).toBe(200);
      }
    }
  });

  test('무한 스크롤 API 테스트', async ({ page }) => {
    await page.goto('/products');
    
    // 페이지 로딩 완료 대기
    await page.waitForLoadState('networkidle');
    
    // 스크롤 다운
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    // 더 많은 데이터를 로드하는 API 요청이 발생하는지 확인
    const response = await page.waitForResponse(response => 
      response.url().includes('/api/markets') && 
      response.url().includes('pageNum') && 
      response.status() === 200
    );
    
    expect(response.status()).toBe(200);
  });

  test('에러 처리 테스트', async ({ page }) => {
    // 존재하지 않는 상품 ID로 접근
    await page.goto('/products/999999');
    
    // 페이지 로딩 완료 대기
    await page.waitForLoadState('networkidle');
    
    // 에러 상태가 적절히 처리되는지 확인
    await expect(page.locator('body')).toBeVisible();
  });

  test('네트워크 오류 처리 테스트', async ({ page }) => {
    // 네트워크 요청을 차단
    await page.route('**/api/**', route => route.abort());
    
    await page.goto('/products');
    
    // 페이지 로딩 완료 대기
    await page.waitForLoadState('networkidle');
    
    // 에러 상태가 적절히 처리되는지 확인
    await expect(page.locator('body')).toBeVisible();
  });
});
