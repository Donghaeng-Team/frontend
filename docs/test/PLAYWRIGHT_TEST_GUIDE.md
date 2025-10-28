# Playwright MCP Server 사용 가이드 🎭

이 가이드는 [mcp-playwright](https://github.com/executeautomation/mcp-playwright)를 사용하여 AI 도구와 브라우저를 연동하는 방법을 설명합니다.

## 📋 개요

**Playwright MCP Server**는 Model Context Protocol (MCP) 서버로, LLM이 브라우저를 자동화할 수 있게 해주는 도구입니다. Claude Desktop, Cline, Cursor IDE 등과 연동하여 웹 페이지와 상호작용할 수 있습니다.

### 주요 기능
- 🌐 웹 페이지 자동화
- 📸 스크린샷 촬영
- 🧪 테스트 코드 생성
- 🔍 웹 스크래핑
- ⚡ JavaScript 실행
- 🔌 API 호출

## 🚀 설치 방법

### 1. npm을 사용한 설치
```bash
npm install -g @executeautomation/playwright-mcp-server
```

### 2. mcp-get을 사용한 설치
```bash
npx @michaellatman/mcp-get@latest install @executeautomation/playwright-mcp-server
```

### 3. Smithery를 사용한 설치 (Claude Desktop 자동 설치)
```bash
npx @smithery/cli install @executeautomation/playwright-mcp-server --client claude
```

## 🔧 설정 방법

### Claude Desktop 설정

Claude Desktop의 설정 파일에 다음 내용을 추가합니다:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@executeautomation/playwright-mcp-server"]
    }
  }
}
```

### VS Code 설정

VS Code에서 Playwright MCP 서버를 설치하려면:

#### CLI를 사용한 설치
```bash
# VS Code
code --add-mcp '{"name":"playwright","command":"npx","args":["@executeautomation/playwright-mcp-server"]}'

# VS Code Insiders
code-insiders --add-mcp '{"name":"playwright","command":"npx","args":["@executeautomation/playwright-mcp-server"]}'
```

#### 버튼을 사용한 설치
- **VS Code**: Install in VS Code 버튼 클릭
- **VS Code Insiders**: Install in VS Code Insiders 버튼 클릭

## 🎯 사용 방법

### 기본 사용법

설치 후 AI 도구에서 다음과 같이 사용할 수 있습니다:

```
웹 페이지에 접속해서 스크린샷을 찍어주세요
```

```
Google에서 "Playwright"를 검색해주세요
```

```
이 웹사이트의 모든 링크를 추출해주세요
```

### 주요 명령어 예시

#### 1. 웹 페이지 접속
```
https://example.com에 접속해주세요
```

#### 2. 스크린샷 촬영
```
현재 페이지의 스크린샷을 찍어주세요
```

#### 3. 요소 클릭
```
로그인 버튼을 클릭해주세요
```

#### 4. 폼 입력
```
이메일 필드에 test@example.com을 입력해주세요
```

#### 5. JavaScript 실행
```
페이지의 제목을 가져오는 JavaScript를 실행해주세요
```

## 🛠️ 고급 기능

### 테스트 코드 생성
AI가 웹 페이지와 상호작용하면서 자동으로 테스트 코드를 생성할 수 있습니다.

### 웹 스크래핑
웹 페이지의 데이터를 자동으로 추출하고 구조화할 수 있습니다.

### API 테스트
웹 애플리케이션의 API 엔드포인트를 테스트할 수 있습니다.

## 🔍 지원되는 도구

- **Claude Desktop**: 가장 많이 사용되는 도구
- **Cline**: 코드 생성 및 편집 도구
- **Cursor IDE**: AI 기반 코드 에디터
- **VS Code**: GitHub Copilot과 연동

## 📊 테스트 실행

프로젝트는 Jest를 사용하여 테스트를 실행합니다:

```bash
# 커스텀 스크립트로 테스트 실행 (커버리지 포함)
node run-tests.cjs

# npm 스크립트로 테스트 실행
npm test                    # 커버리지 없이 테스트
npm run test:coverage       # 커버리지 포함 테스트
npm run test:custom         # 커스텀 스크립트 (위와 동일)
```

### 평가 실행
```bash
OPENAI_API_KEY=your-key npx mcp-eval src/evals/evals.ts src/tools/codegen/index.ts
```

## ⚠️ 주의사항

### 도구 이름 길이 제한
일부 클라이언트(예: Cursor)는 서버와 도구 이름의 조합에 60자 제한이 있습니다.

- 서버 이름: `playwright-mcp`
- 도구 이름은 이 제한을 고려하여 짧게 작성해야 합니다

### 보안 고려사항
- 웹 페이지와 상호작용할 때 민감한 정보가 노출될 수 있습니다
- 신뢰할 수 있는 웹사이트에서만 사용하세요
- 자동화된 작업이 예상치 못한 결과를 가져올 수 있습니다

## 🆚 일반 Playwright와의 차이점

| 구분 | 일반 Playwright | mcp-playwright |
|------|----------------|----------------|
| **목적** | 개발자가 직접 테스트 코드 작성 | AI가 브라우저를 자동화 |
| **사용자** | 개발자 | AI 도구 (Claude, Cursor 등) |
| **설치** | `npm install @playwright/test` | `npm install @executeautomation/playwright-mcp-server` |
| **사용법** | 테스트 코드 작성 후 실행 | 자연어로 명령어 전달 |

## 🚀 실제 사용 예시

### 1. 웹사이트 테스트 자동화
```
이 웹사이트의 로그인 기능을 테스트해주세요. 
잘못된 이메일로 로그인을 시도하고 에러 메시지를 확인해주세요.
```

### 2. 데이터 수집
```
이 쇼핑몰에서 상품 가격 정보를 수집해주세요.
```

### 3. UI 테스트
```
이 웹 애플리케이션의 반응형 디자인을 모바일 화면에서 테스트해주세요.
```

## 📚 추가 리소스

- [mcp-playwright GitHub 저장소](https://github.com/executeautomation/mcp-playwright)
- [공식 문서 및 API 참조](https://executeautomation.github.io/mcp-playwright/)
- [Model Context Protocol 공식 문서](https://modelcontextprotocol.io/)
- [Playwright 공식 문서](https://playwright.dev/)

## 🤝 기여하기

새로운 도구를 추가할 때는 도구 이름의 길이를 고려해주세요. 서버 이름 `playwright-mcp`와 함께 60자를 초과하지 않도록 주의하세요.

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

*이 가이드는 [mcp-playwright GitHub 저장소](https://github.com/executeautomation/mcp-playwright)를 기반으로 작성되었습니다.*
