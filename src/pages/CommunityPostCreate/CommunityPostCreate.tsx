import React, { useState, useRef } from 'react';
import Layout from '../../components/Layout';
import './CommunityPostCreate.css';

interface PostFormData {
  category: string;
  title: string;
  content: string;
  images: File[];
}

const CommunityPostCreate: React.FC = () => {
  const [formData, setFormData] = useState<PostFormData>({
    category: 'local-news',
    title: '',
    content: '',
    images: []
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: 'local-news', label: '동네 소식' },
    { id: 'group-review', label: '공구 후기' },
    { id: 'qna', label: '질문 답변' }
  ];

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
    setFormData(prev => ({ ...prev, content: e.target.value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = formData.images.length + files.length;

    if (totalImages > 10) {
      alert('최대 10장까지 업로드 가능합니다.');
      return;
    }

    // 새 이미지 추가
    const newImages = [...formData.images, ...files.slice(0, 10 - formData.images.length)];
    setFormData(prev => ({ ...prev, images: newImages }));

    // 미리보기 생성
    const newPreviews: string[] = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === files.length) {
          setImagePreviews(prev => [...prev, ...newPreviews].slice(0, 10));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
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
    
    // 성공 시 페이지 이동 등 처리
  };

  const handleCancel = () => {
    // 취소 확인 후 이전 페이지로 이동
    if (window.confirm('작성 중인 내용이 사라집니다. 정말 취소하시겠습니까?')) {
      window.history.back();
    }
  };

  return (
    <Layout isLoggedIn={true} notificationCount={3}>
        <div className="community-post-create">
        <div className="page-container">
            <h1 className="page-title">✏️ 게시글 작성</h1>
            
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
                placeholder="내용을 입력하세요..."
                value={formData.content}
                onChange={handleContentChange}
                required
                />
            </div>

            <div className="form-section">
                <div className="form-label-wrapper">
                <label className="form-label">사진 첨부</label>
                <span className="form-hint">최대 10장까지 업로드 가능</span>
                </div>
                <div className="image-upload-area">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                />
                
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