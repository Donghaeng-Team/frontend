# 🧪 ByteTogether 스모크 테스트 리포트

## 실행 정보
- 대상 프론트: http://localhost:3000
- 대상 게이트웨이: http://localhost:8080
- 실행 명령: `VITE_API_BASE_URL=http://localhost:8080 npm run test:smoke`
- 리포터: HTML (playwright-report/)

## 테스트 스코프 (스모크)
- 메인 페이지 로드 확인
- 마켓 목록 페이지(`/products`) 로드 확인
- 커뮤니티 목록 페이지(`/community`) 로드 확인
- 로그인 스모크: 환경변수 제공 시에만 시도(E2E_EMAIL/E2E_PASSWORD)

## 전제 조건/환경
- 지역 파라미터 필요로 인해 `localStorage.currentDivision` 사전 주입
  - 예: 서울 강남구 역삼동 (11680101)
- 게이트웨이(8080) 기동 상태
- (옵션) 로그인 시나리오: 환경변수 준비
  - `E2E_EMAIL=user1@example.com`
  - `E2E_PASSWORD=User1234!`

## 결과 요약
- 상세 결과는 HTML 리포트로 확인: `playwright-report/index.html`
- 주요 체크포인트
  - 라우팅 및 초기 API 응답 200 여부
  - CORS/프록시 에러 여부
  - 목록 영역 DOM 가시성 여부

## 참고
- 실패 시 점검 순서
  1) 8080 게이트웨이 헬스: `/api/v1/market/public?divisionId=11680101` 200 확인
  2) 프론트 실행 환경변수: `VITE_API_BASE_URL=http://localhost:8080`
  3) 브라우저 초기 지역: `localStorage.currentDivision` 존재 확인
  4) 로그인 필요한 경우 계정 자격증명 유효성


