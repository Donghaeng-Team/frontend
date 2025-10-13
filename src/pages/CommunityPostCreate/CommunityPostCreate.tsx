import React, { useState, useRef, useEffect } from 'react';
import Layout from '../../components/Layout';
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
  const [formData, setFormData] = useState<PostFormData>({
    category: 'local-news',
    title: '',
    content: '',
    images: []
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const hasPromptedRef = useRef(false); // 중복 알림 방지

  const DRAFT_KEY = 'communityPostDraft';
  const AUTO_SAVE_DELAY = 2000; // 2초
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const categories = [
    { id: 'local-news', label: '동네 소식' },
    { id: 'group-review', label: '공구 후기' },
    { id: 'qna', label: '질문 답변' }
  ];

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 필수 필드 검증
    if (!formData.category || !formData.title || !formData.content) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    // API 호출 또는 상태 관리 로직
    console.log('Submitting:', formData);

    // 성공 시 임시 저장 데이터 삭제
    clearDraft();

    // 성공 시 페이지 이동 등 처리
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
                className="form-input"
                placeholder="제목을 입력하세요 (최대 100자)"
                value={formData.title}
                onChange={handleTitleChange}
                maxLength={100}
                required
                />
                <div className="input-count">{formData.title.length}/100</div>
            </div>

            <div className="form-section">
                <label htmlFor="content" className="form-label">
                내용 <span className="required">*</span>
                </label>
                <textarea
                id="content"
                className="form-textarea"
                placeholder="내용을 입력하세요 (최대 2000자)"
                value={formData.content}
                onChange={handleContentChange}
                maxLength={2000}
                required
                />
                <div className="input-count">{formData.content.length}/2000</div>
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

                <button
                    type="button"
                    className="image-add-button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={formData.images.length >= 10}
                >
                    <span className="camera-icon">📷</span>
                    <span className="image-count">{formData.images.length}/10</span>
                </button>

                {imagePreviews.map((preview, index) => (
                    <div key={index} className="image-preview">
                    <img src={preview} alt={`Preview ${index + 1}`} />
                    <button
                        type="button"
                        className="image-remove-button"
                        onClick={() => handleRemoveImage(index)}
                    >
                        ×
                    </button>
                    </div>
                ))}

                {formData.images.length === 0 && !isDragging && (
                  <div className="drop-hint">
                    또는 이미지를 드래그하여 업로드
                  </div>
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
                  💾 임시저장
                </button>
                <button
                type="submit"
                className="btn btn-submit"
                >
                등록
                </button>
            </div>
            </form>
        </div>
        </div>
    </Layout>
  );
};

export default CommunityPostCreate;