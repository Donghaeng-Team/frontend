import { test, expect } from '@playwright/test';

test.describe('성능 테스트', () => {
  test('페이지 로딩 시간 테스트', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // 페이지 로딩 시간이 5초 이내인지 확인
    expect(loadTime).toBeLessThan(5000);
    
    console.log(`메인 페이지 로딩 시간: ${loadTime}ms`);
  });

  test('상품 목록 페이지 성능 테스트', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // 상품 목록 페이지 로딩 시간이 3초 이내인지 확인
    expect(loadTime).toBeLessThan(3000);
    
    console.log(`상품 목록 페이지 로딩 시간: ${loadTime}ms`);
  });

  test('커뮤니티 페이지 성능 테스트', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/community');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // 커뮤니티 페이지 로딩 시간이 3초 이내인지 확인
    expect(loadTime).toBeLessThan(3000);
    
    console.log(`커뮤니티 페이지 로딩 시간: ${loadTime}ms`);
  });

  test('이미지 로딩 성능 테스트', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    
    // 이미지 로딩 시간 측정
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      // 첫 번째 이미지의 로딩 시간 측정
      const firstImage = images.first();
      const startTime = Date.now();
      
      await firstImage.waitFor({ state: 'visible' });
      const loadTime = Date.now() - startTime;
      
      // 이미지 로딩 시간이 2초 이내인지 확인
      expect(loadTime).toBeLessThan(2000);
      
      console.log(`이미지 로딩 시간: ${loadTime}ms`);
    }
  });

  test('API 응답 시간 테스트', async ({ page }) => {
    await page.goto('/products');
    
    // API 응답 시간 측정
    const startTime = Date.now();
    
    const response = await page.waitForResponse(response => 
      response.url().includes('/api/markets') && response.status() === 200
    );
    
    const responseTime = Date.now() - startTime;
    
    // API 응답 시간이 2초 이내인지 확인
    expect(responseTime).toBeLessThan(2000);
    
    console.log(`API 응답 시간: ${responseTime}ms`);
  });

  test('메모리 사용량 테스트', async ({ page }) => {
    await page.goto('/');
    
    // 메모리 사용량 측정
    const metrics = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory;
      }
      return null;
    });
    
    if (metrics) {
      console.log(`메모리 사용량: ${JSON.stringify(metrics)}`);
      
      // 힙 사용량이 100MB 이내인지 확인
      const heapUsed = metrics.usedJSHeapSize / 1024 / 1024; // MB
      expect(heapUsed).toBeLessThan(100);
    }
  });

  test('스크롤 성능 테스트', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    
    const startTime = Date.now();
    
    // 페이지 끝까지 스크롤
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    // 스크롤 완료 대기
    await page.waitForTimeout(1000);
    
    const scrollTime = Date.now() - startTime;
    
    // 스크롤이 1초 이내에 완료되는지 확인
    expect(scrollTime).toBeLessThan(1000);
    
    console.log(`스크롤 시간: ${scrollTime}ms`);
  });

  test('폼 제출 성능 테스트', async ({ page }) => {
    await page.goto('/login-form');
    
    // 폼 입력
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    const startTime = Date.now();
    
    // 폼 제출
    await page.click('button[type="submit"]');
    
    // 응답 대기 (실제로는 로그인 실패하지만 성능 측정)
    await page.waitForTimeout(2000);
    
    const submitTime = Date.now() - startTime;
    
    // 폼 제출이 3초 이내에 완료되는지 확인
    expect(submitTime).toBeLessThan(3000);
    
    console.log(`폼 제출 시간: ${submitTime}ms`);
  });
});
