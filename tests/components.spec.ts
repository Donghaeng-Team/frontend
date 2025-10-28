import { test, expect } from '@playwright/test';

test.describe('컴포넌트 테스트', () => {
  test('Button 컴포넌트 테스트', async ({ page }) => {
    await page.goto('/showcase');
    
    // Button 컴포넌트 섹션이 있는지 확인
    const buttonSection = page.locator('text=Button').locator('..');
    await expect(buttonSection).toBeVisible();
    
    // 다양한 버튼 타입들이 표시되는지 확인
    await expect(page.locator('button:has-text("Primary")')).toBeVisible();
    await expect(page.locator('button:has-text("Secondary")')).toBeVisible();
    await expect(page.locator('button:has-text("Outline")')).toBeVisible();
  });

  test('Input 컴포넌트 테스트', async ({ page }) => {
    await page.goto('/showcase');
    
    // Input 컴포넌트 섹션이 있는지 확인
    const inputSection = page.locator('text=Input').locator('..');
    await expect(inputSection).toBeVisible();
    
    // 입력 필드들이 표시되는지 확인
    const textInput = page.locator('input[type="text"]').first();
    await expect(textInput).toBeVisible();
    
    // 입력 테스트
    await textInput.fill('테스트 입력');
    await expect(textInput).toHaveValue('테스트 입력');
  });

  test('Modal 컴포넌트 테스트', async ({ page }) => {
    await page.goto('/showcase');
    
    // Modal 컴포넌트 섹션이 있는지 확인
    const modalSection = page.locator('text=Modal').locator('..');
    await expect(modalSection).toBeVisible();
    
    // 모달 열기 버튼 찾기
    const openModalButton = page.locator('button:has-text("모달 열기"), button:has-text("Open Modal")').first();
    
    if (await openModalButton.isVisible()) {
      // 모달 열기
      await openModalButton.click();
      
      // 모달이 표시되는지 확인
      await expect(page.locator('.modal, [role="dialog"]')).toBeVisible();
      
      // 모달 닫기 버튼 클릭
      const closeButton = page.locator('button:has-text("닫기"), button:has-text("Close"), .modal-close').first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
        
        // 모달이 닫혔는지 확인
        await expect(page.locator('.modal, [role="dialog"]')).not.toBeVisible();
      }
    }
  });

  test('Card 컴포넌트 테스트', async ({ page }) => {
    await page.goto('/showcase');
    
    // Card 컴포넌트 섹션이 있는지 확인
    const cardSection = page.locator('text=Card').locator('..');
    await expect(cardSection).toBeVisible();
    
    // 카드 컴포넌트들이 표시되는지 확인
    const cards = page.locator('.card, [class*="card"]');
    await expect(cards.first()).toBeVisible();
  });

  test('Dropdown 컴포넌트 테스트', async ({ page }) => {
    await page.goto('/showcase');
    
    // Dropdown 컴포넌트 섹션이 있는지 확인
    const dropdownSection = page.locator('text=Dropdown').locator('..');
    await expect(dropdownSection).toBeVisible();
    
    // 드롭다운 버튼 찾기
    const dropdownButton = page.locator('button[aria-haspopup="true"], .dropdown-trigger').first();
    
    if (await dropdownButton.isVisible()) {
      // 드롭다운 열기
      await dropdownButton.click();
      
      // 드롭다운 메뉴가 표시되는지 확인
      await expect(page.locator('.dropdown-menu, [role="menu"]')).toBeVisible();
      
      // 옵션 클릭
      const option = page.locator('.dropdown-item, [role="menuitem"]').first();
      if (await option.isVisible()) {
        await option.click();
      }
    }
  });

  test('Checkbox 컴포넌트 테스트', async ({ page }) => {
    await page.goto('/showcase');
    
    // Checkbox 컴포넌트 섹션이 있는지 확인
    const checkboxSection = page.locator('text=Checkbox').locator('..');
    await expect(checkboxSection).toBeVisible();
    
    // 체크박스 찾기
    const checkbox = page.locator('input[type="checkbox"]').first();
    await expect(checkbox).toBeVisible();
    
    // 체크박스 클릭
    await checkbox.click();
    await expect(checkbox).toBeChecked();
    
    // 다시 클릭하여 해제
    await checkbox.click();
    await expect(checkbox).not.toBeChecked();
  });

  test('Slider 컴포넌트 테스트', async ({ page }) => {
    await page.goto('/showcase');
    
    // Slider 컴포넌트 섹션이 있는지 확인
    const sliderSection = page.locator('text=Slider').locator('..');
    await expect(sliderSection).toBeVisible();
    
    // 슬라이더 찾기
    const slider = page.locator('input[type="range"], .slider').first();
    
    if (await slider.isVisible()) {
      // 슬라이더 값 변경
      await slider.fill('50');
      await expect(slider).toHaveValue('50');
    }
  });

  test('Toast 컴포넌트 테스트', async ({ page }) => {
    await page.goto('/showcase');
    
    // Toast 컴포넌트 섹션이 있는지 확인
    const toastSection = page.locator('text=Toast').locator('..');
    await expect(toastSection).toBeVisible();
    
    // 토스트 표시 버튼 찾기
    const showToastButton = page.locator('button:has-text("토스트 표시"), button:has-text("Show Toast")').first();
    
    if (await showToastButton.isVisible()) {
      // 토스트 표시
      await showToastButton.click();
      
      // 토스트가 표시되는지 확인
      await expect(page.locator('.toast, [role="alert"]')).toBeVisible();
      
      // 토스트가 자동으로 사라지는지 확인 (3초 대기)
      await page.waitForTimeout(3000);
      await expect(page.locator('.toast, [role="alert"]')).not.toBeVisible();
    }
  });

  test('Skeleton 컴포넌트 테스트', async ({ page }) => {
    await page.goto('/showcase');
    
    // Skeleton 컴포넌트 섹션이 있는지 확인
    const skeletonSection = page.locator('text=Skeleton').locator('..');
    await expect(skeletonSection).toBeVisible();
    
    // 스켈레톤 컴포넌트들이 표시되는지 확인
    const skeletons = page.locator('.skeleton, [class*="skeleton"]');
    await expect(skeletons.first()).toBeVisible();
  });

  test('Badge 컴포넌트 테스트', async ({ page }) => {
    await page.goto('/showcase');
    
    // Badge 컴포넌트 섹션이 있는지 확인
    const badgeSection = page.locator('text=Badge').locator('..');
    await expect(badgeSection).toBeVisible();
    
    // 배지 컴포넌트들이 표시되는지 확인
    const badges = page.locator('.badge, [class*="badge"]');
    await expect(badges.first()).toBeVisible();
  });
});
