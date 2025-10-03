import React, { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CategorySelector from '../../components/CategorySelector';
import Button from '../../components/Button';
import Input from '../../components/Input';
import './ProductRegister.css';

interface CategoryData {
  대분류: string;
  중분류: string;
  소분류: string;
  세부분류: string;
}

const ProductRegister: React.FC = () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [minParticipants, setMinParticipants] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');

  const categoryData = [
    {
      value: 'processed',
      label: '가공식품',
      children: [
        {
          value: 'seasoning',
          label: '조미료',
          children: []
        },
        {
          value: 'dairy',
          label: '유제품',
          children: [
            { value: 'milk', label: '우유' },
            { value: 'yogurt', label: '요구르트',
              children: [
                { value: 'liquid', label: '액상요구르트' },
                { value: 'other', label: '기타요구르트' }
              ]
            },
            { value: 'dairy_products', label: '유가공품' }
          ]
        },
        {
          value: 'meat',
          label: '축산가공식품',
          children: []
        }
      ]
    },
    {
      value: 'fresh',
      label: '신선식품',
      children: []
    }
  ];

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMainImage(e.target.files[0]);
    }
  };

  const handleAdditionalImageUpload = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newImages = [...additionalImages];
      newImages[index] = e.target.files[0];
      setAdditionalImages(newImages);
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
  };

  const handleSaveDraft = () => {
    console.log('임시 저장');
  };

  const handleCancel = () => {
    if (window.confirm('작성 중인 내용이 사라집니다. 취소하시겠습니까?')) {
      window.history.back();
    }
  };

  return (
    <div className="product-register">
      <Header isLoggedIn={true} notificationCount={3} />
      
      <div className="register-container">
        <h1 className="register-title">📝 공동구매 상품 등록</h1>
        
        {/* 이미지 업로드 섹션 */}
        <section className="register-section image-section">
          <h2 className="section-title">📷 상품 이미지 *</h2>
          <div className="image-upload-container">
            <div className="image-upload-main">
              <input
                type="file"
                id="main-image"
                accept="image/*"
                onChange={handleMainImageUpload}
                hidden
              />
              <label htmlFor="main-image" className="image-upload-box main">
                {mainImage ? (
                  <img src={URL.createObjectURL(mainImage)} alt="메인 이미지" />
                ) : (
                  <>
                    <span className="upload-icon">📷</span>
                    <span className="upload-text">대표 이미지</span>
                  </>
                )}
              </label>
            </div>
            
            <div className="image-upload-additional">
              {[0, 1, 2].map(index => (
                <div key={index}>
                  <input
                    type="file"
                    id={`additional-image-${index}`}
                    accept="image/*"
                    onChange={handleAdditionalImageUpload(index)}
                    hidden
                  />
                  <label htmlFor={`additional-image-${index}`} className="image-upload-box">
                    {additionalImages[index] ? (
                      <img src={URL.createObjectURL(additionalImages[index])} alt={`추가 이미지 ${index + 1}`} />
                    ) : (
                      <span className="upload-plus">+</span>
                    )}
                  </label>
                </div>
              ))}
            </div>
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
            onChange={(e) => setDescription(e.target.value)}
            rows={10}
          />
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
        </section>

        {/* 버튼 섹션 */}
        <div className="button-section">
          <Button variant="outline" size="large" onClick={handleSaveDraft}>
            임시 저장
          </Button>
          <Button variant="secondary" size="large" onClick={handleCancel}>
            취소
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