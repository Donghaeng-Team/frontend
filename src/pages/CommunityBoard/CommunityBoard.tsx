import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { communityService } from '../../api/services/community';
import type { PostListResponse } from '../../types/community';
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
  const [activeCategory, setActiveCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(initialHasMore);

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
        const response = await communityService.getPosts({
          divisionCode: '11650',  // 서초구 코드 (임시)
          tag: 'all'
        });

        console.log('✅ Community API Response:', response);

        if (response.success && response.data && response.data.length > 0) {
          const convertedPosts = response.data.map(convertApiPostToPost);
          setPosts(convertedPosts);
        } else {
          console.warn('⚠️ API returned no data, using fallback mock data');
          setPosts(defaultPosts);
        }
      } catch (error) {
        console.error('❌ Failed to load posts from API:', error);
        console.warn('⚠️ Using fallback mock data');
        setPosts(defaultPosts);
      } finally {
        setLoading(false);
      }
    };

    loadInitialPosts();
  }, [initialPosts]);

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
        // 기본 더미 데이터 생성 (onLoadMore가 없을 때)
        setTimeout(() => {
          const newPosts = generateDummyPosts(page + 1);
          setPosts(prev => [...prev, ...newPosts]);
          setPage(prev => prev + 1);
          
          // 5페이지까지만 로드
          if (page >= 4) {
            setHasMore(false);
          }
        }, 1000);
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
  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    setPosts(initialPosts);
    setPage(1);
    setHasMore(true);
    onCategoryChange?.(category);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
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
              <div className="no-posts-message">게시글이 없습니다.</div>
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
                      👁 {post.viewCount}
                      {post.commentCount > 0 && ` • 💬 ${post.commentCount}`}
                      {post.likeCount && post.likeCount > 0 && ` • 👍 ${post.likeCount}`}
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
                  더 이상 게시글이 없습니다.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

// 더미 데이터 생성 함수
const generateDummyPosts = (page: number): Post[] => {
  const categories = ['동네 소식', '공구 후기', '질문 답변'];
  const locations = ['서초동', '방배동', '반포동', '양재동', '잠원동'];
  const authors = ['동네주민', '공구왕', '절약러', '알뜰이', '이웃사람'];
  
  return Array.from({ length: 5 }, (_, index) => {
    const id = `page${page}_post${index + 1}`;
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    return {
      id,
      category,
      title: `[${page}페이지] ${category} 관련 게시글입니다 #${index + 1}`,
      content: '안양의 거리와 무대가 춤으로 물드는 특별한 시간, 2025 안양춤축제에 여러분을 초대합니다. 청춘과 열정이...',
      author: authors[Math.floor(Math.random() * authors.length)],
      timeAgo: `${Math.floor(Math.random() * 24) + 1}시간 전`,
      location: locations[Math.floor(Math.random() * locations.length)],
      viewCount: Math.floor(Math.random() * 300) + 10,
      commentCount: Math.floor(Math.random() * 30),
      likeCount: Math.random() > 0.5 ? Math.floor(Math.random() * 50) : undefined,
      thumbnail: Math.random() > 0.7 ? '/placeholder-image.jpg' : undefined
    };
  });
};

// 기본 더미 데이터
const defaultPosts: Post[] = [
  {
    id: '1',
    category: '동네 소식',
    title: '서초동 맛집 추천해주세요!',
    content: '안양의 거리와 무대가 춤으로 물드는 특별한 시간, 2025 안양춤축제에 여러분을 초대합니다. 청춘과 열정이...',
    author: '맛집탐험가',
    timeAgo: '5시간 전',
    location: '서초4동',
    viewCount: 58,
    commentCount: 12
  },
  {
    id: '2',
    category: '공구 후기',
    title: '화장지 공동구매 완료! 정말 저렴하게 샀어요 😊',
    content: '안양의 거리와 무대가 춤으로 물드는 특별한 시간, 2025 안양춤축제에 여러분을 초대합니다. 청춘과 열정이...',
    author: '절약왕',
    timeAgo: '1일 전',
    location: '방배동',
    viewCount: 124,
    commentCount: 8,
    likeCount: 23
  },
  {
    id: '3',
    category: '질문 답변',
    title: '공동구매 참여 방법이 어떻게 되나요? 처음이라서요 ㅠㅠ',
    content: '안양의 거리와 무대가 춤으로 물드는 특별한 시간, 2025 안양춤축제에 여러분을 초대합니다. 청춘과 열정이...',
    author: '초보자',
    timeAgo: '3일 전',
    location: '서초동',
    viewCount: 89,
    commentCount: 15
  },
  {
    id: '4',
    category: '동네 소식',
    title: '우리 아파트에서도 공동구매 모임 만들어요!',
    content: '안양의 거리와 무대가 춤으로 물드는 특별한 시간, 2025 안양춤축제에 여러분을 초대합니다. 청춘과 열정이...',
    author: '동네대표',
    timeAgo: '2일 전',
    location: '반포동',
    viewCount: 156,
    commentCount: 22,
    likeCount: 31
  },
  {
    id: '5',
    category: '공구 후기',
    title: '기저귀 공동구매 덕분에 30만원 절약했어요!',
    content: '안양의 거리와 무대가 춤으로 물드는 특별한 시간, 2025 안양춤축제에 여러분을 초대합니다. 청춘과 열정이...',
    author: '육아맘',
    timeAgo: '4일 전',
    location: '양재동',
    viewCount: 267,
    commentCount: 34,
    likeCount: 89,
    thumbnail: '/placeholder-image.jpg'
  }
];

export default CommunityBoard;