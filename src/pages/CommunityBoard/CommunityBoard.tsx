import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import MobileHeader from '../../components/MobileHeader';
import { communityService } from '../../api/services/community';
import type { PostListResponse } from '../../types/community';
import { APP_CONSTANTS } from '../../utils/constants';
import { useLocationStore } from '../../stores/locationStore';
import './CommunityBoard.css';

export interface Post {
  id: string;
  category: string;
  categoryColor?: string;
  title: string;
  content: string;
  author: string;
  timeAgo: string;
  location: string;
  viewCount: number;
  commentCount: number;
  likeCount?: number;
  thumbnail?: string;
}

interface CommunityBoardProps {
  posts?: Post[];
  onSearch?: (query: string) => void;
  onWriteClick?: () => void;
  onCategoryChange?: (category: string) => void;
  onPostClick?: (postId: string) => void;
  onLoadMore?: (page: number) => Promise<Post[]>;
  hasMore?: boolean;
  isLoggedIn?: boolean;
  notificationCount?: number;
}

const CommunityBoard: React.FC<CommunityBoardProps> = ({
  posts: initialPosts,
  onSearch,
  onWriteClick,
  onCategoryChange,
  onPostClick,
  onLoadMore,
  hasMore: initialHasMore = true,
  isLoggedIn = true,
  notificationCount = 3
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentDivision = useLocationStore((state) => state.currentDivision);
  const [activeCategory, setActiveCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [divisionCode, setDivisionCode] = useState<string>('11650'); // 기본값: 서초구

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const categories = ['전체', '동네 소식', '공구 후기', '질문 답변'];

  // 태그 매핑
  const getCategoryTag = (category: string): string => {
    switch (category) {
      case '동네 소식': return 'general';
      case '공구 후기': return 'review';
      case '질문 답변': return 'question';
      default: return 'all';
    }
  };

  // API 응답을 Post 형식으로 변환
  const convertApiPostToPost = (apiPost: PostListResponse): Post => {
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

    return {
      id: apiPost.postId.toString(),
      category: apiPost.tag === 'general' ? '동네 소식' :
                apiPost.tag === 'review' ? '공구 후기' :
                apiPost.tag === 'question' ? '질문 답변' : '기타',
      title: apiPost.title,
      content: apiPost.previewContent,
      author: '익명',  // API에 작성자 정보가 없으므로
      timeAgo: getTimeAgo(apiPost.createdAt),
      location: apiPost.region,
      viewCount: apiPost.viewCount,
      commentCount: apiPost.commentCount,
      likeCount: apiPost.likeCount,
      thumbnail: apiPost.thumbnailUrl || undefined
    };
  };

  // 초기 데이터 로드
  useEffect(() => {
    const loadInitialPosts = async () => {
      // initialPosts가 제공된 경우 API 호출하지 않음
      if (initialPosts && initialPosts.length > 0) {
        setPosts(initialPosts);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // locationStore의 currentDivision 사용 (실시간 업데이트)
        let currentDivisionCode = '11650540'; // 기본값: 서초구 8자리 divisionId
        
        if (currentDivision) {
          // locationStore에서 가져온 division 사용 (8자리 divisionId)
          currentDivisionCode = currentDivision.id;
          console.log('📍 Using 8-digit divisionId from locationStore:', currentDivisionCode, currentDivision);
        } else {
          // fallback: localStorage에서 가져오기
          const selectedLocationStr = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.SELECTED_LOCATION);
          if (selectedLocationStr) {
            try {
              const selectedLocation = JSON.parse(selectedLocationStr);
              if (selectedLocation && selectedLocation.id) {
                // 8자리 divisionId 사용 (ex: "11010540")
                currentDivisionCode = selectedLocation.id;
              }
            } catch (error) {
              console.error('Failed to parse selected location:', error);
            }
          }
          console.log('📍 Using 8-digit divisionId from localStorage:', currentDivisionCode);
        }
        
        setDivisionCode(currentDivisionCode);
        
        const response = await communityService.getPosts({
          divisionCode: currentDivisionCode,
          tag: 'all',
          ...(searchQuery.trim() && { keyword: searchQuery.trim() })
        });

        console.log('✅ Community API Response:', response);

        if (response.success && response.data && response.data.length > 0) {
          const convertedPosts = response.data.map(convertApiPostToPost);
          setPosts(convertedPosts);
        } else {
          console.warn('⚠️ API returned no data');
          setPosts([]);
        }
      } catch (error: any) {
        console.error('❌ Failed to load posts from API:', error);

        // 타임아웃이나 연결 오류는 빈 데이터로 처리 (에러 표시 안 함)
        if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
          console.warn('⚠️ Backend server timeout or not running - showing empty list');
          setPosts([]);
        } else {
          // 다른 에러는 빈 데이터 표시
          setPosts([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadInitialPosts();
  }, [initialPosts, currentDivision, searchQuery]);

  // 더 많은 게시글 로드
  const loadMorePosts = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    
    try {
      if (onLoadMore) {
        const newPosts = await onLoadMore(page + 1);
        if (newPosts.length === 0) {
          setHasMore(false);
        } else {
          setPosts(prev => [...prev, ...newPosts]);
          setPage(prev => prev + 1);
        }
      } else {
        // onLoadMore가 없을 때는 더 이상 로드하지 않음
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to load more posts:', error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, onLoadMore]);

  // Intersection Observer 설정
  useEffect(() => {
    if (!loadMoreRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMorePosts();
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1
      }
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMorePosts, hasMore, loading]);

  // 카테고리 변경 시 포스트 초기화
  const handleCategoryClick = async (category: string) => {
    setActiveCategory(category);
    setPage(1);
    setHasMore(true);
    onCategoryChange?.(category);

    // 카테고리별 API 호출
    try {
      setLoading(true);
      const tag = getCategoryTag(category);
      const response = await communityService.getPosts({
        divisionCode: divisionCode,
        tag: tag,
        ...(searchQuery.trim() && { keyword: searchQuery.trim() })
      });

      console.log(`✅ Category ${category} API Response:`, response);

      if (response.success && response.data && response.data.length > 0) {
        const convertedPosts = response.data.map(convertApiPostToPost);
        setPosts(convertedPosts);
      } else {
        console.warn('⚠️ No API data for category:', category);
        setPosts([]);
      }
    } catch (error) {
      console.error('❌ Failed to load posts by category:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // URL 파라미터 업데이트
      navigate(`/community?search=${encodeURIComponent(searchQuery)}`);
    }
    onSearch?.(searchQuery);
  };

  const handleWriteClick = () => {
    if (onWriteClick) {
      onWriteClick();
    } else {
      navigate('/community/create');
    }
  };

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case '동네 소식':
        return { backgroundColor: '#fff2f2', color: '#ff5e2f' };
      case '공구 후기':
        return { backgroundColor: '#ededfa', color: '#ff5e2f' };
      case '질문 답변':
        return { backgroundColor: '#edfaed', color: '#339933' };
      default:
        return { backgroundColor: '#f2f2f2', color: '#666666' };
    }
  };

  return (
    <>
      <MobileHeader />
      <Layout isLoggedIn={isLoggedIn} notificationCount={notificationCount}>
      <div className="community-board">
        {/* 배너 섹션 */}
        <section className="community-banner">
          <div className="banner-content">
            <h1 className="banner-title">🏘️ 우리 동네 소식</h1>
            <p className="banner-subtitle">
              동네 이웃들과 공동구매 정보와 일상을 나누어요
            </p>
          </div>
        </section>

        {/* 툴바 섹션 */}
        <section className="community-toolbar">
          <div className="toolbar-container">
            <div className="category-tabs">
              {categories.map(category => (
                <button
                  key={category}
                  className={`category-tab ${activeCategory === category ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            
            <div className="toolbar-actions">
              <form className="search-form" onSubmit={handleSearch}>
                <input
                  type="text"
                  className="search-input"
                  placeholder="🔍 게시글 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
              <button className="write-button" onClick={handleWriteClick}>
                ✏️ 글쓰기
              </button>
            </div>
          </div>
        </section>

        {/* 게시글 목록 */}
        <section className="posts-section">
          <div className="posts-container">
            {loading && posts.length === 0 ? (
              <div className="loading-message">게시글을 불러오는 중...</div>
) : posts.length === 0 ? (
              <div className="empty-state">
                    <div className="empty-icon">🔍</div>
                    <h3 className="empty-title">
                      {searchQuery.trim() ? '검색 결과가 없어요' : '아직 게시글이 없어요'}
                    </h3>
                    <p className="empty-description">
                      {searchQuery.trim() 
                        ? '다른 검색어로 시도해보세요.'
                        : '우리 동네의 첫 번째 이야기를 남겨보세요!'
                      }
                    </p>
                    {!searchQuery.trim() && (
                      <button className="empty-action-button" onClick={handleWriteClick}>
                        ✏️ 첫 글 작성하기
                      </button>
                    )}
              </div>
            ) : posts.map(post => (
              <article
                key={post.id}
                className="post-item"
                onClick={() => {
                  if (onPostClick) {
                    onPostClick(post.id);
                  } else {
                    navigate(`/community/${post.id}`);
                  }
                }}
              >
                <div className="post-content">
                  <div className="post-header">
                    <span
                      className="post-category"
                      style={getCategoryStyle(post.category)}
                    >
                      {post.category}
                    </span>
                    <h3 className="post-title">{post.title}</h3>
                  </div>
                  
                  <p className="post-excerpt">{post.content}</p>
                  
                  <div className="post-meta">
                    <div className="post-author">
                      {post.author} • {post.timeAgo} • {post.location}
                    </div>
                    <div className="post-stats">
                      👁 {post.viewCount} • 💬 {post.commentCount} • ❤️ {post.likeCount ?? 0}
                    </div>
                  </div>
                </div>
                
                {post.thumbnail && (
                  <div className="post-thumbnail">
                    <img src={post.thumbnail} alt="" />
                  </div>
                )}
              </article>
            ))}
            
            {/* 로딩 인디케이터 / 무한 스크롤 트리거 */}
            <div ref={loadMoreRef} className="load-more-trigger">
              {loading && (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <span className="loading-text">게시글 불러오는 중...</span>
                </div>
              )}
              {!hasMore && posts.length > 0 && (
                <div className="no-more-posts">
                  <div className="no-more-icon">📚</div>
                  <p className="no-more-text">모든 게시글을 확인하셨어요!</p>
                  <div className="no-more-divider">• • •</div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </Layout>
    </>
  );
};

export default CommunityBoard;