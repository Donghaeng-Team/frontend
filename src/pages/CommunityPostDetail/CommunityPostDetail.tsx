import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuthStore } from '../../stores/authStore';
import { communityService } from '../../api/services/community';
import type { PostDetailResponse } from '../../types/community';
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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<PostDetailResponse | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
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

  // 게시글 데이터 로드
  useEffect(() => {
    const loadPost = async () => {
      if (!id) {
        alert('게시글 ID가 없습니다.');
        navigate('/community');
        return;
      }

      try {
        setLoading(true);
        const response = await communityService.getPost(parseInt(id, 10));

        console.log('✅ Community Post Detail API Response:', response);

        if (!response.success || !response.data) {
          throw new Error('게시글을 찾을 수 없습니다.');
        }

        setPost(response.data);
        setLikeCount(response.data.likeCount);
      } catch (error: any) {
        console.error('❌ 게시글 로드 실패:', error);
        console.warn('⚠️ Using fallback mock post data');

        // Fallback: mock 데이터 사용
        const mockPost: PostDetailResponse = {
          postId: parseInt(id || '1', 10),
          title: '김농부 유기농 사과 10kg 공동구매 후기 - 샘플 게시글',
          content: '이번에 참여한 유기농 사과 공동구매 정말 만족스러웠어요!\n\n이 게시글은 API 연동 전 샘플 데이터입니다.\n실제 게시글을 등록하시면 이 데이터 대신 표시됩니다.',
          region: '서초구',
          tag: 'review',
          authorId: 999,
          imageUrls: [],
          thumbnailUrl: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          likeCount: 24,
          commentCount: 3,
          viewCount: 128
        };
        setPost(mockPost);
        setLikeCount(mockPost.likeCount);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id, navigate]);

  // 작성자 여부 확인
  const isAuthor = authUser && post && post.authorId === authUser.userId;

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
    if (post) {
      navigate(`/community/${post.postId}/edit`);
    }
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

  const getCategoryName = (tag: string) => {
    switch (tag) {
      case 'general': return '동네 소식';
      case 'review': return '공구 후기';
      case 'question': return '질문 답변';
      default: return '기타';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // 로딩 중
  if (loading) {
    return (
      <Layout isLoggedIn={true} notificationCount={3}>
        <div className="community-post-detail">
          <div style={{ textAlign: 'center', padding: '100px 20px', fontSize: '18px', color: '#666' }}>
            게시글을 불러오는 중...
          </div>
        </div>
      </Layout>
    );
  }

  // 게시글 없음
  if (!post) {
    return (
      <Layout isLoggedIn={true} notificationCount={3}>
        <div className="community-post-detail">
          <div style={{ textAlign: 'center', padding: '100px 20px', fontSize: '18px', color: '#666' }}>
            게시글을 찾을 수 없습니다.
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout isLoggedIn={true} notificationCount={3}>
        <div className="community-post-detail">
        {/* 게시글 본문 섹션 */}
        <section className="post-section">
            <div className="post-container">
            {/* 카테고리 태그 */}
            <div className="post-category-tag">{getCategoryName(post.tag)}</div>

            {/* 제목 */}
            <h1 className="post-title">{post.title}</h1>

            {/* 작성자 정보 */}
            <div className="post-author-info">
                <div className="author-profile" style={{ backgroundColor: '#ff5e2f' }}>
                <span className="author-initial">익명</span>
                </div>
                <div className="author-details">
                <div className="author-name">익명</div>
                <div className="author-meta">
                    {formatDate(post.createdAt)} • {post.region} • 조회 {post.viewCount}
                </div>
                </div>
            </div>

            {/* 이미지 갤러리 */}
            {post.imageUrls && post.imageUrls.length > 0 && (
              <div className="post-images">
                {post.imageUrls.map((url, index) => (
                  <div key={index} className="post-image-item">
                    <img src={url} alt={`게시글 이미지 ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}

            {/* 본문 내용 */}
            <div className="post-content">
              {post.content.split('\n').map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  {index < post.content.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
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
            <h2 className="comments-title">댓글 {post.commentCount}개</h2>

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