import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuthStore } from '../../stores/authStore';
import { communityService } from '../../api/services/community';
import { commentService } from '../../api/services/comment';
import type { PostDetailResponse } from '../../types/community';
import type { CommentResponse } from '../../types/comment';
import './CommunityPostDetail.css';

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
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [allComments, setAllComments] = useState<CommentResponse[]>([]);
  const [displayedCommentsCount, setDisplayedCommentsCount] = useState(10);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);

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
        // 500 에러는 백엔드 이슈이므로 조용히 처리 (BACKEND_HANDOFF.md 참조)
        if (error.response?.status === 500) {
          console.warn('⚠️ 게시글 상세 조회 500 에러 (백엔드 수정 대기 중)');
          // 목록 페이지로 부드럽게 리다이렉트
          setTimeout(() => navigate('/community'), 100);
        } else {
          console.error('❌ 게시글 로드 실패:', error);
          alert('게시글을 불러올 수 없습니다.');
          navigate('/community');
        }
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id, navigate]);

  // 작성자 여부 확인
  const isAuthor = authUser && post && post.authorId === authUser.userId;

  // 디버깅: 작성자 여부 확인
  useEffect(() => {
    if (post && authUser) {
      console.log('🔍 작성자 확인:', {
        postAuthorId: post.authorId,
        currentUserId: authUser.userId,
        isAuthor: post.authorId === authUser.userId
      });
    }
  }, [post, authUser]);

  // 댓글 데이터 로드
  useEffect(() => {
    const loadComments = async () => {
      if (!id) return;

      try {
        setCommentsLoading(true);
        const response = await commentService.getComments(parseInt(id, 10));

        console.log('✅ Comments API Response:', response);

        if (response.success && response.data) {
          setAllComments(response.data);
          setComments(response.data.slice(0, 10));
        }
      } catch (error) {
        console.error('❌ 댓글 로드 실패:', error);
        setAllComments([]);
        setComments([]);
      } finally {
        setCommentsLoading(false);
      }
    };

    if (post) {
      loadComments();
    }
  }, [id, post]);

  // 관련 게시글 데이터 로드
  useEffect(() => {
    const loadRelatedPosts = async () => {
      if (!post) return;

      try {
        // post.region에 8자리 divisionId가 들어있음
        const divisionCode = post.region || '11650540';
        
        console.log('📍 Related Posts - Using 8-digit divisionId from post.region:', divisionCode);

        const response = await communityService.getPosts({
          divisionCode: divisionCode,
          tag: post.tag === 'all' ? undefined : post.tag
        });

        console.log('✅ Related Posts API Response:', response);

        if (response.success && response.data) {
          // 현재 게시글 제외하고 최대 3개
          const related = response.data
            .filter(p => p.postId !== post.postId)
            .slice(0, 3)
            .map(p => ({
              id: p.postId,
              title: p.title,
              excerpt: p.previewContent || p.title,
              author: '작성자',
              timeAgo: getTimeAgo(p.createdAt),
              views: p.viewCount
            }));
          setRelatedPosts(related);
        }
      } catch (error) {
        console.error('❌ 관련 게시글 로드 실패:', error);
        setRelatedPosts([]);
      }
    };

    loadRelatedPosts();
  }, [post]);



  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || !authUser || !authUser.userId || !post) return;

    try {
      const response = await commentService.createComment(post.postId, {
        postId: post.postId,
        userId: authUser.userId,
        content: commentText,
      });

      if (response.success && response.data) {
        // 댓글 목록 새로고침
        const updatedComments = await commentService.getComments(post.postId);
        if (updatedComments.success && updatedComments.data) {
          setAllComments(updatedComments.data);
          setComments(updatedComments.data.slice(0, displayedCommentsCount));
        }
        setCommentText('');
      }
    } catch (error) {
      console.error('❌ 댓글 작성 실패:', error);
      alert('댓글 작성에 실패했습니다.');
    }
  };

  const handleCommentDelete = async (commentId: number) => {
    if (!authUser || !authUser.userId) return;

    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;

    try {
      await commentService.deleteComment({
        commentId,
        authorId: authUser.userId,
      });

      // 댓글 목록 새로고침
      if (post) {
        const updatedComments = await commentService.getComments(post.postId);
        if (updatedComments.success && updatedComments.data) {
          setAllComments(updatedComments.data);
          setComments(updatedComments.data.slice(0, displayedCommentsCount));
        }
      }
    } catch (error) {
      console.error('❌ 댓글 삭제 실패:', error);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  const handleLoadMoreComments = () => {
    const newCount = displayedCommentsCount + 10;
    setDisplayedCommentsCount(newCount);
    setComments(allComments.slice(0, newCount));
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

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '익명';
    return name.slice(0, 2);
  };

  const getTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
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
            {/* 상단 액션 바 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              {/* 뒤로가기 버튼 */}
              <button
                onClick={() => navigate('/community')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  border: '1px solid #e6e6e6',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  color: '#666666',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                  e.currentTarget.style.borderColor = '#cccccc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.borderColor = '#e6e6e6';
                }}
              >
                ← 목록으로
              </button>

              {/* 수정/삭제 버튼 */}
              {isAuthor && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleEdit}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      border: '1px solid #e6e6e6',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      color: '#666666',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f5f5f5';
                      e.currentTarget.style.borderColor = '#cccccc';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.borderColor = '#e6e6e6';
                    }}
                  >
                    ✏️ 수정
                  </button>
                  <button
                    onClick={handleDelete}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      border: '1px solid #ffcccc',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      color: '#ff5e2f',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#fff5f0';
                      e.currentTarget.style.borderColor = '#ff5e2f';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.borderColor = '#ffcccc';
                    }}
                  >
                    🗑️ 삭제
                  </button>
                </div>
              )}
            </div>

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
            </div>
            </div>
        </section>

        {/* 댓글 섹션 */}
        <section className="comments-section">
            <div className="comments-container">
            <h2 className="comments-title">댓글 {allComments.length}개</h2>

            {/* 댓글 목록 */}
            {commentsLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                댓글을 불러오는 중...
              </div>
            ) : comments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                첫 댓글을 작성해보세요!
              </div>
            ) : (
              <>
                <div className="comments-list">
                  {comments.map((comment) => {
                    const displayName = comment.userName || (comment.userId === authUser?.userId ? authUser?.nickName : '익명');
                    return (
                      <div key={comment.commentId} className="comment-item">
                        <div className="comment-author-info">
                          <div
                            className="comment-profile"
                            style={{ backgroundColor: '#ff5e2f' }}
                          >
                            <span className="comment-initial">
                              {getInitials(displayName)}
                            </span>
                          </div>
                          <div className="comment-meta">
                            <div className="comment-author">{displayName}</div>
                            <div className="comment-time">
                              {getTimeAgo(comment.createdAt)}
                            </div>
                          </div>
                          {authUser && comment.userId === authUser.userId && (
                            <button
                              onClick={() => handleCommentDelete(comment.commentId)}
                              style={{
                                marginLeft: 'auto',
                                padding: '4px 12px',
                                fontSize: '12px',
                                color: '#ff5e2f',
                                backgroundColor: 'transparent',
                                border: '1px solid #ff5e2f',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#fff5f0';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              삭제
                            </button>
                          )}
                        </div>
                        <div className="comment-content">{comment.content}</div>
                      </div>
                    );
                  })}
                </div>

                {/* 더보기 버튼 */}
                {allComments.length > comments.length && (
                  <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button
                      onClick={handleLoadMoreComments}
                      style={{
                        padding: '12px 24px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#666',
                        backgroundColor: '#f5f5f5',
                        border: '1px solid #e6e6e6',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#eeeeee';
                        e.currentTarget.style.borderColor = '#cccccc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                        e.currentTarget.style.borderColor = '#e6e6e6';
                      }}
                    >
                      댓글 더보기 ({allComments.length - comments.length}개 남음)
                    </button>
                  </div>
                )}
              </>
            )}

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
                <div
                  key={post.id}
                  className="related-post-item"
                  onClick={() => navigate(`/community/${post.id}`)}
                >
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