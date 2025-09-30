import type { FC } from 'react';
import './Skeleton.css';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: number | string;
  height?: number | string;
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
  count?: number;
}

const Skeleton: FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  className = '',
  count = 1
}) => {
  const getDefaultSize = () => {
    switch (variant) {
      case 'circular':
        return { width: width || 40, height: height || 40 };
      case 'rectangular':
        return { width: width || '100%', height: height || 120 };
      case 'rounded':
        return { width: width || '100%', height: height || 40 };
      case 'text':
      default:
        return { width: width || '100%', height: height || 20 };
    }
  };

  const size = getDefaultSize();
  const style = {
    width: typeof size.width === 'number' ? `${size.width}px` : size.width,
    height: typeof size.height === 'number' ? `${size.height}px` : size.height,
  };

  const skeletons = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`skeleton skeleton-${variant} skeleton-${animation} ${className}`}
      style={style}
    />
  ));

  return count > 1 ? (
    <div className="skeleton-group">{skeletons}</div>
  ) : (
    skeletons[0]
  );
};

// 카드 스켈레톤
export const SkeletonCard: FC = () => (
  <div className="skeleton-card">
    <Skeleton variant="rectangular" height={180} />
    <div className="skeleton-card-body">
      <Skeleton variant="text" width="30%" height={14} />
      <Skeleton variant="text" width="80%" height={20} />
      <Skeleton variant="text" width="60%" height={16} />
    </div>
  </div>
);

// 리스트 아이템 스켈레톤
export const SkeletonListItem: FC = () => (
  <div className="skeleton-list-item">
    <Skeleton variant="circular" width={48} height={48} />
    <div className="skeleton-list-content">
      <Skeleton variant="text" width="70%" />
      <Skeleton variant="text" width="40%" height={14} />
    </div>
  </div>
);

export default Skeleton;