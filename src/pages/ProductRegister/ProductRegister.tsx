import React, { useState, useEffect, useRef } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CategorySelector from '../../components/CategorySelector';
import type { CategoryItem } from '../../components/CategorySelector';
import Button from '../../components/Button';
import Input from '../../components/Input';
import './ProductRegister.css';

// foodCategories.json 데이터 타입
interface FoodCategoryData {
  code: string;
  name: string;
  sub?: FoodCategoryData[];
}

// 임시 저장 데이터 타입
interface DraftData {
  title: string;
  price: string;
  minParticipants: string;
  maxParticipants: string;
  deadline: string;
  description: string;
  selectedCategories: string[];
  selectedLocation: string;
  savedAt: number;
}

// foodCategories.json 데이터를 CategoryItem 형태로 변환
const transformFoodCategories = (categories: FoodCategoryData[]): CategoryItem[] => {
  return categories.map(category => ({
    value: category.code,
    label: category.name,
    children: category.sub ? transformFoodCategories(category.sub) : []
  }));
};

// 카테고리 데이터 로드 함수
const loadCategoryData = async (): Promise<CategoryItem[]> => {
  try {
    // 실제 JSON 파일에서 로드
    const response = await fetch('/foodCategories.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const foodCategories = await response.json() as FoodCategoryData[];
    return transformFoodCategories(foodCategories);
  } catch (error) {
    console.error('Failed to load food categories:', error);
    return [];
  }
};

const ProductRegister: React.FC = () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [minParticipants, setMinParticipants] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [categoryData, setCategoryData] = useState<CategoryItem[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasPromptedRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const DRAFT_KEY = 'productRegisterDraft';
  const AUTO_SAVE_DELAY = 2000;
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  // localStorage에 저장
  const saveDraft = () => {
    const draft: DraftData = {
      title,
      price,
      minParticipants,
      maxParticipants,
      deadline,
      description,
      selectedCategories,
      selectedLocation,
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

  // 카테고리 데이터 로드
  useEffect(() => {
    const initializeCategoryData = async () => {
      try {
        const categories = await loadCategoryData();
        setCategoryData(categories);
      } catch (error) {
        console.error('Failed to load category data:', error);
      }
    };

    initializeCategoryData();
  }, []);

  // 임시 저장 데이터 복원
  useEffect(() => {
    if (hasPromptedRef.current) return;

    const draft = loadDraft();
    if (draft && (draft.title || draft.description)) {
      hasPromptedRef.current = true;

      const confirm = window.confirm(
        '이전에 작성하던 내용이 있습니다. 불러오시겠습니까?'
      );
      if (confirm) {
        setTitle(draft.title);
        setPrice(draft.price);
        setMinParticipants(draft.minParticipants);
        setMaxParticipants(draft.maxParticipants);
        setDeadline(draft.deadline);
        setDescription(draft.description);
        setSelectedCategories(draft.selectedCategories);
        setSelectedLocation(draft.selectedLocation);
        setLastSaved(new Date(draft.savedAt));
      } else {
        clearDraft();
      }
    }
  }, []);

  // 자동 저장 (디바운싱)
  useEffect(() => {
    if (title || description) {
      setIsSaving(true);

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveDraft();
      }, AUTO_SAVE_DELAY);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [title, price, minParticipants, maxParticipants, deadline, description, selectedCategories, selectedLocation]);

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
    const totalImages = images.length + files.length;

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
    const newImages = [...images, ...validFiles.slice(0, 10 - images.length)];
    setImages(newImages);

    // 미리보기 생성
    const newPreviews: string[] = [];
    validFiles.slice(0, 10 - images.length).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === validFiles.slice(0, 10 - images.length).length) {
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
    setImages(prev => prev.filter((_, i) => i !== index));
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

    if (images.length >= 10) {
      alert('최대 10장까지 업로드 가능합니다.');
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    processImageFiles(files);
  };

  // 본문 길이 제한 핸들러
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 2000) {
      setDescription(value);
    }
  };

  const handleSubmit = () => {
    // 유효성 검사
    if (!title || !price || !minParticipants || !maxParticipants || !deadline) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    if (description.length < 50) {
      alert('상품 설명은 최소 50자 이상 입력해주세요.');
      return;
    }

    // 등록 로직
    console.log('상품 등록:', {
      title,
      price,
      minParticipants,
      maxParticipants,
      deadline,
      description,
      categories: selectedCategories,
      location: selectedLocation
    });

    // 성공 시 임시 저장 데이터 삭제
    clearDraft();
  };

  const handleManualSave = () => {
    if (!title && !description) {
      alert('저장할 내용이 없습니다.');
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveDraft();
    alert('임시 저장되었습니다.');
  };

  const handleCancel = () => {
    if (window.confirm('작성 중인 내용이 사라집니다. 취소하시겠습니까?')) {
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

  return (
    <div className="product-register">
      <Header isLoggedIn={true} notificationCount={3} />
      
      <div className="register-container">
        <div className="register-header">
          <h1 className="register-title">📝 공동구매 상품 등록</h1>
          {lastSaved && (
            <div className="auto-save-status">
              {isSaving ? '저장 중...' : `✓ ${getLastSavedText()}`}
            </div>
          )}
        </div>

        {/* 이미지 업로드 섹션 */}
        <section className="register-section image-section">
          <h2 className="section-title">📷 상품 이미지</h2>
          <p className="section-description">최대 10장까지 업로드 가능합니다.</p>
          <div
            ref={dropZoneRef}
            className={`image-upload-container ${isDragging ? 'dragging' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => images.length < 10 && fileInputRef.current?.click()}
            style={{ cursor: images.length < 10 ? 'pointer' : 'default' }}
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

            {images.length === 0 ? (
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
                    {index === 0 && <div className="main-badge">대표</div>}
                    <img src={preview} alt={`상품 이미지 ${index + 1}`} />
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
                {images.length < 10 && (
                  <div className="upload-more-hint">
                    <span className="plus-icon">+</span>
                    <span className="image-count">{images.length}/10</span>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* 기본 정보 섹션 */}
        <section className="register-section info-section">
          <h2 className="section-title">📋 기본 정보</h2>
          
          <div className="form-group">
            <label className="form-label">제목 *</label>
            <input
              type="text"
              className="form-input"
              placeholder="예: 유기농 사과 1kg 씩 나눠요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">카테고리</label>
            <CategorySelector
              data={categoryData}
              onChange={(values, labels) => setSelectedCategories(values)}
              maxLevel={4}
              className="product-category-selector"
            />
          </div>

          <div className="form-group">
            <label className="form-label">가격 *</label>
            <input
              type="text"
              className="form-input price-input"
              placeholder="₩ 가격을 입력해주세요"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        </section>

        {/* 모집 정보 섹션 */}
        <section className="register-section recruit-section">
          <h2 className="section-title">👥 모집 정보</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">최소 모집 인원 *</label>
              <input
                type="number"
                className="form-input"
                placeholder="예: 10명"
                value={minParticipants}
                onChange={(e) => setMinParticipants(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">최대 모집 인원 *</label>
              <input
                type="number"
                className="form-input"
                placeholder="예: 20명"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">모집 마감일자 *</label>
            <input
              type="datetime-local"
              className="form-input deadline-input"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        </section>

        {/* 상품 설명 섹션 */}
        <section className="register-section description-section">
          <h2 className="section-title">📝 상품 상세 설명</h2>
          <textarea
            className="form-textarea"
            placeholder={`상품에 대한 상세 설명을 입력해주세요.

예시:
- 상품의 특징과 장점
- 품질 정보 (원산지, 인증사항 등)
- 보관 방법
- 공동구매 진행 일정
- 기타 구매자가 알아야 할 정보

최소 50자 이상 입력해주세요.`}
            value={description}
            onChange={handleDescriptionChange}
            maxLength={2000}
            rows={10}
          />
          <div className="input-count">{description.length}/2000 (최소 50자)</div>
        </section>

        {/* 지역 정보 섹션 */}
        <section className="register-section location-section">
          <h2 className="section-title">🚩 거래 희망 장소</h2>
          <p className="section-description">
            공동구매를 진행할 동네를 설정해주세요. 설정한 동네 주변 사용자에게만 노출됩니다.
          </p>
          <div className="location-map">
            <div className="map-placeholder">
              <span className="location-pin">📍</span>
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '20px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="선택한 곳의 장소명을 입력해주세요"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            />
          </div>
        </section>

        {/* 버튼 섹션 */}
        <div className="button-section">
          <Button variant="secondary" size="large" onClick={handleCancel}>
            취소
          </Button>
          <Button variant="outline" size="large" onClick={handleManualSave}>
            임시저장
          </Button>
          <Button variant="primary" size="large" onClick={handleSubmit}>
            상품 등록하기
          </Button>
        </div>

        {/* 주의사항 */}
        <div className="notice-section">
          <h3 className="notice-title">ℹ️ 등록 전 확인사항</h3>
          <ul className="notice-list">
            <li>상품 등록 후 채팅방이 자동으로 생성됩니다</li>
            <li>최소 인원 미달 시 자동으로 취소될 수 있습니다</li>
            <li>허위 상품 등록 시 이용이 제한될 수 있습니다</li>
            <li>상품 정보는 정확하게 입력해주세요</li>
          </ul>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProductRegister;