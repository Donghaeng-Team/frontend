# 커뮤니티 서비스 백엔드 확인 사항

> 작성일: 2025-10-24
> 프로젝트: Bytogether Frontend
> 관련 기능: 커뮤니티 게시글, 댓글, 좋아요, 조회수

## 📋 목차
1. [조회수(viewCount) 자동 증가 확인](#조회수-자동-증가-확인)
2. [좋아요 토글 기능 확인](#좋아요-토글-기능-확인)
3. [현재 프론트엔드 구현](#현재-프론트엔드-구현)

---

## 🔍 조회수(viewCount) 자동 증가 확인

### 엔드포인트
`GET /api/v1/posts/public/post/{postId}`

### 확인 필요 사항

**1. 자동 증가 여부**
- 게시글 조회 API 호출 시 viewCount가 자동으로 증가하는가?
- 현재 프론트엔드는 API 응답의 viewCount를 그대로 표시

**2. 중복 카운트 방지 로직**
다음 중 어떤 방식으로 중복 카운트를 방지하고 있는가?

| 방식 | 설명 | 장점 | 단점 |
|-----|------|------|------|
| IP 기반 | 동일 IP에서 일정 시간 내 재조회 시 카운트 안함 | 구현 간단 | 공용 네트워크에서 부정확 |
| 세션 기반 | 동일 세션에서 재조회 시 카운트 안함 | 사용자별 추적 가능 | 세션 관리 필요 |
| 쿠키 기반 | 브라우저 쿠키로 조회 이력 저장 | 정확도 높음 | 쿠키 삭제 시 무효화 |
| 없음 | 모든 조회 카운트 | 구현 불필요 | 새로고침 시 계속 증가 |

**3. 시간 제한**
- 동일 사용자의 재조회를 몇 분/시간 후부터 카운트하는가?
- 예: "동일 IP에서 30분 이내 재조회는 카운트 안함"

### 권장 사항
- **IP + 시간 기반** 중복 방지 권장
- 예: 동일 IP에서 1시간 이내 재조회는 카운트하지 않음
- Redis 등을 활용한 조회 이력 캐싱

### 프론트엔드 구현
```typescript
// 게시글 로드 시 자동으로 viewCount 표시
const response = await communityService.getPost(postId);
setPost(response.data);

// 표시
<div>조회 {post.viewCount}</div>
```

**별도 API 호출 없음** - 백엔드에서 자동 처리 가정

---

## ❤️ 좋아요 토글 기능 확인

### 현재 API
`POST /api/v1/posts/private/{postId}/likes`

### 문제 상황
현재 API 이름이 `increaseLike`로, **좋아요 추가만** 가능한 것으로 보입니다.

### 확인 필요 사항

**1. 토글 기능 여부**
- 현재 API가 토글(증가/감소)을 지원하는가?
- 아니면 증가만 가능한가?

**2. 중복 좋아요 방지**
- 동일 사용자가 여러 번 좋아요를 누를 수 있는가?
- 이미 좋아요를 누른 사용자가 다시 누르면 어떻게 되는가?
  - A) 에러 반환
  - B) 좋아요 취소 (토글)
  - C) 무시

**3. 좋아요 상태 조회**
현재 사용자가 해당 게시글에 좋아요를 눌렀는지 확인하는 API가 있는가?

| API | 설명 | 필요성 |
|-----|------|--------|
| `GET /api/v1/posts/{postId}/like-status` | 현재 사용자의 좋아요 여부 | ❤️ 아이콘 상태 표시 |
| `DELETE /api/v1/posts/private/{postId}/likes` | 좋아요 취소 | 토글 기능 |

### 권장 구현

#### 옵션 1: 토글 API (권장)
```
POST /api/v1/posts/private/{postId}/likes
- 좋아요 없으면 추가, 있으면 제거
- Response: { liked: boolean, likeCount: number }
```

#### 옵션 2: 분리 API
```
POST   /api/v1/posts/private/{postId}/likes   # 좋아요 추가
DELETE /api/v1/posts/private/{postId}/likes   # 좋아요 취소
GET    /api/v1/posts/private/{postId}/likes   # 좋아요 상태
```

### 현재 프론트엔드 구현

```typescript
const handleLike = async () => {
  // 로그인 체크
  if (!authUser) {
    alert('좋아요를 누르려면 로그인이 필요합니다.');
    return;
  }

  // 좋아요 API 호출 (increaseLike - 증가만 가능)
  await communityService.increaseLike(authUser.userId, post.postId);

  // 낙관적 업데이트
  setLiked(!liked);
  setLikeCount(liked ? likeCount - 1 : likeCount + 1);

  // 정확한 값을 위해 게시글 재조회
  const response = await communityService.getPost(post.postId);
  setLikeCount(response.data.likeCount);
};
```

**문제점**:
- 현재는 토글이 아닌 증가만 가능
- 좋아요 상태(liked)를 알 수 없어 UI 표시가 부정확할 수 있음
- 중복 좋아요 가능 여부 불명확

**필요한 정보**:
1. ✅ 현재 사용자가 이미 좋아요를 눌렀는지 여부 (게시글 조회 API에 포함?)
2. ✅ 좋아요 취소 API 또는 토글 API

---

## 📊 현재 프론트엔드 구현

### 1. 조회수 (viewCount)
```typescript
// 표시만 함 - 백엔드 자동 증가 가정
<div>조회 {post.viewCount}</div>
```

### 2. 댓글수 (commentCount)
```typescript
// API의 totalElements 사용
const response = await commentService.getComments(postId);
setTotalComments(response.data.totalElements);

<h2>댓글 {totalComments}개</h2>
```

✅ **정상 동작 확인됨**

### 3. 좋아요수 (likeCount)
```typescript
// 게시글 조회 시 likeCount 표시
setLikeCount(response.data.likeCount);

// 좋아요 클릭 시 increaseLike API 호출
await communityService.increaseLike(userId, postId);

// 재조회하여 정확한 likeCount 반영
const updated = await communityService.getPost(postId);
setLikeCount(updated.data.likeCount);

<span>좋아요 {likeCount}</span>
```

⚠️ **토글 기능 확인 필요**

---

## ✅ 백엔드 팀 액션 아이템

### 우선순위: 🔴 High

1. **조회수 자동 증가 확인**
   - [ ] GET /posts/public/post/{postId} 호출 시 viewCount 자동 증가 여부
   - [ ] 중복 카운트 방지 로직 (IP/세션/쿠키)
   - [ ] 시간 제한 설정 (예: 1시간)

2. **좋아요 토글 기능 확인**
   - [ ] POST /posts/private/{postId}/likes가 토글을 지원하는가?
   - [ ] 중복 좋아요 방지 로직
   - [ ] 좋아요 상태 조회 방법 (게시글 API에 포함 or 별도 API)

### 우선순위: 🟡 Medium

3. **좋아요 상태 반환**
   - [ ] 게시글 조회 API에 `userLiked: boolean` 필드 추가 권장
   - [ ] 또는 별도 좋아요 상태 조회 API 제공

4. **API 응답 개선**
   - [ ] 좋아요 API 응답에 `{ liked: boolean, likeCount: number }` 포함 권장
   - [ ] 게시글 재조회 없이 클라이언트가 즉시 반영 가능

---

## 🔧 프론트엔드 TODO (백엔드 확인 후)

### 조회수
- [ ] 백엔드 확인 결과에 따라 문서 업데이트
- [ ] 별도 API 필요 시 구현

### 좋아요
- [ ] 좋아요 상태 초기화 로직 추가
  ```typescript
  // 게시글 로드 시
  setLiked(response.data.userLiked);
  ```
- [ ] 토글 지원 시 좋아요 취소 로직 구현
- [ ] 토글 미지원 시 에러 처리 개선

### 댓글
- ✅ 이미 정상 동작 중 (totalElements 사용)

---

**문서 종료**
