import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuthStore } from '../../stores/authStore';
import './CommunityPostDetail.css';

interface Comment {
  id: number;
  author: string;
  location: string;
  time: string;
  content: string;
  profileColor?: string;
}

interface RelatedPost {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  timeAgo: string;
  views: number;
}

const CommunityPostDetail: React.FC = () => {
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.user);

  // 샘플 게시글 데이터
  const postId = 1;
  const authorId = authUser?.userId || 999; // 샘플: 현재 로그인한 사용자를 작성자로 설정 (테스트용)

  // 작성자 여부 확인
  const isAuthor = authUser && authorId === authUser.userId;

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(24);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      author: '과일러버',
      location: '문래동',
      time: '2시간 전',
      content: '저도 이번 공구 참여했는데 정말 만족스러웠어요! 다음에도 또 참여하고 싶네요 😊',
      profileColor: '#ff5e2f'
    },
    {
      id: 2,
      author: '서초맘',
      location: '문래동',
      time: '1시간 전',
      content: '김농부네 과수원 사과는 항상 믿고 사요~ 농약도 적게 쓰시고 당도도 보장되어 있어요',
      profileColor: '#6d2fff'
    },
    {
      id: 3,
      author: '공구매니아',
      location: '문래동',
      time: '5분 전',
      content: '다음주에 배 공동구매도 있던데 그것도 참여해보려고요! 정보 공유 감사합니다 👍',
      profileColor: '#6d2fff'
    }
  ]);

  const relatedPosts: RelatedPost[] = [
    {
      id: 1,
      title: '제주 감귤 공동구매 모집합니다',
      excerpt: '제주 직송 노지 감귤 10kg 공동구매 진행합니다...',
      author: '제주러버',
      timeAgo: '3일 전',
      views: 156
    },
    {
      id: 2,
      title: '유기농 채소 정기 공동구매 후기',
      excerpt: '매주 수요일 유기농 채소 공동구매 1달 후기입니다...',
      author: '건강맘',
      timeAgo: '1주일 전',
      views: 203
    },
    {
      id: 3,
      title: '배 공동구매 모집 중 (10/5 마감)',
      excerpt: '나주 배 특상품 15kg 공동구매 모집합니다...',
      author: '배달인',
      timeAgo: '2일 전',
      views: 89
    }
  ];

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: comments.length + 1,
      author: '나',
      location: '문래동',
      time: '방금',
      content: commentText,
      profileColor: '#ff5e2f'
    };

    setComments([...comments, newComment]);
    setCommentText('');
  };

  const handleShare = () => {
    // 공유 기능 구현
    if (navigator.share) {
      navigator.share({
        title: '지난주 사과 공동구매 정말 만족합니다!',
        text: '함께 사요 - 공구 후기',
        url: window.location.href
      });
    } else {
      // 클립보드 복사 등 대체 방법
      alert('링크가 클립보드에 복사되었습니다!');
    }
  };

  const handleEdit = () => {
    // 수정 페이지로 이동
    navigate(`/community/${postId}/edit`);
  };

  const handleDelete = () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      // 삭제 로직
      console.log('Delete post');
    }
  };

  const handleGoToList = () => {
    // 목록으로 이동
    window.history.back();
  };

  const getInitials = (name: string) => {
    return name.slice(0, 2);
  };

  return (
    <Layout isLoggedIn={true} notificationCount={3}>
        <div className="community-post-detail">
        {/* 게시글 본문 섹션 */}
        <section className="post-section">
            <div className="post-container">
            {/* 카테고리 태그 */}
            <div className="post-category-tag">공구 후기</div>

            {/* 제목 */}
            <h1 className="post-title">지난주 사과 공동구매 정말 만족합니다!</h1>

            {/* 작성자 정보 */}
            <div className="post-author-info">
                <div className="author-profile" style={{ backgroundColor: '#ff5e2f' }}>
                <span className="author-initial">사과</span>
                </div>
                <div className="author-details">
                <div className="author-name">사과조아</div>
                <div className="author-meta">
                    2025년 9월 25일 • 서초동 • 조회 342
                </div>
                </div>
            </div>

            {/* 이미지 갤러리 */}
            <div className="post-images">
                <div className="post-image-item"></div>
                <div className="post-image-item"></div>
            </div>

            {/* 본문 내용 */}
            <div className="post-content">
                안녕하세요, 서초동 주민입니다!<br/><br/>

                지난주 김농부네 과수원 사과 공동구매에 참여했는데요,<br/>
                정말 만족스러워서 후기 남깁니다 😊<br/><br/>

                우선 사과 품질이 정말 최고였어요!<br/>
                한 박스에 10kg인데 크기도 균일하고 당도도 15브릭스 이상이라<br/>
                아이들이 너무 좋아했어요.<br/><br/>

                무엇보다 개별 구매할 때보다 30% 정도 저렴하게 구매할 수 있어서<br/>
                경제적으로도 큰 도움이 되었습니다.<br/><br/>

                판매자님도 친절하시고, 약속 장소에서 수령할 때도<br/>
                시간 맞춰 오셔서 편하게 받을 수 있었어요.<br/><br/>

                다음에도 과일 공동구매 있으면 꼭 참여하고 싶습니다!<br/>
                함께 사요 서비스 덕분에 이웃들과 좋은 물건을 저렴하게<br/>
                구매할 수 있어서 감사해요 👍
            </div>

            {/* 액션 버튼 섹션 */}
            <div className="post-actions">
                <button
                className={`action-btn ${liked ? 'liked' : ''}`}
                onClick={handleLike}
                >
                <span className="action-icon">❤️</span>
                <span className="action-text">좋아요 {likeCount}</span>
                </button>
                <button className="action-btn" onClick={handleShare}>
                <span className="action-icon">🔗</span>
                <span className="action-text">공유하기</span>
                </button>
                {isAuthor && (
                  <>
                    <button className="action-btn" onClick={handleEdit}>
                      <span className="action-icon">✏️</span>
                      <span className="action-text">수정</span>
                    </button>
                    <button className="action-btn action-btn-delete" onClick={handleDelete}>
                      <span className="action-icon">🗑️</span>
                      <span className="action-text">삭제</span>
                    </button>
                  </>
                )}
            </div>
            </div>
        </section>

        {/* 댓글 섹션 */}
        <section className="comments-section">
            <div className="comments-container">
            <h2 className="comments-title">댓글 {comments.length}개</h2>

            {/* 댓글 목록 */}
            <div className="comments-list">
                {comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                    <div className="comment-author-info">
                    <div 
                        className="comment-profile" 
                        style={{ backgroundColor: comment.profileColor || '#ff5e2f' }}
                    >
                        <span className="comment-initial">
                        {getInitials(comment.author)}
                        </span>
                    </div>
                    <div className="comment-meta">
                        <div className="comment-author">{comment.author}</div>
                        <div className="comment-time">
                        {comment.location} · {comment.time}
                        </div>
                    </div>
                    </div>
                    <div className="comment-content">{comment.content}</div>
                </div>
                ))}
            </div>

            {/* 댓글 입력 폼 */}
            <div className="comment-form">
                <input
                type="text"
                className="comment-input"
                placeholder="댓글을 입력하세요..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
                />
                <button 
                className="comment-submit-btn"
                onClick={handleCommentSubmit}
                >
                등록
                </button>
            </div>
            </div>
        </section>

        {/* 관련 게시글 섹션 */}
        <section className="related-posts-section">
            <div className="related-posts-container">
            <h2 className="related-posts-title">이런 글도 읽어보세요</h2>
            
            <div className="related-posts-list">
                {relatedPosts.map((post) => (
                <div key={post.id} className="related-post-item">
                    <h3 className="related-post-title">{post.title}</h3>
                    <p className="related-post-excerpt">{post.excerpt}</p>
                    <span className="related-post-info">
                    {post.author} • {post.timeAgo} • 조회 {post.views}
                    </span>
                </div>
                ))}
            </div>
            </div>
        </section>
        </div>
    </Layout>
  );
};

export default CommunityPostDetail;