import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CategorySelector from '../../components/CategorySelector';
import type { CategoryItem } from '../../components/CategorySelector';
import Button from '../../components/Button';
import Input from '../../components/Input';
import GoogleMap from '../../components/GoogleMap';
import { useAuthStore } from '../../stores/authStore';
import { productService } from '../../api/services/product';
import { imageService } from '../../api/services/image';
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
  totalPrice: string;
  minParticipants: string;
  maxParticipants: string;
  deadline: string;
  description: string;
  selectedCategories: string[];
  detailLocation: string;
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
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.user);

  const [title, setTitle] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [minParticipants, setMinParticipants] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [mapAddress, setMapAddress] = useState(''); // 지도에서 선택한 주소 (참고용)
  const [detailLocation, setDetailLocation] = useState(''); // 사용자가 입력하는 상세 거래 위치
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number }>({ lat: 37.5665, lng: 126.9780 });
  const [categoryData, setCategoryData] = useState<CategoryItem[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // 에러 상태 관리
  const [errors, setErrors] = useState<{
    images?: string;
    title?: string;
    totalPrice?: string;
    minParticipants?: string;
    maxParticipants?: string;
    deadline?: string;
    description?: string;
    detailLocation?: string;
  }>({});

  const saveTimeoutRef = useRef<number | null>(null);
  const hasPromptedRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const DRAFT_KEY = 'productRegisterDraft';
  const AUTO_SAVE_DELAY = 2000;
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  // 필드별 검증 함수
  const validateField = (field: string, value: any): string | undefined => {
    switch (field) {
      case 'images':
        if (images.length === 0) {
          return '최소 1장 이상의 상품 이미지를 등록해주세요.';
        }
        break;
      case 'title':
        if (!value || value.trim() === '') {
          return '제목을 입력해주세요.';
        }
        break;
      case 'totalPrice':
        if (!value || value.trim() === '') {
          return '총 금액을 입력해주세요.';
        }
        if (isNaN(Number(value)) || Number(value) <= 0) {
          return '올바른 금액을 입력해주세요.';
        }
        break;
      case 'minParticipants':
        if (!value || value.trim() === '') {
          return '최소 모집 인원을 입력해주세요.';
        }
        if (isNaN(Number(value)) || Number(value) < 2) {
          return '최소 모집 인원은 2명 이상이어야 합니다.';
        }
        break;
      case 'maxParticipants':
        if (!value || value.trim() === '') {
          return '최대 모집 인원을 입력해주세요.';
        }
        if (isNaN(Number(value)) || Number(value) < 2) {
          return '최대 모집 인원은 2명 이상이어야 합니다.';
        }
        if (minParticipants && Number(value) < Number(minParticipants)) {
          return '최대 인원은 최소 인원보다 크거나 같아야 합니다.';
        }
        break;
      case 'deadline':
        if (!value || value.trim() === '') {
          return '모집 마감일자를 선택해주세요.';
        }
        const deadlineDate = new Date(value);
        const now = new Date();
        if (deadlineDate <= now) {
          return '마감일은 현재 시간 이후여야 합니다.';
        }
        break;
      case 'description':
        if (!value || value.trim() === '') {
          return '상품 설명을 입력해주세요.';
        }
        if (value.length < 50) {
          return '상품 설명은 최소 50자 이상 입력해주세요.';
        }
        break;
      case 'detailLocation':
        if (!value || value.trim() === '') {
          return '상세 거래 위치를 입력해주세요.';
        }
        break;
    }
    return undefined;
  };

  // 전체 폼 검증
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    newErrors.images = validateField('images', images);
    newErrors.title = validateField('title', title);
    newErrors.totalPrice = validateField('totalPrice', totalPrice);
    newErrors.minParticipants = validateField('minParticipants', minParticipants);
    newErrors.maxParticipants = validateField('maxParticipants', maxParticipants);
    newErrors.deadline = validateField('deadline', deadline);
    newErrors.description = validateField('description', description);
    newErrors.detailLocation = validateField('detailLocation', detailLocation);

    setErrors(newErrors);

    // 에러가 하나라도 있으면 false 반환
    return !Object.values(newErrors).some(error => error !== undefined);
  };

  // localStorage에 저장
  const saveDraft = () => {
    const draft: DraftData = {
      title,
      totalPrice,
      minParticipants,
      maxParticipants,
      deadline,
      description,
      selectedCategories,
      detailLocation,
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
        setTotalPrice(draft.totalPrice);
        setMinParticipants(draft.minParticipants);
        setMaxParticipants(draft.maxParticipants);
        setDeadline(draft.deadline);
        setDescription(draft.description);
        setSelectedCategories(draft.selectedCategories);
        setDetailLocation(draft.detailLocation);
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
  }, [title, totalPrice, minParticipants, maxParticipants, deadline, description, selectedCategories, detailLocation]);

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

  // 지도 위치 변경 핸들러
  const handleLocationChange = (location: { lat: number; lng: number; address: string }) => {
    setLocationCoords({ lat: location.lat, lng: location.lng });
    setMapAddress(location.address);
  };

  const handleSubmit = async () => {
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

      // 제출할 데이터 구조 확인
      const requestData = {
        images: images, // File[] 직접 전달
        title,
        categoryId: selectedCategories.join(''),  // 카테고리 ID (예: "01010101")
        price: Math.floor(parseInt(totalPrice, 10) / parseInt(minParticipants, 10)),
        recruitMin: parseInt(minParticipants, 10),
        recruitMax: parseInt(maxParticipants, 10),
        endTime: new Date(deadline).toISOString(),
        content: description,
        latitude: locationCoords.lat,
        longitude: locationCoords.lng,
        locationText: detailLocation
      };

      console.log('📤 제출할 데이터 구조:', {
        ...requestData,
        images: `File[] (${images.length}개)`,
        imageNames: images.map(img => img.name)
      });
      console.log('📤 각 필드 타입 확인:');
      console.log('  images:', Array.isArray(requestData.images) ? `array<File> (${requestData.images.length}개)` : typeof requestData.images);
      console.log('  title:', typeof requestData.title, `"${requestData.title}"`);
      console.log('  categoryId:', typeof requestData.categoryId, `"${requestData.categoryId}"`);
      console.log('  price:', typeof requestData.price, requestData.price);
      console.log('  recruitMin:', typeof requestData.recruitMin, requestData.recruitMin);
      console.log('  recruitMax:', typeof requestData.recruitMax, requestData.recruitMax);
      console.log('  endTime:', typeof requestData.endTime, `"${requestData.endTime}"`);
      console.log('  content:', typeof requestData.content, `"${requestData.content.substring(0, 50)}..."`);
      console.log('  latitude:', typeof requestData.latitude, requestData.latitude);
      console.log('  longitude:', typeof requestData.longitude, requestData.longitude);
      console.log('  locationText:', typeof requestData.locationText, `"${requestData.locationText}"`);

      // Swagger 기반 CreateMarketRequest 생성
      const response = await productService.createProduct(requestData, authUser.userId!);

      if (response.success) {
        // 성공 시 임시 저장 데이터 삭제
        clearDraft();

        const marketId = response.data?.marketId;

        if (marketId) {
          console.log('✅ 상품 생성 성공, marketId:', marketId);
          alert('상품이 성공적으로 등록되었습니다!');
          navigate(`/products/${marketId}`);
        } else {
          console.warn('⚠️ marketId가 반환되지 않음, 목록으로 이동');
          alert('상품이 성공적으로 등록되었습니다!');
          navigate('/products');
        }
      } else {
        alert('상품 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('상품 등록 실패:', error);
      alert('상품 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 필드별 블러 이벤트 핸들러
  const handleBlur = (field: string, value: any) => {
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
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
      <Header notificationCount={3} />
      
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
          {errors.images && <div className="error-message">{errors.images}</div>}
        </section>

        {/* 기본 정보 섹션 */}
        <section className="register-section info-section">
          <h2 className="section-title">📋 기본 정보</h2>

          <div className="form-group">
            <label className="form-label">제목 *</label>
            <input
              type="text"
              className={`form-input ${errors.title ? 'error' : ''}`}
              placeholder="예: 유기농 사과 1kg 씩 나눠요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => handleBlur('title', title)}
            />
            {errors.title && <div className="error-message">{errors.title}</div>}
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
            <label className="form-label">총 금액 *</label>
            <input
              type="text"
              className={`form-input ${errors.totalPrice ? 'error' : ''}`}
              placeholder="₩ 총 금액 입력"
              value={totalPrice}
              onChange={(e) => setTotalPrice(e.target.value)}
              onBlur={() => handleBlur('totalPrice', totalPrice)}
            />
            {errors.totalPrice && <div className="error-message">{errors.totalPrice}</div>}
            <p className="form-hint">공동구매 상품의 총 금액을 입력해주세요.</p>
          </div>

          {totalPrice && minParticipants && maxParticipants && (
            <div className="price-calculation">
              <div className="calculation-item">
                <span className="calculation-label">최소 인원 ({minParticipants}명) 시 1인당:</span>
                <span className="calculation-value">
                  ₩{Math.floor(parseInt(totalPrice, 10) / parseInt(minParticipants, 10)).toLocaleString()}
                </span>
              </div>
              <div className="calculation-item">
                <span className="calculation-label">최대 인원 ({maxParticipants}명) 시 1인당:</span>
                <span className="calculation-value">
                  ₩{Math.floor(parseInt(totalPrice, 10) / parseInt(maxParticipants, 10)).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </section>

        {/* 모집 정보 섹션 */}
        <section className="register-section recruit-section">
          <h2 className="section-title">👥 모집 정보</h2>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">최소 모집 인원 *</label>
              <input
                type="number"
                className={`form-input ${errors.minParticipants ? 'error' : ''}`}
                placeholder="예: 10명"
                value={minParticipants}
                onChange={(e) => setMinParticipants(e.target.value)}
                onBlur={() => handleBlur('minParticipants', minParticipants)}
              />
              {errors.minParticipants && <div className="error-message">{errors.minParticipants}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">최대 모집 인원 *</label>
              <input
                type="number"
                className={`form-input ${errors.maxParticipants ? 'error' : ''}`}
                placeholder="예: 20명"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                onBlur={() => handleBlur('maxParticipants', maxParticipants)}
              />
              {errors.maxParticipants && <div className="error-message">{errors.maxParticipants}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">모집 마감일자 *</label>
            <input
              type="datetime-local"
              className={`form-input deadline-input ${errors.deadline ? 'error' : ''}`}
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              onBlur={() => handleBlur('deadline', deadline)}
            />
            {errors.deadline && <div className="error-message">{errors.deadline}</div>}
          </div>
        </section>

        {/* 상품 설명 섹션 */}
        <section className="register-section description-section">
          <h2 className="section-title">📝 상품 상세 설명</h2>
          <textarea
            className={`form-textarea ${errors.description ? 'error' : ''}`}
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
            onBlur={() => handleBlur('description', description)}
            maxLength={2000}
            rows={10}
          />
          <div className="input-count">{description.length}/2000 (최소 50자)</div>
          {errors.description && <div className="error-message">{errors.description}</div>}
        </section>

        {/* 지역 정보 섹션 */}
        <section className="register-section location-section">
          <h2 className="section-title">🚩 거래 희망 장소</h2>
          <p className="section-description">
            지도에서 대략적인 위치를 선택하고, 정확한 거래 장소를 입력해주세요.
          </p>
          <GoogleMap
            onLocationChange={handleLocationChange}
            initialCenter={locationCoords}
          />
          <div className="form-group" style={{ marginTop: '20px' }}>
            <label className="form-label">상세 거래 위치 *</label>
            <input
              type="text"
              className={`form-input ${errors.detailLocation ? 'error' : ''}`}
              placeholder="예: 서초역 3번 출구 앞 스타벅스"
              value={detailLocation}
              onChange={(e) => setDetailLocation(e.target.value)}
              onBlur={() => handleBlur('detailLocation', detailLocation)}
            />
            {errors.detailLocation && <div className="error-message">{errors.detailLocation}</div>}
            <p className="form-hint">정확한 만남 장소를 입력해주세요. (예: 역 출구, 카페 이름 등)</p>
          </div>
        </section>

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

        {/* 버튼 섹션 */}
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
            type="button"
            className="btn btn-submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? '등록 중...' : '등록'}
          </button>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProductRegister;