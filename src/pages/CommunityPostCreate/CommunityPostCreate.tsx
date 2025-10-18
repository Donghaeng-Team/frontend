import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuthStore } from '../../stores/authStore';
import { useLocationStore } from '../../stores/locationStore';
import { communityService } from '../../api/services/community';
import { imageService } from '../../api/services/image';
import './CommunityPostCreate.css';

interface PostFormData {
  category: string;
  title: string;
  content: string;
  images: File[];
}

interface DraftData {
  category: string;
  title: string;
  content: string;
  savedAt: number;
}

const CommunityPostCreate: React.FC = () => {
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.user);
  const currentDivision = useLocationStore((state) => state.currentDivision);

  const [formData, setFormData] = useState<PostFormData>({
    category: 'local-news',
    title: '',
    content: '',
    images: []
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const hasPromptedRef = useRef(false); // 중복 알림 방지

  // 에러 상태 관리
  const [errors, setErrors] = useState<{
    title?: string;
    content?: string;
  }>({});

  const DRAFT_KEY = 'communityPostDraft';
  const AUTO_SAVE_DELAY = 2000; // 2초
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const categories = [
    { id: 'local-news', label: '동네 소식' },
    { id: 'group-review', label: '공구 후기' },
    { id: 'qna', label: '질문 답변' }
  ];

  // 필드별 검증 함수
  const validateField = (field: string, value: any): string | undefined => {
    switch (field) {
      case 'title':
        if (!value || value.trim() === '') {
          return '제목을 입력해주세요.';
        }
        if (value.length < 2) {
          return '제목은 최소 2자 이상 입력해주세요.';
        }
        break;
      case 'content':
        if (!value || value.trim() === '') {
          return '내용을 입력해주세요.';
        }
        if (value.length < 10) {
          return '내용은 최소 10자 이상 입력해주세요.';
        }
        break;
    }
    return undefined;
  };

  // 전체 폼 검증
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    newErrors.title = validateField('title', formData.title);
    newErrors.content = validateField('content', formData.content);

    setErrors(newErrors);

    // 에러가 하나라도 있으면 false 반환
    return !Object.values(newErrors).some(error => error !== undefined);
  };

  // 필드별 블러 이벤트 핸들러
  const handleBlur = (field: string, value: any) => {
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  // localStorage에 저장
  const saveDraft = () => {
    const draft: DraftData = {
      category: formData.category,
      title: formData.title,
      content: formData.content,
      savedAt: Date.now()
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    setLastSaved(new Date());
    setIsSaving(false);
  };

  // localStorage에서 불러오기
  const loadDraft = (): DraftData | null => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  };

  // localStorage 초기화
  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setLastSaved(null);
  };

  // 컴포넌트 마운트 시 임시 저장 데이터 복원
  useEffect(() => {
    // StrictMode에서 중복 실행 방지
    if (hasPromptedRef.current) return;

    const draft = loadDraft();
    if (draft && (draft.title || draft.content)) {
      hasPromptedRef.current = true; // 알림 표시 전에 먼저 설정

      const confirm = window.confirm(
        '이전에 작성하던 내용이 있습니다. 불러오시겠습니까?'
      );
      if (confirm) {
        setFormData(prev => ({
          ...prev,
          category: draft.category,
          title: draft.title,
          content: draft.content
        }));
        setLastSaved(new Date(draft.savedAt));
      } else {
        clearDraft();
      }
    }
  }, []);

  // 자동 저장 (디바운싱)
  useEffect(() => {
    // 제목이나 내용이 있을 때만 저장
    if (formData.title || formData.content) {
      setIsSaving(true);

      // 이전 타이머 취소
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // 새 타이머 설정
      saveTimeoutRef.current = setTimeout(() => {
        saveDraft();
      }, AUTO_SAVE_DELAY);
    }

    // cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formData.category, formData.title, formData.content]);

  const handleCategoryChange = (categoryId: string) => {
    setFormData(prev => ({ ...prev, category: categoryId }));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 100) {
      setFormData(prev => ({ ...prev, title: value }));
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 2000) {
      setFormData(prev => ({ ...prev, content: value }));
    }
  };

  // 이미지 파일 검증
  const validateImageFile = (file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return `${file.name}은(는) 지원하지 않는 파일 형식입니다. (JPG, PNG, GIF, WebP만 가능)`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}의 크기가 너무 큽니다. (최대 10MB)`;
    }
    return null;
  };

  // 이미지 처리 공통 로직
  const processImageFiles = (files: File[]) => {
    const totalImages = formData.images.length + files.length;

    if (totalImages > 10) {
      alert('최대 10장까지 업로드 가능합니다.');
      return;
    }

    // 파일 검증
    const validFiles: File[] = [];
    for (const file of files) {
      const error = validateImageFile(file);
      if (error) {
        alert(error);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // 새 이미지 추가
    const newImages = [...formData.images, ...validFiles.slice(0, 10 - formData.images.length)];
    setFormData(prev => ({ ...prev, images: newImages }));

    // 미리보기 생성
    const newPreviews: string[] = [];
    validFiles.slice(0, 10 - formData.images.length).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === validFiles.slice(0, 10 - formData.images.length).length) {
          setImagePreviews(prev => [...prev, ...newPreviews].slice(0, 10));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processImageFiles(files);
    // input 초기화 (같은 파일 다시 선택 가능하도록)
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // 드래그 앤 드롭 핸들러
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // dropZone을 완전히 벗어났을 때만 isDragging을 false로 설정
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (formData.images.length >= 10) {
      alert('최대 10장까지 업로드 가능합니다.');
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    processImageFiles(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 로그인 확인
    console.log('🔍 authUser:', authUser);
    console.log('🔍 authUser.userId:', authUser?.userId);
    console.log('🔍 localStorage user:', localStorage.getItem('user'));

    if (!authUser || !authUser.userId) {
      console.error('❌ 로그인 정보 없음 - authUser:', authUser);
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    // 전체 폼 검증
    if (!validateForm()) {
      alert('입력하신 내용을 다시 확인해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);

      // 카테고리 태그 변환
      const tagMap: { [key: string]: string } = {
        'local-news': 'general',
        'group-review': 'review',
        'qna': 'question'
      };

      // locationStore에서 현재 위치 가져오기 (CommunityBoard와 동일)
      let divisionCode = '11650540'; // 기본값: 서초구 8자리 divisionId
      
      if (currentDivision) {
        // locationStore에서 가져온 division 사용 (8자리 divisionId)
        divisionCode = currentDivision.id;
        console.log('📍 Post Create - Using 8-digit divisionId from locationStore:', divisionCode, currentDivision);
      } else {
        // fallback: localStorage에서 가져오기
        const selectedLocationStr = localStorage.getItem('selectedLocation');
        if (selectedLocationStr) {
          try {
            const selectedLocation = JSON.parse(selectedLocationStr);
            if (selectedLocation && selectedLocation.id) {
              divisionCode = selectedLocation.id;
            }
          } catch (error) {
            console.error('Failed to parse selected location:', error);
          }
        }
        console.log('📍 Post Create - Using 8-digit divisionId from localStorage:', divisionCode);
      }

      // communityService.createPostWithImages 사용
      const postId = await communityService.createPostWithImages(
        authUser.userId,
        {
          region: divisionCode,
          tag: tagMap[formData.category] || 'general',
          title: formData.title,
          content: formData.content,
        },
        formData.images
      );

      // 성공 시 임시 저장 데이터 삭제
      clearDraft();

      console.log('✅ 게시글 생성 성공, postId:', postId);
      alert('게시글이 성공적으로 등록되었습니다!');
      navigate(`/community/${postId}`);
    } catch (error) {
      console.error('게시글 등록 실패:', error);
      alert('게시글 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // 취소 확인 후 이전 페이지로 이동
    if (window.confirm('작성 중인 내용이 사라집니다. 정말 취소하시겠습니까?')) {
      clearDraft();
      window.history.back();
    }
  };

  // 마지막 저장 시간 표시
  const getLastSavedText = () => {
    if (!lastSaved) return '';

    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);

    if (diff < 60) return '방금 전 저장됨';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전 저장됨`;
    return `${Math.floor(diff / 3600)}시간 전 저장됨`;
  };

  // 수동 저장
  const handleManualSave = () => {
    if (!formData.title && !formData.content) {
      alert('저장할 내용이 없습니다.');
      return;
    }

    // 자동 저장 타이머 취소
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // 즉시 저장
    saveDraft();
    alert('임시 저장되었습니다.');
  };

  return (
    <Layout isLoggedIn={true} notificationCount={3}>
        <div className="community-post-create">
        <div className="page-container">
            <div className="page-header">
              <h1 className="page-title">✏️ 게시글 작성</h1>
              {lastSaved && (
                <div className="auto-save-status">
                  {isSaving ? '저장 중...' : `✓ ${getLastSavedText()}`}
                </div>
              )}
            </div>

            <form className="post-form" onSubmit={handleSubmit}>
            <div className="form-section">
                <label className="form-label">
                카테고리 <span className="required">*</span>
                </label>
                <div className="category-tabs">
                {categories.map(category => (
                    <button
                    key={category.id}
                    type="button"
                    className={`category-tab ${formData.category === category.id ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(category.id)}
                    >
                    {category.label}
                    </button>
                ))}
                </div>
            </div>

            <div className="form-section">
                <label htmlFor="title" className="form-label">
                제목 <span className="required">*</span>
                </label>
                <input
                id="title"
                type="text"
                className={`form-input ${errors.title ? 'error' : ''}`}
                placeholder="제목을 입력하세요 (최소 2자, 최대 100자)"
                value={formData.title}
                onChange={handleTitleChange}
                onBlur={() => handleBlur('title', formData.title)}
                maxLength={100}
                />
                <div className="input-count">{formData.title.length}/100</div>
                {errors.title && <div className="error-message">{errors.title}</div>}
            </div>

            <div className="form-section">
                <label htmlFor="content" className="form-label">
                내용 <span className="required">*</span>
                </label>
                <textarea
                id="content"
                className={`form-textarea ${errors.content ? 'error' : ''}`}
                placeholder="내용을 입력하세요 (최소 10자, 최대 2000자)"
                value={formData.content}
                onChange={handleContentChange}
                onBlur={() => handleBlur('content', formData.content)}
                maxLength={2000}
                />
                <div className="input-count">{formData.content.length}/2000</div>
                {errors.content && <div className="error-message">{errors.content}</div>}
            </div>

            <div className="form-section">
                <div className="form-label-wrapper">
                <label className="form-label">사진 첨부</label>
                <span className="form-hint">최대 10장까지 업로드 가능 (JPG, PNG, GIF, WebP)</span>
                </div>
                <div
                  ref={dropZoneRef}
                  className={`image-upload-area ${isDragging ? 'dragging' : ''}`}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => formData.images.length < 10 && fileInputRef.current?.click()}
                  style={{ cursor: formData.images.length < 10 ? 'pointer' : 'default' }}
                >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    multiple
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                />

                {isDragging && (
                  <div className="drag-overlay">
                    <div className="drag-message">
                      📸 이미지를 여기에 드롭하세요
                    </div>
                  </div>
                )}

                {formData.images.length === 0 ? (
                  <div className="upload-prompt">
                    <span className="upload-icon">📷</span>
                    <div className="upload-text-group">
                      <span className="upload-text">여기로 이미지를 드래그하거나 </span>
                      <span className="upload-link">파일을 업로드</span>
                      <span className="upload-text"> 하세요.</span>
                    </div>
                    <div className="upload-info">
                      <span className="image-count">0/10</span>
                      <span className="thumbnail-hint">💡 첫 번째 이미지가 썸네일로 사용됩니다</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="image-preview">
                        <img src={preview} alt={`Preview ${index + 1}`} />
                        {index === 0 && (
                          <div className="thumbnail-badge">
                            썸네일
                          </div>
                        )}
                        <button
                          type="button"
                          className="image-remove-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(index);
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {formData.images.length < 10 && (
                      <div className="upload-more-hint">
                        <span className="plus-icon">+</span>
                        <span className="image-count">{formData.images.length}/10</span>
                      </div>
                    )}
                  </>
                )}
                </div>
            </div>

            <div className="form-actions">
                <button
                type="button"
                className="btn btn-cancel"
                onClick={handleCancel}
                >
                취소
                </button>
                <button
                  type="button"
                  className="btn btn-save"
                  onClick={handleManualSave}
                >
                  임시저장
                </button>
                <button
                type="submit"
                className="btn btn-submit"
                disabled={isSubmitting}
                >
                {isSubmitting ? '등록 중...' : '등록'}
                </button>
            </div>
            </form>
        </div>
        </div>
    </Layout>
  );
};

export default CommunityPostCreate;