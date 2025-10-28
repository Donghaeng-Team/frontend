import { test, expect } from '@playwright/test';

test.describe('로그인 폼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login-form');
  });

  test('로그인 폼 요소들이 정상적으로 렌더링되는지 확인', async ({ page }) => {
    // 폼 요소들 확인
    await expect(page.locator('h1')).toContainText('이메일 로그인');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('로그인');
  });

  test('이메일 유효성 검사', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');
    const submitButton = page.locator('button[type="submit"]');

    // 빈 이메일 입력 시
    await emailInput.fill('');
    await submitButton.click();
    await expect(page.locator('.form-error')).toContainText('이메일을 입력해주세요');

    // 잘못된 이메일 형식 입력 시
    await emailInput.fill('invalid-email');
    await submitButton.click();
    await expect(page.locator('.form-error')).toContainText('올바른 이메일 형식을 입력해주세요');

    // 올바른 이메일 형식 입력 시
    await emailInput.fill('test@example.com');
    await expect(page.locator('.form-error')).not.toBeVisible();
  });

  test('비밀번호 유효성 검사', async ({ page }) => {
    const passwordInput = page.locator('input[name="password"]');
    const submitButton = page.locator('button[type="submit"]');

    // 빈 비밀번호 입력 시
    await passwordInput.fill('');
    await submitButton.click();
    await expect(page.locator('.form-error')).toContainText('비밀번호를 입력해주세요');

    // 짧은 비밀번호 입력 시
    await passwordInput.fill('123');
    await submitButton.click();
    await expect(page.locator('.form-error')).toContainText('비밀번호는 최소 6자 이상이어야 합니다');

    // 올바른 비밀번호 입력 시
    await passwordInput.fill('password123');
    await expect(page.locator('.form-error')).not.toBeVisible();
  });

  test('회원가입 링크 클릭', async ({ page }) => {
    await page.click('text=회원가입 하기');
    await expect(page).toHaveURL(/.*signup/);
  });

  test('돌아가기 버튼 클릭', async ({ page }) => {
    await page.click('text=← 돌아가기');
    await expect(page).toHaveURL(/.*login/);
  });
});

test.describe('회원가입 폼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
  });

  test('회원가입 폼 요소들이 정상적으로 렌더링되는지 확인', async ({ page }) => {
    // 폼 요소들 확인
    await expect(page.locator('h1')).toContainText('회원가입');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="nickname"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="passwordConfirm"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('회원가입');
  });

  test('이메일 유효성 검사', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');
    const submitButton = page.locator('button[type="submit"]');

    // 빈 이메일 입력 시
    await emailInput.fill('');
    await emailInput.blur();
    await expect(page.locator('.error')).toContainText('이메일을 입력해주세요');

    // 잘못된 이메일 형식 입력 시
    await emailInput.fill('invalid-email');
    await emailInput.blur();
    await expect(page.locator('.error')).toContainText('올바른 이메일 형식이 아닙니다');

    // 올바른 이메일 형식 입력 시
    await emailInput.fill('test@example.com');
    await emailInput.blur();
    await expect(page.locator('.error')).not.toBeVisible();
  });

  test('닉네임 유효성 검사', async ({ page }) => {
    const nicknameInput = page.locator('input[name="nickname"]');

    // 빈 닉네임 입력 시
    await nicknameInput.fill('');
    await nicknameInput.blur();
    await expect(page.locator('.error')).toContainText('닉네임을 입력해주세요');

    // 짧은 닉네임 입력 시
    await nicknameInput.fill('a');
    await nicknameInput.blur();
    await expect(page.locator('.error')).toContainText('닉네임은 최소 2자 이상이어야 합니다');

    // 긴 닉네임 입력 시
    await nicknameInput.fill('verylongnickname');
    await nicknameInput.blur();
    await expect(page.locator('.error')).toContainText('닉네임은 최대 10자까지 입력 가능합니다');

    // 특수문자 포함 닉네임 입력 시
    await nicknameInput.fill('test@123');
    await nicknameInput.blur();
    await expect(page.locator('.error')).toContainText('닉네임은 한글, 영문, 숫자만 사용 가능합니다');

    // 올바른 닉네임 입력 시
    await nicknameInput.fill('홍길동');
    await nicknameInput.blur();
    await expect(page.locator('.error')).not.toBeVisible();
  });

  test('비밀번호 유효성 검사', async ({ page }) => {
    const passwordInput = page.locator('input[name="password"]');

    // 빈 비밀번호 입력 시
    await passwordInput.fill('');
    await passwordInput.blur();
    await expect(page.locator('.error')).toContainText('비밀번호를 입력해주세요');

    // 짧은 비밀번호 입력 시
    await passwordInput.fill('1234567');
    await passwordInput.blur();
    await expect(page.locator('.error')).toContainText('비밀번호는 최소 8자 이상이어야 합니다');

    // 영문만 포함된 비밀번호 입력 시
    await passwordInput.fill('password');
    await passwordInput.blur();
    await expect(page.locator('.error')).toContainText('비밀번호는 영문과 숫자를 포함해야 합니다');

    // 숫자만 포함된 비밀번호 입력 시
    await passwordInput.fill('12345678');
    await passwordInput.blur();
    await expect(page.locator('.error')).toContainText('비밀번호는 영문과 숫자를 포함해야 합니다');

    // 올바른 비밀번호 입력 시
    await passwordInput.fill('password123');
    await passwordInput.blur();
    await expect(page.locator('.error')).not.toBeVisible();
  });

  test('비밀번호 확인 유효성 검사', async ({ page }) => {
    const passwordInput = page.locator('input[name="password"]');
    const passwordConfirmInput = page.locator('input[name="passwordConfirm"]');

    // 비밀번호 설정
    await passwordInput.fill('password123');

    // 빈 비밀번호 확인 입력 시
    await passwordConfirmInput.fill('');
    await passwordConfirmInput.blur();
    await expect(page.locator('.error')).toContainText('비밀번호를 다시 입력해주세요');

    // 일치하지 않는 비밀번호 입력 시
    await passwordConfirmInput.fill('different123');
    await passwordConfirmInput.blur();
    await expect(page.locator('.error')).toContainText('비밀번호가 일치하지 않습니다');

    // 일치하는 비밀번호 입력 시
    await passwordConfirmInput.fill('password123');
    await passwordConfirmInput.blur();
    await expect(page.locator('.error')).not.toBeVisible();
  });

  test('약관 동의 체크박스 테스트', async ({ page }) => {
    const allCheckbox = page.locator('input[type="checkbox"]').first();
    const termsCheckbox = page.locator('text=[필수] 이용약관 동의').locator('..').locator('input[type="checkbox"]');
    const privacyCheckbox = page.locator('text=[필수] 개인정보 처리방침 동의').locator('..').locator('input[type="checkbox"]');
    const marketingCheckbox = page.locator('text=[선택] 마케팅 정보 수신 동의').locator('..').locator('input[type="checkbox"]');

    // 전체 동의 체크박스 클릭
    await allCheckbox.click();
    await expect(termsCheckbox).toBeChecked();
    await expect(privacyCheckbox).toBeChecked();
    await expect(marketingCheckbox).toBeChecked();

    // 전체 동의 체크박스 해제
    await allCheckbox.click();
    await expect(termsCheckbox).not.toBeChecked();
    await expect(privacyCheckbox).not.toBeChecked();
    await expect(marketingCheckbox).not.toBeChecked();

    // 개별 체크박스 클릭
    await termsCheckbox.click();
    await privacyCheckbox.click();
    await expect(allCheckbox).toBeChecked(); // 필수 항목들이 모두 체크되면 전체 동의도 체크됨
  });

  test('로그인 링크 클릭', async ({ page }) => {
    await page.click('text=로그인하기');
    await expect(page).toHaveURL(/.*login/);
  });

  test('돌아가기 버튼 클릭', async ({ page }) => {
    await page.click('text=← 로그인으로');
    await expect(page).toHaveURL(/.*login/);
  });
});
