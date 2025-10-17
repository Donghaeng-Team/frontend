import React from 'react';
import Card from '../Card';
import './ProductCard.css';

interface ProductCardProps {
  image?: string;
  category: string;
  title: string;
  price: number | string;
  originalPrice?: number | string;
  discount?: number;
  seller: {
    name: string;
    avatar?: string;
  };
  participants?: {
    current: number;
    max: number;
  };
  location: string;
  status?: 'active' | 'completed' | 'pending';
  onClick?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  image,
  category,
  title,
  price,
  originalPrice,
  discount,
  seller,
  participants,
  location,
  status = 'active',
  onClick
}) => {
  const formatPrice = (value: number | string) => {
    if (typeof value === 'number') {
      return `₩${value.toLocaleString()}`;
    }
    return value;
  };

  const getStatusColor = () => {
    switch (status) {
      case 'active': return '#339933';
      case 'completed': return '#666666';
      case 'pending': return '#ff5e2f';
      default: return '#333333';
    }
  };

  return (
    <Card 
      variant="outlined" 
      padding="none" 
      hoverable 
      onClick={onClick}
      className="product-card"
    >
      <div className="product-image-container">
        {image ? (
          <img src={image} alt={title} className="product-image" />
        ) : (
          <div className="product-image-placeholder" />
        )}
        {discount && (
          <span className="product-discount">{discount}% OFF</span>
        )}
      </div>
      
      <div className="product-content">
        <span className="product-category">{category}</span>
        <h4 className="product-title">{title}</h4>
        
        <div className="product-price-container">
          {participants ? (
            <div className="product-price-range">
              <div className="price-current-info">
                <span className="price-current">
                  {formatPrice(typeof price === 'number' ? Math.ceil(price / participants.current) : price)}
                </span>
              </div>
              <div className="price-max-info">
                <span className="price-max-label">
                  최대 {participants.max}명 모집 시 {formatPrice(typeof price === 'number' ? Math.ceil(price / participants.max) : price)}
                </span>
              </div>
            </div>
          ) : (
            <>
              <span className="product-price">{formatPrice(price)}</span>
              {originalPrice && (
                <span className="product-original-price">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </>
          )}
        </div>

        <div className="product-info">
          <div className="product-seller">
            {seller.avatar ? (
              <img src={seller.avatar} alt={seller.name} className="seller-avatar" />
            ) : (
              <div className="seller-avatar-placeholder">
                {seller.name.charAt(0)}
              </div>
            )}
            <span className="seller-name">{seller.name}</span>
          </div>
          
          {participants && (
            <span 
              className="product-participants" 
              style={{ color: getStatusColor() }}
            >
              {participants.current}/{participants.max}명 모집
            </span>
          )}
          
          <span className="product-location">• {location}</span>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;