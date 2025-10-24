import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BottomNav from '../../components/BottomNav';
import CategorySelector from '../../components/CategorySelector';
import type { CategoryItem } from '../../components/CategorySelector';
import { productService, type ProductUpdateRequest } from '../../api/services/product';
import type { MarketDetailResponse } from '../../types/market';
import { useAuthStore } from '../../stores/authStore';
import categoryDataImport from '../../data/category.json';
import './ProductEdit.css';

// foodCategories.json 데이터 타입
interface FoodCategoryData {
  code: string;
  name: string;
  sub?: FoodCategoryData[];
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
    // Vite import를 사용하여 JSON 직접 로드
    const foodCategories = categoryDataImport as FoodCategoryData[];
    return transformFoodCategories(foodCategories);
  } catch (error) {
    console.error('Failed to load food categories:', error);
    return [];
  }
};

const ProductEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<MarketDetailResponse | null>(null);

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // 변경 불가 필드 (읽기 전용)
  const [minParticipants, setMinParticipants] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  // 에러 상태 관리
  const [errors, setErrors] = useState<{
    images?: string;
    title?: string;
    price?: string;
    description?: string;
  }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

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

  // 상품 데이터 로드
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        alert('상품 ID가 없습니다.');
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const response = await productService.getProduct(id);

        if (!response.success || !response.data) {
          throw new Error('상품을 찾을 수 없습니다.');
        }

        const productData = response.data;

        // 작성자 확인
        if (productData.authorId !== authUser?.userId) {
          alert('수정 권한이 없습니다.');
          navigate(`/products/${id}`);
          return;
        }

        setProduct(productData);

        // 폼 데이터 설정
        setTitle(productData.title);
        setPrice(productData.price.toString());
        setDescription(productData.content);
        setMinParticipants(productData.recruitMin.toString());
        setMaxParticipants(productData.recruitMax.toString());
        setDeadline(productData.endTime);
        setSelectedLocation(productData.locationText);
        setSelectedCategories([productData.categoryId]);
        setExistingImageUrls(productData.images.map(img => img.imageUrl));
        setImagePreviews(productData.images.map(img => img.imageUrl));

      } catch (error: any) {
        console.error('상품 로드 실패:', error);
        alert(error.message || '상품 정보를 불러오는데 실패했습니다.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, navigate, authUser]);

  // 필드별 검증 함수
  const validateField = (field: string, value: any): string | undefined => {
    switch (field) {
      case 'images':
        if (existingImageUrls.length === 0 && images.length === 0) {
          return '최소 1장 이상의 상품 이미지가 필요합니다.';
        }
        break;
      case 'title':
        if (!value || value.trim() === '') {
          return '제목을 입력해주세요.';
        }
        break;
      case 'price':
        if (!value || value.trim() === '') {
          return '가격을 입력해주세요.';
        }
        if (isNaN(Number(value)) || Number(value) <= 0) {
          return '올바른 가격을 입력해주세요.';
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
    }
    return undefined;
  };

  // 전체 폼 검증
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    newErrors.images = validateField('images', images);
    newErrors.title = validateField('title', title);
    newErrors.price = validateField('price', price);
    newErrors.description = validateField('description', description);

    setErrors(newErrors);

    return !Object.values(newErrors).some(error => error !== undefined);
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

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 2000) {
      setDescription(value);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      alert('입력하신 내용을 다시 확인해주세요.');
      return;
    }

    if (!id) {
      alert('상품 ID가 없습니다.');
      return;
    }

    setIsSaving(true);

    try {
      const updateData: ProductUpdateRequest = {
        id,
        title,
        content: description,
        price: Number(price),
      };

      // 새로운 이미지가 있으면 추가
      if (images.length > 0) {
        updateData.images = images;
      }

      const response = await productService.updateProduct(updateData);

      if (!response.success) {
        throw new Error('상품 수정에 실패했습니다.');
      }

      alert('상품이 성공적으로 수정되었습니다!');
      navigate(`/products/${id}`);
    } catch (error: any) {
      console.error('상품 수정 실패:', error);
      alert(error.message || '상품 수정에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBlur = (field: string, value: any) => {
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const handleCancel = () => {
    if (window.confirm('수정을 취소하시겠습니까?')) {
      navigate(`/products/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="product-edit">
        <Header notificationCount={3} className="desktop-header" />
        <div className="edit-container">
          <div className="loading-message">상품 정보를 불러오는 중...</div>
        </div>
        <Footer className="desktop-footer" />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="product-edit">
      <Header notificationCount={3} className="desktop-header" />

      <div className="edit-container">
        <div className="edit-header">
          <h1 className="edit-title">✏️ 공동구매 상품 수정</h1>
        </div>

        {/* 이미지 업로드 섹션 */}
        <section className="edit-section image-section">
          <h2 className="section-title">📷 상품 이미지</h2>
          <p className="section-description">최대 10장까지 업로드 가능합니다.</p>
          <div
            ref={dropZoneRef}
            className={`image-upload-container ${isDragging ? 'dragging' : ''}`}
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
                {(existingImageUrls.length + images.length) < 10 && (
                  <div className="upload-more-hint">
                    <span className="plus-icon">+</span>
                    <span className="image-count">{existingImageUrls.length + images.length}/10</span>
                  </div>
                )}
              </>
            )}
          </div>
          {errors.images && <div className="error-message">{errors.images}</div>}
        </section>

        {/* 기본 정보 섹션 */}
        <section className="edit-section info-section">
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
            <label className="form-label">카테고리 (변경 불가)</label>
            <CategorySelector
              data={categoryData}
              value={selectedCategories}
              onChange={() => {}}
              maxLevel={4}
              className="product-category-selector"
              disabled
            />
          </div>

          <div className="form-group">
            <label className="form-label">가격 *</label>
            <input
              type="text"
              className={`form-input price-input ${errors.price ? 'error' : ''}`}
              placeholder="₩ 가격을 입력해주세요"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onBlur={() => handleBlur('price', price)}
            />
            {errors.price && <div className="error-message">{errors.price}</div>}
          </div>
        </section>

        {/* 모집 정보 섹션 (변경 불가) */}
        <section className="edit-section recruit-section">
          <h2 className="section-title">👥 모집 정보 (변경 불가)</h2>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">최소 모집 인원</label>
              <input
                type="number"
                className="form-input"
                value={minParticipants}
                disabled
                readOnly
              />
            </div>

            <div className="form-group">
              <label className="form-label">최대 모집 인원</label>
              <input
                type="number"
                className="form-input"
                value={maxParticipants}
                disabled
                readOnly
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">모집 마감일자</label>
            <input
              type="datetime-local"
              className="form-input deadline-input"
              value={deadline}
              disabled
              readOnly
            />
          </div>
        </section>

        {/* 상품 설명 섹션 */}
        <section className="edit-section description-section">
          <h2 className="section-title">📝 상품 상세 설명</h2>
          <textarea
            className={`form-textarea ${errors.description ? 'error' : ''}`}
            placeholder="상품에 대한 상세 설명을 입력해주세요. (최소 50자)"
            value={description}
            onChange={handleDescriptionChange}
            onBlur={() => handleBlur('description', description)}
            maxLength={2000}
            rows={10}
          />
          <div className="input-count">{description.length}/2000 (최소 50자)</div>
          {errors.description && <div className="error-message">{errors.description}</div>}
        </section>

        {/* 지역 정보 섹션 (변경 불가) */}
        <section className="edit-section location-section">
          <h2 className="section-title">🚩 거래 희망 장소 (변경 불가)</h2>
          <div className="location-map">
            <div className="map-placeholder">
              <span className="location-pin">📍</span>
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '20px' }}>
            <input
              type="text"
              className="form-input"
              value={selectedLocation}
              disabled
              readOnly
            />
          </div>
        </section>

        {/* 버튼 섹션 */}
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
            type="button"
            className="btn btn-submit"
            onClick={handleSubmit}
            disabled={isSaving}
          >
            {isSaving ? '수정 중...' : '수정'}
          </button>
        </div>
      </div>

      <Footer className="desktop-footer" />
      <BottomNav />
    </div>
  );
};

export default ProductEdit;
