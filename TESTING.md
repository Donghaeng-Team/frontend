# E2E 테스트 가이드 (Playwright MCP)

## 빠른 시작

### 1. 개발 서버 실행

```bash
npm run dev
```

개발 서버가 http://localhost:5173 에서 실행됩니다.

### 2. Playwright MCP로 테스트하기

별도 터미널에서 Playwright MCP를 사용하여 테스트를 진행합니다.

Playwright MCP는 자연어로 브라우저 테스트를 작성하고 실행할 수 있는 도구입니다.

## Playwright MCP 설정

### Claude Code와 함께 사용 (권장)

1. **Claude Code 설정 파일에 MCP 서버 추가**

Windows: `%APPDATA%\claude-code\config.json`
Mac/Linux: `~/.config/claude-code/config.json`

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

2. **Claude Code 실행**

```bash
# 프로젝트 디렉토리에서
claude-code
```

3. **자연어로 테스트 요청**

```
"http://localhost:5173/login-form 페이지로 이동해서 이메일 test@example.com, 비밀번호 Test1234!로 로그인하고 스크린샷 찍어줘"
```

## 테스트 시나리오 예제

### 로그인 테스트

```
1. http://localhost:5173/login-form 페이지로 이동
2. 이메일 입력 필드에 seller@test.com 입력
3. 비밀번호 입력 필드에 Test1234! 입력
4. 로그인 버튼 클릭
5. URL이 / 로 변경되는지 확인
6. 스크린샷 캡처
```

### 상품 목록 테스트

```
1. http://localhost:5173/products 페이지로 이동
2. 상품 카드가 표시되는지 확인
3. 검색 입력 필드에 "사과" 입력
4. 검색 버튼 클릭
5. 검색 결과가 표시되는지 확인
6. 스크린샷 캡처
```

### 채팅 테스트

```
1. http://localhost:5173/chat/1 페이지로 이동
2. 메시지 입력 필드에 "안녕하세요" 입력
3. 전송 버튼 클릭
4. 메시지가 화면에 표시되는지 확인
5. 스크린샷 캡처
```

## 테스트 사용자 계정

테스트 환경에 다음 계정들이 준비되어 있어야 합니다:

- **판매자**: seller@test.com / Test1234!
- **구매자1**: buyer1@test.com / Test1234!
- **구매자2**: buyer2@test.com / Test1234!
- **구매자3**: buyer3@test.com / Test1234!

## 상세 문서

전체 테스트 가이드는 [E2E Testing Guide](./docs/E2E-Testing-Guide.md)를 참고하세요.

### 주요 내용

- Playwright MCP 설정 방법
- 테스트 시나리오 우선순위
- 자연어 테스트 작성법
- CI/CD 통합
- 모범 사례

## 문제 해결

### 개발 서버가 실행되지 않는 경우

```bash
# 의존성 재설치
npm install

# 개발 서버 재시작
npm run dev
```

### Playwright MCP가 연결되지 않는 경우

1. Claude Code 설정 파일 확인
2. npx @playwright/mcp@latest 명령어가 실행 가능한지 확인
3. Node.js 버전 확인 (18 이상 권장)

## 참고 자료

- [Playwright MCP 공식 문서](https://github.com/microsoft/playwright-mcp)
- [Playwright 공식 문서](https://playwright.dev)
- [Model Context Protocol](https://modelcontextprotocol.io)
