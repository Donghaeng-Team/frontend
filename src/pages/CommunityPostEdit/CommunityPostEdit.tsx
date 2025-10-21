import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { communityService } from '../../api/services/community';
import { imageService } from '../../api/services/image';
import { useAuthStore } from '../../stores/authStore';
import type {
  PostDetailResponse,
  PostUpdateRequest,
  ImageMeta,
} from '../../types/community';
import './CommunityPostEdit.css';

const CommunityPostEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<PostDetailResponse | null>(null);

  const [formData, setFormData] = useState({
    category: 'local-news',
    title: '',
    content: '',
    region: ''
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // 에러 상태 관리
  const [errors, setErrors] = useState<{
    title?: string;
    content?: string;
  }>({});

  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const categories = [
    { id: 'local-news', label: '동네 소식' },
    { id: 'group-review', label: '공구 후기' },
    { id: 'qna', label: '질문 답변' }
  ];

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
        const postId = parseInt(id, 10);
        const response = await communityService.getPost(postId);

        if (!response.success || !response.data) {
          throw new Error('게시글을 찾을 수 없습니다.');
        }

        const postData = response.data;

        // 작성자 확인
        if (postData.authorId !== authUser?.userId) {
          alert('수정 권한이 없습니다.');
          navigate(`/community/${id}`);
          return;
        }

        setPost(postData);

        // 폼 데이터 설정
        setFormData({
          category: postData.tag,
          title: postData.title,
          content: postData.content,
          region: postData.region
        });

        setExistingImageUrls(postData.imageUrls);
        setImagePreviews(postData.imageUrls);

      } catch (error: any) {
        console.error('게시글 로드 실패:', error);
        alert(error.message || '게시글 정보를 불러오는데 실패했습니다.');
        navigate('/community');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id, navigate, authUser]);

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
    const totalImages = existingImageUrls.length + images.length + files.length;

    if (totalImages > 10) {
      alert('최대 10장까지 업로드 가능합니다.');
      return;
    }

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

    const newImages = [...images, ...validFiles.slice(0, 10 - existingImageUrls.length - images.length)];
    setImages(newImages);

    const newPreviews: string[] = [];
    validFiles.slice(0, 10 - existingImageUrls.length - images.length).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === validFiles.slice(0, 10 - existingImageUrls.length - images.length).length) {
          setImagePreviews(prev => [...prev, ...newPreviews].slice(0, 10));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processImageFiles(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    if (index < existingImageUrls.length) {
      // 기존 이미지 삭제
      setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
    } else {
      // 새로 추가한 이미지 삭제
      const newImageIndex = index - existingImageUrls.length;
      setImages(prev => prev.filter((_, i) => i !== newImageIndex));
    }
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
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

    if (existingImageUrls.length + images.length >= 10) {
      alert('최대 10장까지 업로드 가능합니다.');
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    processImageFiles(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      alert('입력하신 내용을 다시 확인해주세요.');
      return;
    }

    if (!id || !authUser?.userId) {
      alert('게시글 ID 또는 사용자 정보가 없습니다.');
      return;
    }

    setIsSaving(true);

    try {
      const postId = parseInt(id, 10);
      let imageRegisters: ImageMeta[] = [];

      // 새로운 이미지가 있으면 S3에 업로드
      if (images.length > 0) {
        const uploadResults = await imageService.uploadMultipleImages(
          authUser.userId,
          postId,
          images
        );

        // 업로드 성공한 이미지만 필터링
        const successUploads = uploadResults.filter(result => result.success);

        if (successUploads.length !== images.length) {
          throw new Error('일부 이미지 업로드에 실패했습니다.');
        }

        // S3 키를 ImageMeta 형식으로 변환
        imageRegisters = successUploads.map((result, index) => ({
          s3Key: result.s3Key,
          order: existingImageUrls.length + index,
          caption: '',
          isThumbnail: index === 0,
          contentType: result.file.type,
          size: result.file.size
        }));
      }

      // 게시글 수정 API 호출
      const updateData: PostUpdateRequest = {
        region: formData.region,
        tag: formData.category,
        title: formData.title,
        content: formData.content,
      };

      // 새 이미지가 있으면 추가
      if (imageRegisters.length > 0) {
        updateData.images = imageRegisters;
      }

      const response = await communityService.updatePost(
        authUser.userId,
        postId,
        updateData
      );

      if (!response.success) {
        throw new Error('게시글 수정에 실패했습니다.');
      }

      alert('게시글이 성공적으로 수정되었습니다!');
      navigate(`/community/${id}`);
    } catch (error: any) {
      console.error('게시글 수정 실패:', error);
      alert(error.message || '게시글 수정에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('수정을 취소하시겠습니까?')) {
      navigate(`/community/${id}`);
    }
  };

  if (loading) {
    return (
      <Layout isLoggedIn={true} notificationCount={3}>
        <div className="community-post-edit">
          <div className="page-container">
            <div className="loading-message">게시글 정보를 불러오는 중...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout isLoggedIn={true} notificationCount={3}>
      <div className="community-post-edit">
        <div className="page-container">
          <div className="page-header">
            <h1 className="page-title">✏️ 게시글 수정</h1>
          </div>

          <form className="post-form" onSubmit={handleSubmit}>
            {/* 카테고리 섹션 (변경 불가) */}
            <div className="form-section">
              <label className="form-label">
                카테고리 (변경 불가) <span className="required">*</span>
              </label>
              <div className="category-tabs">
                {categories.map(category => (
                  <button
                    key={category.id}
                    type="button"
                    className={`category-tab ${formData.category === category.id ? 'active' : ''}`}
                    disabled
                    style={{ cursor: 'not-allowed', opacity: formData.category === category.id ? 1 : 0.5 }}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 제목 */}
            <div className="form-section">
              <label htmlFor="title" className="form-label">
                제목 <span className="required">*</span>
              </label>
              <input
                id="title"
                type="text"
                className={`form-input ${errors.title ? 'error' : ''}`}
                placeholder="제목을 입력하세요 (최대 100자)"
                value={formData.title}
                onChange={handleTitleChange}
                onBlur={() => handleBlur('title', formData.title)}
                maxLength={100}
              />
              <div className="input-count">{formData.title.length}/100</div>
              {errors.title && <div className="error-message">{errors.title}</div>}
            </div>

            {/* 내용 */}
            <div className="form-section">
              <label htmlFor="content" className="form-label">
                내용 <span className="required">*</span>
              </label>
              <textarea
                id="content"
                className={`form-textarea ${errors.content ? 'error' : ''}`}
                placeholder="내용을 입력하세요 (최대 2000자)"
                value={formData.content}
                onChange={handleContentChange}
                onBlur={() => handleBlur('content', formData.content)}
                maxLength={2000}
              />
              <div className="input-count">{formData.content.length}/2000</div>
              {errors.content && <div className="error-message">{errors.content}</div>}
            </div>

            {/* 사진 첨부 */}
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
                onClick={() => (existingImageUrls.length + images.length) < 10 && fileInputRef.current?.click()}
                style={{ cursor: (existingImageUrls.length + images.length) < 10 ? 'pointer' : 'default' }}
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

                {imagePreviews.length === 0 ? (
                  <div className="upload-prompt">
                    <span className="upload-icon">📷</span>
                    <div className="upload-text-group">
                      <span className="upload-text">여기로 이미지를 드래그하거나 </span>
                      <span className="upload-link">파일을 업로드</span>
                      <span className="upload-text"> 하세요.</span>
                    </div>
                    <span className="image-count">0/10</span>
                  </div>
                ) : (
                  <>
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="image-preview">
                        <img src={preview} alt={`Preview ${index + 1}`} />
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
                    {(existingImageUrls.length + images.length) < 10 && (
                      <div className="upload-more-hint">
                        <span className="plus-icon">+</span>
                        <span className="image-count">{existingImageUrls.length + images.length}/10</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* 버튼 액션 */}
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-cancel"
                onClick={handleCancel}
                disabled={isSaving}
              >
                취소
              </button>
              <button
                type="submit"
                className="btn btn-submit"
                disabled={isSaving}
              >
                {isSaving ? '수정 중...' : '수정'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CommunityPostEdit;
