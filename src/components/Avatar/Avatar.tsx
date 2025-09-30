import type { FC } from 'react';
import './Avatar.css';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  shape?: 'circle' | 'square';
  onClick?: () => void;
  status?: 'online' | 'offline' | 'away' | 'busy';
  className?: string;
}

const Avatar: FC<AvatarProps> = ({
  src,
  alt = '',
  name = '',
  size = 'medium',
  shape = 'circle',
  onClick,
  status,
  className = ''
}) => {
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return names[0].charAt(0) + names[names.length - 1].charAt(0);
    }
    return name.slice(0, 2).toUpperCase();
  };

  const avatarClasses = [
    'avatar',
    `avatar-${size}`,
    `avatar-${shape}`,
    onClick && 'avatar-clickable',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={avatarClasses} onClick={onClick}>
      {src ? (
        <img src={src} alt={alt || name} className="avatar-image" />
      ) : (
        <div className="avatar-placeholder">
          <span className="avatar-initials">{getInitials(name)}</span>
        </div>
      )}
      {status && <span className={`avatar-status avatar-status-${status}`} />}
    </div>
  );
};

export default Avatar;