# 커뮤니티 서비스 백엔드 인수인계 문서

## 📋 개요

프론트엔드에서 커뮤니티 API 통합 작업을 완료했으나, **백엔드 에러**로 인해 정상 동작하지 않는 상태입니다.
프론트엔드 코드는 검증 완료되었으며, 백엔드 수정이 필요합니다.

---

## 🚨 긴급 수정 필요 사항

### ❌ 1. S3 CORS 설정 누락 (최우선)

**현재 상태**:
- ✅ Presigned URL 발급 엔드포인트 정상 동작 (`/upload-url/{postId}`)
- ✅ 프론트엔드 Authorization 헤더 추가 완료
- ❌ S3 버킷에 CORS 정책이 없어 브라우저에서 S3로 직접 업로드 실패

**에러 메시지**:
```
Access to fetch at 'https://sesac-bytogether-bucket.s3.ap-northeast-2.amazonaws.com/...'
from origin 'http://localhost:3000' has been blocked by CORS policy:
Response to preflight request doesn't pass access control check:
No 'Access-Control-Allow-Origin' header is present on the requested resource.

OPTIONS https://sesac-bytogether-bucket.s3.ap-northeast-2.amazonaws.com/... 403 Forbidden
```

**원인**: S3 버킷(`sesac-bytogether-bucket`)에 CORS 설정이 없음

**해결 방법**: 아래 "5. S3 CORS 설정 (긴급)" 섹션 참조

---

### ❌ 2. Swagger 문서와 실제 API 엔드포인트 불일치

**현재 Swagger 문서** (포트 8085):
```
GET /api/v1/posts/public/{userId}   ← 사용자별 게시글 목록
GET /api/v1/posts/public/{postId}   ← 게시글 상세
```

**문제점**: 두 엔드포인트가 **같은 패턴**을 사용하여 라우팅 충돌 발생!
- 백엔드가 `postId=25`를 `userId=25`로 잘못 해석
- RESTful 설계 원칙 위반

**실제 구현된 엔드포인트** (dev-comm 브랜치):
```
GET /api/v1/posts/public/user/{userId}  ← 사용자별 게시글 목록
GET /api/v1/posts/public/post/{postId}  ← 게시글 상세
```

**프론트엔드 상태**: ✅ 이미 올바른 엔드포인트로 수정 완료
```typescript
// src/api/services/community.ts
getPostsByUserId: `/api/v1/posts/public/user/${userId}`  // ✅
getPost: `/api/v1/posts/public/post/${postId}`           // ✅
```

**백엔드 조치 필요**:
1. Swagger 문서 업데이트 (포트 8085)
2. 실제 컨트롤러가 `/user/`, `/post/` 세그먼트를 사용하도록 확인
3. API Gateway 라우팅 설정 확인

---

### ❌ 3. 게시글 상세 조회 500 에러

**파일**: `backend/comm-service/src/main/java/com/bytogether/commservice/service/PostService.java`
**메서드**: `getPostDetail(Long postId)` (86-101번 줄)

**에러 메시지**:
```
GET http://localhost:8080/api/v1/posts/public/post/25 500 (Internal Server Error)
```

**문제 코드**:
```java
public PostDetailResponse getPostDetail(Long postId) {
    Post post = postRepository.findByPostId(postId)
            .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다. id=" + postId));

    // ❌ 문제: PostStat이 DB에 없을 때 fallback 객체에 userId가 누락됨
    PostStat stat = postStatRepository.findById(postId)
            .orElse(PostStat.builder()
                    .postId(postId)
                    .likeCount(0)
                    .commentCount(0)
                    .viewCount(0)
                    .build());  // userId가 null!

    // ❌ 에러 발생 지점: stat.getUserId()가 null을 반환하여 NPE 발생
    UserDto userInfo = UserDto.from(userServiceClient.getUserInfo(
        new UsersInfoRequest(List.of(stat.getUserId()))  // NPE!
    ).get(0));

    return PostDetailResponse.from(post, stat, userInfo);
}
```

**해결 방법 (Option 1 - 권장)**:
```java
PostStat stat = postStatRepository.findById(postId)
        .orElse(PostStat.builder()
                .postId(postId)
                .userId(post.getAuthorId())  // ✅ 작성자 ID 추가
                .likeCount(0)
                .commentCount(0)
                .viewCount(0)
                .build());
```

**해결 방법 (Option 2)**:
```java
PostStat stat = postStatRepository.findById(postId)
        .orElse(PostStat.builder()
                .postId(postId)
                .likeCount(0)
                .commentCount(0)
                .viewCount(0)
                .build());

// UserService 호출 시 post에서 직접 가져오기
UserDto userInfo = UserDto.from(userServiceClient.getUserInfo(
    new UsersInfoRequest(List.of(post.getAuthorId()))  // ✅ post에서 가져옴
).get(0));
```

**영향받는 메서드**: `getPostsList()`도 동일한 이슈일 가능성 높음

---

## 📊 현재 상태

### ✅ 프론트엔드 완료 사항

1. **API 통합 완료**
   - ✅ 게시글 초기 생성: `POST /api/v1/posts/private` (정상 동작, Authorization 헤더 포함)
   - ✅ Presigned URL 발급: `POST /upload-url/{postId}` (정상 동작, Authorization 헤더 포함)
   - ❌ S3 업로드: `PUT {presignedUrl}` (CORS 에러 - 백엔드 S3 설정 필요)
   - ✅ 게시글 수정: `PUT /api/v1/posts/private/{postId}` (정상 동작, Authorization 헤더 포함)
   - ❌ 게시글 상세 조회: `GET /api/v1/posts/public/{postId}` (500 에러 - 백엔드 코드 수정 필요)
   - ❌ 게시글 목록 조회: `GET /api/v1/posts/public` (500 에러 - 백엔드 코드 수정 필요)

2. **8자리 divisionId 사용**
   - 기존: 5자리 (예: `11650`)
   - 변경: 8자리 (예: `11650540`)
   - 모든 API 호출에서 `divisionCode: string` 타입으로 전송

3. **locationStore 연동**
   - 헤더에서 지역 변경 시 실시간 반영
   - 게시글 조회/생성 모두 동일한 divisionId 사용

4. **타입 검증 완료**
   - `divisionCode`: `string` (예: `"11650540"`)
   - `postId`: `number` (예: `123`)
   - `userId`: `number` (예: `1`)

### ❌ 현재 발생 중인 에러

**1. S3 업로드 실패 (CORS 에러) - 최우선 해결 필요**
```
Access to fetch at 'https://sesac-bytogether-bucket.s3.ap-northeast-2.amazonaws.com/...'
from origin 'http://localhost:3000' has been blocked by CORS policy

OPTIONS https://sesac-bytogether-bucket.s3.ap-northeast-2.amazonaws.com/... 403 Forbidden
```
→ **원인**: S3 버킷 CORS 설정 누락
→ **해결**: S3 버킷에 CORS 정책 추가 필요 (아래 섹션 5 참조)

**2. 게시글 조회 실패 (500)**
```
GET http://localhost:8080/api/v1/posts/public?divisionCode=11010540&tag=all
→ 500 Internal Server Error

GET http://localhost:8080/api/v1/posts/public/12
→ 500 Internal Server Error
```
→ **원인**: PostService에서 PostStat fallback 시 userId 누락으로 NPE 발생
→ **해결**: PostService.java 수정 필요 (아래 섹션 2 참조)

---

## 🔍 API 명세 확인

### 1. 게시글 목록 조회
```http
GET /api/v1/posts/public?divisionCode={divisionCode}&tag={tag}
```

**프론트엔드 호출 예시**:
```typescript
const response = await communityService.getPosts({
  divisionCode: '11650540',  // string, 8자리
  tag: 'all'                 // 'all' | 'general' | 'review' | 'question'
});
```

**기대 응답**:
```json
{
  "success": true,
  "data": [
    {
      "postId": 1,
      "title": "게시글 제목",
      "previewContent": "미리보기 내용...",
      "tag": "general",
      "region": "11650540",
      "viewCount": 10,
      "commentCount": 5,
      "likeCount": 3,
      "createdAt": "2025-01-15T10:30:00",
      "thumbnailUrl": "https://..."
    }
  ]
}
```

### 2. 게시글 상세 조회
```http
GET /api/v1/posts/public/{postId}
```

**프론트엔드 호출 예시**:
```typescript
const response = await communityService.getPost(6);  // number
```

**기대 응답**:
```json
{
  "success": true,
  "data": {
    "postId": 6,
    "title": "게시글 제목",
    "content": "전체 내용",
    "tag": "general",
    "region": "11650540",
    "authorId": 1,
    "authorNickname": "작성자",
    "viewCount": 10,
    "commentCount": 5,
    "likeCount": 3,
    "createdAt": "2025-01-15T10:30:00",
    "updatedAt": "2025-01-15T10:30:00",
    "imageUrls": ["https://..."]
  }
}
```

### 3. 게시글 생성 (4단계 플로우)

#### Step 1: 초기 생성 ✅ (정상 동작)
```http
POST /api/v1/posts/private
Content-Type: application/json

{
  "region": "11650540",
  "tag": "general"
}
```

**응답 예시**:
```json
{
  "success": true,
  "message": "요청 성공",
  "data": {
    "id": 13,
    "region": "11650540",
    "tag": "general"
  }
}
```

#### Step 2: Presigned URL 발급 ❌ (404 에러)
```http
POST /api/v1/upload-url/{postId}
X-User-Id: {userId}
Content-Type: application/json

{
  "files": [
    {
      "index": 0,
      "fileName": "image.jpg",
      "contentType": "image/jpeg"
    }
  ]
}
```

**기대 응답**:
```json
{
  "uploadUrls": [
    {
      "index": 0,
      "presignedUrl": "https://s3.amazonaws.com/...",
      "s3Key": "community/123/0_image.jpg"
    }
  ]
}
```

#### Step 3: S3 업로드
```http
PUT {presignedUrl}
Content-Type: image/jpeg

[Binary Data]
```

#### Step 4: 최종 수정 ✅ (정상 동작)
```http
PUT /api/v1/posts/private/{postId}
X-User-Id: {userId}
Content-Type: application/json

{
  "region": "11650540",
  "tag": "general",
  "title": "게시글 제목",
  "content": "게시글 내용",
  "imageKeys": ["community/123/0_image.jpg"]
}
```

---

## 🧪 테스트 방법

### 백엔드 수정 후 테스트 절차

1. **이미지 업로드 엔드포인트 구현**
   - `/api/v1/upload-url/{postId}` 엔드포인트 추가
   - S3 Presigned URL 발급 로직 구현
   - API Gateway 라우팅 설정

2. **PostService 수정 적용**
   - `getPostDetail()` 메서드의 fallback PostStat에 userId 추가
   - `getPostsList()` 메서드도 동일하게 수정

3. **서버 재시작**
   ```bash
   cd backend/comm-service
   ./gradlew bootRun
   ```

4. **API 직접 테스트**
   ```bash
   # 목록 조회
   curl "http://localhost:8080/api/v1/posts/public?divisionCode=11650540&tag=all"

   # 상세 조회
   curl "http://localhost:8080/api/v1/posts/public/12"

   # 이미지 업로드 URL 발급 (userId 헤더 필요)
   curl -X POST "http://localhost:8080/api/v1/upload-url/13" \
     -H "Content-Type: application/json" \
     -H "X-User-Id: 5" \
     -d '{"files":[{"index":0,"fileName":"test.jpg","contentType":"image/jpeg"}]}'
   ```

5. **프론트엔드 연동 테스트**
   - 프론트엔드 개발 서버: `http://localhost:5173`
   - 커뮤니티 페이지 접속: `http://localhost:5173/community`
   - 게시글 목록이 정상적으로 표시되는지 확인
   - 게시글 클릭 시 상세 페이지가 열리는지 확인
   - 이미지와 함께 새 게시글 작성이 정상 동작하는지 확인

---

## 📝 추가 확인 사항

### 1. divisionCode 처리
- **타입**: `String` (프론트엔드에서 문자열로 전송)
- **형식**: 8자리 (예: `"11650540"`)
- **백엔드 파라미터 타입 확인**: `@RequestParam String divisionCode`

### 2. region 필드
- Post 엔티티의 `region` 필드가 8자리 divisionId를 저장하고 있는지 확인
- 응답 DTO에서 `region` 필드가 올바르게 반환되는지 확인

### 3. UserService 연동
- UserService에서 `userId`가 null일 때 어떻게 처리하는지 확인
- PostStat에 userId가 없는 경우의 처리 로직 정립 필요

### 4. PostStat 생성 시점
- 게시글이 생성될 때 PostStat도 함께 생성되는지 확인
- 생성 시 userId를 포함하여 저장하는지 확인

### 5. S3 CORS 설정 (긴급)

**현재 상태**: S3 버킷에 CORS 정책이 설정되어 있지 않아 이미지 업로드 실패

**에러 내용**:
```
Access to fetch at 'https://sesac-bytogether-bucket.s3.ap-northeast-2.amazonaws.com/...'
from origin 'http://localhost:3000' has been blocked by CORS policy:
Response to preflight request doesn't pass access control check:
No 'Access-Control-Allow-Origin' header is present on the requested resource.

OPTIONS https://sesac-bytogether-bucket.s3.ap-northeast-2.amazonaws.com/... 403 Forbidden
```

**필요한 S3 CORS 설정**:

AWS S3 콘솔에서 `sesac-bytogether-bucket` 버킷의 **권한** 탭 → **CORS(Cross-Origin Resource Sharing)** 섹션에 다음 설정 추가:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "http://localhost:3000",
            "http://localhost:5173",
            "https://your-production-domain.com"
        ],
        "ExposeHeaders": [
            "ETag"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

**설정 설명**:
- `AllowedHeaders`: 모든 헤더 허용 (Content-Type 등)
- `AllowedMethods`: GET, PUT 등 필요한 HTTP 메서드
- `AllowedOrigins`: 프론트엔드 개발 서버와 프로덕션 도메인
- `ExposeHeaders`: ETag 헤더 노출 (업로드 검증용)
- `MaxAgeSeconds`: Preflight 캐시 시간 (50분)

**확인 방법**:
1. AWS S3 Console → `sesac-bytogether-bucket` 선택
2. **권한** 탭 클릭
3. **CORS(Cross-Origin Resource Sharing)** 섹션 확인
4. 위 JSON 설정 적용 후 저장
5. 프론트엔드에서 이미지 업로드 재시도

**추가 확인 사항**:
- IAM 권한: Presigned URL 발급을 위한 `s3:PutObject` 권한 확인
- 버킷 정책: 퍼블릭 액세스 차단 설정 확인 (Presigned URL은 작동해야 함)
- ACL 설정: 업로드된 파일의 읽기 권한 설정

---

## 🔗 관련 링크

- **프론트엔드 PR**: https://github.com/Donghaeng-Team/frontend/pull/new/feat/community-api
- **브랜치**: `feat/community-api`
- **커밋**: `eb4c201 - feat: 커뮤니티 API 통합 및 8자리 divisionId 사용`

---

## 📞 문의사항

백엔드 수정 완료 후 프론트엔드 개발자에게 알려주시면 통합 테스트를 진행하겠습니다.

**프론트엔드 상태**: ✅ 완료 (백엔드 수정 대기 중)
- ✅ API 통합 완료 (fetch API 사용, Authorization 헤더 포함)
- ✅ 8자리 divisionId 사용
- ✅ locationStore 연동
- ✅ 4단계 이미지 업로드 플로우 구현

**백엔드 상태**: ❌ 수정 필요
  1. S3 버킷 CORS 설정 추가 (최우선)
  2. PostService userId 이슈 수정 필요

---

## ✅ 체크리스트

백엔드 작업자가 확인해야 할 사항:

### 우선순위 1 - S3 CORS 설정 (긴급)
- [ ] S3 버킷 CORS 설정 추가 (localhost:3000, localhost:5173 허용)
- [ ] CORS 설정 후 브라우저에서 S3 업로드 테스트
- [ ] IAM 권한 확인 (s3:PutObject)
- [ ] 업로드된 파일 읽기 권한 확인

### 우선순위 2 - 이미지 업로드 엔드포인트
- [x] `/upload-url/{postId}` 컨트롤러 구현 (완료)
- [x] S3 Presigned URL 발급 로직 구현 (완료)
- [x] API Gateway 라우팅 설정 (완료)
- [ ] S3 버킷 생성 및 기본 IAM 권한 설정

### 우선순위 2 - 게시글 조회
- [ ] `PostService.getPostDetail()` - fallback PostStat에 userId 추가
- [ ] `PostService.getPostsList()` - 동일 이슈 확인 및 수정
- [ ] divisionCode 파라미터 타입이 String인지 확인
- [ ] Post.region 필드가 8자리 divisionId를 저장하는지 확인

### 우선순위 3 - 데이터 정합성
- [ ] 게시글 생성 시 PostStat이 userId와 함께 저장되는지 확인
- [ ] 로컬 테스트: 목록 조회 API 정상 동작 확인
- [ ] 로컬 테스트: 상세 조회 API 정상 동작 확인
- [ ] 로컬 테스트: 이미지 업로드 전체 플로우 정상 동작 확인
- [ ] 프론트엔드와 통합 테스트 진행
- [ ] 프론트엔드 개발자에게 수정 완료 알림
