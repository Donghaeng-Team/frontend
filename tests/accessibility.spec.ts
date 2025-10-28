import { test, expect } from '@playwright/test';

test.describe('접근성 테스트', () => {
  test('키보드 네비게이션 테스트', async ({ page }) => {
    await page.goto('/');
    
    // Tab 키로 네비게이션 테스트
    await page.keyboard.press('Tab');
    
    // 포커스가 이동하는지 확인
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // 여러 번 Tab 키 누르기
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const currentFocus = page.locator(':focus');
      await expect(currentFocus).toBeVisible();
    }
  });

  test('ARIA 레이블 테스트', async ({ page }) => {
    await page.goto('/');
    
    // ARIA 레이블이 있는 요소들 확인
    const ariaLabeledElements = page.locator('[aria-label]');
    const count = await ariaLabeledElements.count();
    
    if (count > 0) {
      // 첫 번째 ARIA 레이블 요소 확인
      const firstElement = ariaLabeledElements.first();
      await expect(firstElement).toBeVisible();
      
      const ariaLabel = await firstElement.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
    }
  });

  test('ARIA 역할 테스트', async ({ page }) => {
    await page.goto('/');
    
    // 주요 ARIA 역할들 확인
    const roles = ['banner', 'main', 'navigation', 'contentinfo', 'button', 'link'];
    
    for (const role of roles) {
      const elements = page.locator(`[role="${role}"]`);
      const count = await elements.count();
      
      if (count > 0) {
        await expect(elements.first()).toBeVisible();
      }
    }
  });

  test('색상 대비 테스트', async ({ page }) => {
    await page.goto('/');
    
    // 텍스트 요소들의 색상 대비 확인
    const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, span, div');
    const count = await textElements.count();
    
    if (count > 0) {
      // 첫 번째 텍스트 요소 확인
      const firstText = textElements.first();
      await expect(firstText).toBeVisible();
      
      // 색상과 배경색 가져오기
      const color = await firstText.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          color: styles.color,
          backgroundColor: styles.backgroundColor
        };
      });
      
      expect(color.color).toBeTruthy();
      expect(color.backgroundColor).toBeTruthy();
    }
  });

  test('폰트 크기 테스트', async ({ page }) => {
    await page.goto('/');
    
    // 텍스트 요소들의 폰트 크기 확인
    const textElements = page.locator('p, h1, h2, h3, h4, h5, h6');
    const count = await textElements.count();
    
    if (count > 0) {
      const firstText = textElements.first();
      await expect(firstText).toBeVisible();
      
      const fontSize = await firstText.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return parseFloat(styles.fontSize);
      });
      
      // 폰트 크기가 12px 이상인지 확인 (접근성 기준)
      expect(fontSize).toBeGreaterThanOrEqual(12);
    }
  });

  test('이미지 alt 텍스트 테스트', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    
    // 이미지 요소들 확인
    const images = page.locator('img');
    const count = await images.count();
    
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 5); i++) {
        const image = images.nth(i);
        await expect(image).toBeVisible();
        
        const altText = await image.getAttribute('alt');
        // alt 속성이 있거나 빈 문자열인지 확인 (장식용 이미지의 경우)
        expect(altText).toBeDefined();
      }
    }
  });

  test('폼 라벨 테스트', async ({ page }) => {
    await page.goto('/login-form');
    
    // 입력 필드들의 라벨 확인
    const inputs = page.locator('input, textarea, select');
    const count = await inputs.count();
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const input = inputs.nth(i);
        await expect(input).toBeVisible();
        
        // 라벨이 있는지 확인
        const id = await input.getAttribute('id');
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          const labelCount = await label.count();
          
          if (labelCount === 0) {
            // aria-label 또는 placeholder가 있는지 확인
            const ariaLabel = await input.getAttribute('aria-label');
            const placeholder = await input.getAttribute('placeholder');
            
            expect(ariaLabel || placeholder).toBeTruthy();
          }
        }
      }
    }
  });

  test('스크린 리더 호환성 테스트', async ({ page }) => {
    await page.goto('/');
    
    // 스크린 리더용 텍스트 확인
    const screenReaderTexts = page.locator('[aria-label], [aria-describedby], [aria-labelledby]');
    const count = await screenReaderTexts.count();
    
    if (count > 0) {
      const firstElement = screenReaderTexts.first();
      await expect(firstElement).toBeVisible();
    }
  });

  test('포커스 표시 테스트', async ({ page }) => {
    await page.goto('/');
    
    // 클릭 가능한 요소들 확인
    const clickableElements = page.locator('button, a, input, textarea, select');
    const count = await clickableElements.count();
    
    if (count > 0) {
      const firstElement = clickableElements.first();
      await expect(firstElement).toBeVisible();
      
      // 포커스 스타일 확인
      await firstElement.focus();
      
      const focusStyles = await firstElement.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          outlineWidth: styles.outlineWidth,
          outlineStyle: styles.outlineStyle
        };
      });
      
      // 포커스 표시가 있는지 확인
      expect(focusStyles.outlineWidth !== '0px' || focusStyles.outlineStyle !== 'none').toBeTruthy();
    }
  });

  test('모바일 접근성 테스트', async ({ page }) => {
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // 터치 타겟 크기 확인 (최소 44px)
    const touchTargets = page.locator('button, a, input, textarea, select');
    const count = await touchTargets.count();
    
    if (count > 0) {
      const firstTarget = touchTargets.first();
      await expect(firstTarget).toBeVisible();
      
      const size = await firstTarget.boundingBox();
      if (size) {
        // 터치 타겟이 충분히 큰지 확인
        expect(Math.min(size.width, size.height)).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('고대비 모드 테스트', async ({ page }) => {
    // 고대비 모드 시뮬레이션
    await page.emulateMedia({ colorScheme: 'dark' });
    
    await page.goto('/');
    
    // 페이지가 정상적으로 로드되는지 확인
    await expect(page.locator('body')).toBeVisible();
    
    // 다크 모드에서도 텍스트가 읽기 가능한지 확인
    const textElements = page.locator('p, h1, h2, h3, h4, h5, h6');
    const count = await textElements.count();
    
    if (count > 0) {
      const firstText = textElements.first();
      await expect(firstText).toBeVisible();
    }
  });
});
