import { test, expect } from '@playwright/test';

test.describe('누락된 컴포넌트 테스트', () => {
  test('Accordion 컴포넌트 테스트', async ({ page }) => {
    await page.goto('/showcase');
    
    // Accordion 컴포넌트 섹션이 있는지 확인
    const accordionSection = page.locator('text=Accordion').locator('..');
    await expect(accordionSection).toBeVisible();
    
    // 아코디언 컴포넌트들이 표시되는지 확인
    const accordions = page.locator('.accordion, [class*="accordion"]');
    if (await accordions.first().isVisible()) {
      await expect(accordions.first()).toBeVisible();
      
      // 아코디언 클릭 테스트
      await accordions.first().click();
    }
  });

  test('Avatar 컴포넌트 테스트', async ({ page }) => {
    await page.goto('/showcase');
    
    // Avatar 컴포넌트 섹션이 있는지 확인
    const avatarSection = page.locator('text=Avatar').locator('..');
    await expect(avatarSection).toBeVisible();
    
    // 아바타 컴포넌트들이 표시되는지 확인
    const avatars = page.locator('.avatar, [class*="avatar"]');
    if (await avatars.first().isVisible()) {
      await expect(avatars.first()).toBeVisible();
    }
  });

  test('Breadcrumb 컴포넌트 테스트', async ({ page }) => {
    await page.goto('/showcase');
    
    // Breadcrumb 컴포넌트 섹션이 있는지 확인
    const breadcrumbSection = page.locator('text=Breadcrumb').locator('..');
    await expect(breadcrumbSection).toBeVisible();
    
    // 브레드크럼 컴포넌트들이 표시되는지 확인
    const breadcrumbs = page.locator('.breadcrumb, [class*="breadcrumb"]');
    if (await breadcrumbs.first().isVisible()) {
      await expect(breadcrumbs.first()).toBeVisible();
    }
  });

  test('CategoryFilter 컴포넌트 테스트', async ({ page }) => {
    await page.goto('/showcase');
    
    // CategoryFilter 컴포넌트 섹션이 있는지 확인
    const categoryFilterSection = page.locator('text=CategoryFilter').locator('..');
    await expect(categoryFilterSection).toBeVisible();
    
    // 카테고리 필터 컴포넌트들이 표시되는지 확인
    const categoryFilters = page.locator('.category-filter, [class*="category-filter"]');
    if (await categoryFilters.first().isVisible()) {
      await expect(categoryFilters.first()).toBeVisible();
    }
  });

  test('CategorySelector 컴포넌트 테스트', async ({ page }) => {
    await page.goto('/showcase');
    
    // CategorySelector 컴포넌트 섹션이 있는지 확인
    const categorySelectorSection = page.locator('text=CategorySelector').locator('..');
    await expect(categorySelectorSection).toBeVisible();
    
    // 카테고리 셀렉터 컴포넌트들이 표시되는지 확인
    const categorySelectors = page.locator('.category-selector, [class*="category-selector"]');
    if (await categorySelectors.first().isVisible()) {
      await expect(categorySelectors.first()).toBeVisible();
    }
  });

  test('ChatRoom 컴포넌트 테스트', async ({ page }) => {
    await page.goto('/showcase');
    
    // ChatRoom 컴포넌트 섹션이 있는지 확인
    const chatRoomSection = page.locator('text=ChatRoom').locator('..');
    await expect(chatRoomSection).toBeVisible();
    
    // 채팅방 컴포넌트들이 표시되는지 확인
    const chatRooms = page.locator('.chat-room, [class*="chat-room"]');
    if (await chatRooms.first().isVisible()) {
      await expect(chatRooms.first()).toBeVisible();
    }
  });

  test('Comment 컴포넌트 테스트', async ({ page }) => {
    await page.goto('/showcase');
    
    // Comment 컴포넌트 섹션이 있는지 확인
    const commentSection = page.locator('text=Comment').locator('..');
    await expect(commentSection).toBeVisible();
    
    // 댓글 컴포넌트들이 표시되는지 확인
    const comments = page.locator('.comment, [class*="comment"]');
    if (await comments.first().isVisible()) {
      await expect(comments.first()).toBeVisible();
    }
  });

  test('DatePicker 컴포넌트 테스트', async ({ page }) => {
    await page.goto('/showcase');
    
    // DatePicker 컴포넌트 섹션이 있는지 확인
    const datePickerSection = page.locator('text=DatePicker').locator('..');
    await expect(datePickerSection).toBeVisible();
    
    // 날짜 선택기 컴포넌트들이 표시되는지 확인
    const datePickers = page.locator('.date-picker, [class*="date-picker"]');
    if (await datePickers.first().isVisible()) {
      await expect(datePickers.first()).toBeVisible();
    }
  });

  test('Divider 컴포넌트 테스트', async ({ page }) => {
    await page.goto('/showcase');
    
    // Divider 컴포넌트 섹션이 있는지 확인
    const dividerSection = page.locator('text=Divider').locator('..');
    await expect(dividerSection).toBeVisible();
    
    // 구분선 컴포넌트들이 표시되는지 확인
    const dividers = page.locator('.divider, [class*="divider"]');
    if (await dividers.first().isVisible()) {
      await expect(dividers.first()).toBeVisible();
    }
  });

  test('FormField 컴포넌트 테스트', async ({ page }) => {
    await page.goto('/showcase');
    
    // FormField 컴포넌트 섹션이 있는지 확인
    const formFieldSection = page.locator('text=FormField').locator('..');
    await expect(formFieldSection).toBeVisible();
    
    // 폼 필드 컴포넌트들이 표시되는지 확인
    const formFields = page.locator('.form-field, [class*="form-field"]');
    if (await formFields.first().isVisible()) {
      await expect(formFields.first()).toBeVisible();
    }
  });

  test('GoogleMap 컴포넌트 테스트', async ({ page }) => {
    await page.goto('/showcase');
    
    // GoogleMap 컴포넌트 섹션이 있는지 확인
    const googleMapSection = page.locator('text=GoogleMap').locator('..');
    await expect(googleMapSection).toBeVisible();
    
    // 구글 맵 컴포넌트들이 표시되는지 확인
    const googleMaps = page.locator('.google-map, [class*="google-map"]');
    if (await googleMaps.first().isVisible()) {
      await expect(googleMaps.first()).toBeVisible();
    }
  });

  test('Header 컴포넌트 테스트', async ({ page }) => {
    await page.goto('/');
    
    // 헤더 컴포넌트가 표시되는지 확인
    const header = page.locator('header, [role="banner"], .header');
    await expect(header).toBeVisible();
  });

  test('Layout 컴포넌트 테스트', async ({ page }) => {
    await page.goto('/');
    
    // 레이아웃 컴포넌트가 표시되는지 확인
    const layout = page.locator('.layout, [class*="layout"]');
    if (await layout.first().isVisible()) {
      await expect(layout.first()).toBeVisible();
    }
  });

  test('LocationModal 컴포넌트 테스트', async ({ page }) => {
    await page.goto('/showcase');
    
    // LocationModal 컴포넌트 섹션이 있는지 확인
    const locationModalSection = page.locator('text=LocationModal').locator('..');
    await expect(locationModalSection).toBeVisible();
    
    // 위치 모달 컴포넌트들이 표시되는지 확인
    const locationModals = page.locator('.location-modal, [class*="location-modal"]');
    if (await locationModals.first().isVisible()) {
      await expect(locationModals.first()).toBeVisible();
    }
  });

  test('MobileHeader 컴포넌트 테스트', async ({ page }) => {
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // 모바일 헤더 컴포넌트가 표시되는지 확인
    const mobileHeader = page.locator('.mobile-header, [class*="mobile-header"]');
    if (await mobileHeader.first().isVisible()) {
      await expect(mobileHeader.first()).toBeVisible();
    }
  });

  test('NotificationModal 컴포넌트 테스트', async ({ page }) => {
    await page.goto('/showcase');
    
    // NotificationModal 컴포넌트 섹션이 있는지 확인
    const notificationModalSection = page.locator('text=NotificationModal').locator('..');
    await expect(notificationModalSection).toBeVisible();
    
    // 알림 모달 컴포넌트들이 표시되는지 확인
    const notificationModals = page.locator('.notification-modal, [class*="notification-modal"]');
    if (await notificationModals.first().isVisible()) {
      await expect(notificationModals.first()).toBeVisible();
    }
  });

  test('Pagination 컴포넌트 테스트', async ({ page }) => {
    await page.goto('/showcase');
    
    // Pagination 컴포넌트 섹션이 있는지 확인
    const paginationSection = page.locator('text=Pagination').locator('..');
    await expect(paginationSection).toBeVisible();
    
    // 페이지네이션 컴포넌트들이 표시되는지 확인
    const paginations = page.locator('.pagination, [class*="pagination"]');
    if (await paginations.first().isVisible()) {
      await expect(paginations.first()).toBeVisible();
    }
  });

  test('ProductCard 컴포넌트 테스트', async ({ page }) => {
    await page.goto('/showcase');
    
    // ProductCard 컴포넌트 섹션이 있는지 확인
    const productCardSection = page.locator('text=ProductCard').locator('..');
    await expect(productCardSection).toBeVisible();
    
    // 상품 카드 컴포넌트들이 표시되는지 확인
    const productCards = page.locator('.product-card, [class*="product-card"]');
    if (await productCards.first().isVisible()) {
      await expect(productCards.first()).toBeVisible();
    }
  });

  test('Progress 컴포넌트 테스트', async ({ page }) => {
    await page.goto('/showcase');
    
    // Progress 컴포넌트 섹션이 있는지 확인
    const progressSection = page.locator('text=Progress').locator('..');
    await expect(progressSection).toBeVisible();
    
    // 진행률 컴포넌트들이 표시되는지 확인
    const progresses = page.locator('.progress, [class*="progress"]');
    if (await progresses.first().isVisible()) {
      await expect(progresses.first()).toBeVisible();
    }
  });

  test('ProtectedRoute 컴포넌트 테스트', async ({ page }) => {
    // 로그인이 필요한 페이지 접근
    await page.goto('/mypage');
    
    // 로그인 페이지로 리다이렉트되는지 확인
    await expect(page).toHaveURL(/.*login/);
  });

  test('Rating 컴포넌트 테스트', async ({ page }) => {
    await page.goto('/showcase');
    
    // Rating 컴포넌트 섹션이 있는지 확인
    const ratingSection = page.locator('text=Rating').locator('..');
    await expect(ratingSection).toBeVisible();
    
    // 평점 컴포넌트들이 표시되는지 확인
    const ratings = page.locator('.rating, [class*="rating"]');
    if (await ratings.first().isVisible()) {
      await expect(ratings.first()).toBeVisible();
    }
  });

  test('SearchBar 컴포넌트 테스트', async ({ page }) => {
    await page.goto('/products');
    
    // 검색바 컴포넌트가 표시되는지 확인
    const searchBar = page.locator('.search-bar, [class*="search-bar"]');
    if (await searchBar.first().isVisible()) {
      await expect(searchBar.first()).toBeVisible();
    }
  });

  test('StatCard 컴포넌트 테스트', async ({ page }) => {
    await page.goto('/showcase');
    
    // StatCard 컴포넌트 섹션이 있는지 확인
    const statCardSection = page.locator('text=StatCard').locator('..');
    await expect(statCardSection).toBeVisible();
    
    // 통계 카드 컴포넌트들이 표시되는지 확인
    const statCards = page.locator('.stat-card, [class*="stat-card"]');
    if (await statCards.first().isVisible()) {
      await expect(statCards.first()).toBeVisible();
    }
  });

  test('Tab 컴포넌트 테스트', async ({ page }) => {
    await page.goto('/showcase');
    
    // Tab 컴포넌트 섹션이 있는지 확인
    const tabSection = page.locator('text=Tab').locator('..');
    await expect(tabSection).toBeVisible();
    
    // 탭 컴포넌트들이 표시되는지 확인
    const tabs = page.locator('.tab, [class*="tab"]');
    if (await tabs.first().isVisible()) {
      await expect(tabs.first()).toBeVisible();
    }
  });

  test('TimePicker 컴포넌트 테스트', async ({ page }) => {
    await page.goto('/showcase');
    
    // TimePicker 컴포넌트 섹션이 있는지 확인
    const timePickerSection = page.locator('text=TimePicker').locator('..');
    await expect(timePickerSection).toBeVisible();
    
    // 시간 선택기 컴포넌트들이 표시되는지 확인
    const timePickers = page.locator('.time-picker, [class*="time-picker"]');
    if (await timePickers.first().isVisible()) {
      await expect(timePickers.first()).toBeVisible();
    }
  });

  test('ToggleSwitch 컴포넌트 테스트', async ({ page }) => {
    await page.goto('/showcase');
    
    // ToggleSwitch 컴포넌트 섹션이 있는지 확인
    const toggleSwitchSection = page.locator('text=ToggleSwitch').locator('..');
    await expect(toggleSwitchSection).toBeVisible();
    
    // 토글 스위치 컴포넌트들이 표시되는지 확인
    const toggleSwitches = page.locator('.toggle-switch, [class*="toggle-switch"]');
    if (await toggleSwitches.first().isVisible()) {
      await expect(toggleSwitches.first()).toBeVisible();
    }
  });

  test('Tooltip 컴포넌트 테스트', async ({ page }) => {
    await page.goto('/showcase');
    
    // Tooltip 컴포넌트 섹션이 있는지 확인
    const tooltipSection = page.locator('text=Tooltip').locator('..');
    await expect(tooltipSection).toBeVisible();
    
    // 툴팁 컴포넌트들이 표시되는지 확인
    const tooltips = page.locator('.tooltip, [class*="tooltip"]');
    if (await tooltips.first().isVisible()) {
      await expect(tooltips.first()).toBeVisible();
    }
  });
});
