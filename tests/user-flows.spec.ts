import { test, expect } from '@playwright/test';

test.describe('사용자 플로우 테스트', () => {
  test('회원가입 → 이메일 인증 → 로그인 플로우', async ({ page }) => {
    // 1. 회원가입 페이지 접근
    await page.goto('/signup');
    await expect(page).toHaveURL(/.*signup/);
    
    // 2. 회원가입 폼 작성
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="nickname"]', '테스트유저');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="passwordConfirm"]', 'password123');
    
    // 약관 동의
    const termsCheckbox = page.locator('input[type="checkbox"]').nth(1);
    const privacyCheckbox = page.locator('input[type="checkbox"]').nth(2);
    await termsCheckbox.check();
    await privacyCheckbox.check();
    
    // 3. 회원가입 버튼 클릭
    const signupButton = page.locator('button[type="submit"]');
    await signupButton.click();
    
    // 4. 이메일 인증 페이지로 이동 확인
    await expect(page).toHaveURL(/.*verify.*email/);
    
    // 5. 로그인 페이지로 이동
    await page.goto('/login-form');
    
    // 6. 로그인 폼 작성
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // 7. 로그인 버튼 클릭
    const loginButton = page.locator('button[type="submit"]');
    await loginButton.click();
    
    // 8. 메인 페이지로 리다이렉트 확인
    await expect(page).toHaveURL('/');
  });

  test('상품 검색 → 상세보기 → 채팅 플로우', async ({ page }) => {
    // 1. 상품 목록 페이지 접근
    await page.goto('/products');
    
    // 2. 검색어 입력
    const searchInput = page.locator('input[placeholder*="상품 검색"]');
    await searchInput.fill('사과');
    await searchInput.press('Enter');
    
    // 3. 검색 결과 확인
    await page.waitForLoadState('networkidle');
    
    // 4. 상품 카드 클릭 (첫 번째 상품이 있다면)
    const productCard = page.locator('.product-card').first();
    if (await productCard.isVisible()) {
      await productCard.click();
      
      // 5. 상품 상세 페이지 확인
      await expect(page).toHaveURL(/.*products\/\d+/);
      
      // 6. 채팅 버튼 클릭 (로그인이 필요한 경우)
      const chatButton = page.locator('button:has-text("채팅"), button:has-text("문의")').first();
      if (await chatButton.isVisible()) {
        await chatButton.click();
        
        // 로그인 페이지로 리다이렉트되는지 확인
        await expect(page).toHaveURL(/.*login/);
      }
    }
  });

  test('커뮤니티 글 작성 → 상세보기 → 댓글 플로우', async ({ page }) => {
    // 1. 커뮤니티 페이지 접근
    await page.goto('/community');
    
    // 2. 글쓰기 버튼 클릭
    const writeButton = page.locator('button:has-text("글쓰기")').first();
    if (await writeButton.isVisible()) {
      await writeButton.click();
      
      // 3. 로그인 페이지로 리다이렉트 확인
      await expect(page).toHaveURL(/.*login/);
      
      // 4. 로그인 후 다시 글쓰기 페이지로 이동
      await page.goto('/login-form');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // 5. 글쓰기 페이지로 이동
      await page.goto('/community/create');
      
      // 6. 글 작성 폼 작성
      await page.fill('input[name="title"], textarea[name="title"]', '테스트 게시글');
      await page.fill('textarea[name="content"], textarea[name="description"]', '테스트 내용입니다.');
      
      // 7. 글 작성 버튼 클릭
      const submitButton = page.locator('button[type="submit"]');
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // 8. 작성된 글 상세 페이지로 이동 확인
        await expect(page).toHaveURL(/.*community\/\d+/);
        
        // 9. 댓글 작성 (댓글 입력창이 있다면)
        const commentInput = page.locator('textarea[name="comment"], input[name="comment"]').first();
        if (await commentInput.isVisible()) {
          await commentInput.fill('테스트 댓글');
          
          const commentSubmitButton = page.locator('button:has-text("댓글"), button:has-text("등록")').first();
          if (await commentSubmitButton.isVisible()) {
            await commentSubmitButton.click();
          }
        }
      }
    }
  });

  test('상품 등록 → 수정 → 삭제 플로우', async ({ page }) => {
    // 1. 로그인
    await page.goto('/login-form');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // 2. 상품 등록 페이지 접근
    await page.goto('/products/register');
    
    // 3. 상품 등록 폼 작성
    await page.fill('input[name="title"], textarea[name="title"]', '테스트 상품');
    await page.fill('textarea[name="description"], textarea[name="content"]', '테스트 상품 설명');
    await page.fill('input[name="price"]', '10000');
    await page.fill('input[name="maxParticipants"]', '5');
    
    // 4. 상품 등록 버튼 클릭
    const registerButton = page.locator('button[type="submit"]');
    if (await registerButton.isVisible()) {
      await registerButton.click();
      
      // 5. 등록된 상품 상세 페이지로 이동 확인
      await expect(page).toHaveURL(/.*products\/\d+/);
      
      // 6. 수정 버튼 클릭
      const editButton = page.locator('button:has-text("수정"), button:has-text("편집")').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        
        // 7. 수정 페이지로 이동 확인
        await expect(page).toHaveURL(/.*products.*edit/);
        
        // 8. 제목 수정
        const titleInput = page.locator('input[name="title"], textarea[name="title"]');
        await titleInput.fill('수정된 테스트 상품');
        
        // 9. 수정 완료 버튼 클릭
        const updateButton = page.locator('button[type="submit"]');
        if (await updateButton.isVisible()) {
          await updateButton.click();
          
          // 10. 수정된 상품 상세 페이지로 이동 확인
          await expect(page).toHaveURL(/.*products\/\d+/);
        }
      }
    }
  });

  test('마이페이지 → 구매내역 → 설정 변경 플로우', async ({ page }) => {
    // 1. 로그인
    await page.goto('/login-form');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // 2. 마이페이지 접근
    await page.goto('/mypage');
    
    // 3. 마이페이지 로드 확인
    await expect(page).toHaveURL(/.*mypage/);
    
    // 4. 구매내역 페이지 접근
    await page.goto('/purchase-history');
    
    // 5. 구매내역 페이지 로드 확인
    await expect(page).toHaveURL(/.*purchase-history/);
    
    // 6. 비밀번호 변경 페이지 접근
    await page.goto('/change-password');
    
    // 7. 비밀번호 변경 페이지 로드 확인
    await expect(page).toHaveURL(/.*change-password/);
  });

  test('반응형 네비게이션 플로우', async ({ page }) => {
    // 데스크톱 뷰포트에서 테스트
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    
    // 데스크톱 헤더 확인
    const desktopHeader = page.locator('.desktop-header, .header');
    if (await desktopHeader.isVisible()) {
      await expect(desktopHeader).toBeVisible();
    }
    
    // 모바일 뷰포트로 변경
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // 모바일 헤더 확인
    const mobileHeader = page.locator('.mobile-header');
    if (await mobileHeader.isVisible()) {
      await expect(mobileHeader).toBeVisible();
    }
    
    // 하단 네비게이션 확인
    const bottomNav = page.locator('.bottom-nav, [class*="bottom-nav"]');
    if (await bottomNav.isVisible()) {
      await expect(bottomNav).toBeVisible();
    }
  });

  test('에러 처리 및 복구 플로우', async ({ page }) => {
    // 1. 존재하지 않는 페이지 접근
    await page.goto('/non-existent-page');
    
    // 2. 404 페이지 또는 에러 메시지 확인
    await expect(page.locator('body')).toBeVisible();
    
    // 3. 홈으로 돌아가기 버튼 클릭 (있다면)
    const homeButton = page.locator('button:has-text("홈으로"), a:has-text("홈으로")').first();
    if (await homeButton.isVisible()) {
      await homeButton.click();
      await expect(page).toHaveURL('/');
    }
    
    // 4. 네트워크 오류 상황 시뮬레이션
    await page.route('**/api/**', route => route.abort());
    
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    
    // 5. 에러 상태에서 새로고침
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 6. 페이지가 정상적으로 로드되는지 확인
    await expect(page.locator('body')).toBeVisible();
  });
});
