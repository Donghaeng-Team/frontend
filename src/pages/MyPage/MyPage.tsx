import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import StatCard from '../../components/StatCard';
import ToggleSwitch from '../../components/ToggleSwitch';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { canChangePassword } from '../../utils/auth';
import { useAuth } from '../../contexts';
import './MyPage.css';

interface UserProfile {
  name: string;
  email: string;
  joinDate: string;
  avatar?: string;
}

interface MyPageProps {
  user?: UserProfile;
}

const MyPage: React.FC<MyPageProps> = ({
  user = {
    name: '홍길동',
    email: 'example@email.com',
    joinDate: '2025년 9월',
  }
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  // 프로필 상태
  const [profile, setProfile] = useState<UserProfile>(user);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [tempAvatar, setTempAvatar] = useState(profile.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 알림 설정 상태
  const [notificationSettings, setNotificationSettings] = useState({
    purchaseComplete: true,
    newMessage: true,
    deadlineAlert: false
  });

  // 아코디언 상태
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const handleSectionToggle = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleProfileEdit = () => {
    if (isEditMode) {
      // 저장 모드
      setProfile({
        ...profile,
        name: editName,
        avatar: tempAvatar
      });
      setIsEditMode(false);
    } else {
      // 편집 모드
      setEditName(profile.name);
      setTempAvatar(profile.avatar);
      setIsEditMode(true);
    }
  };

  const handleCancelEdit = () => {
    setEditName(profile.name);
    setTempAvatar(profile.avatar);
    setIsEditMode(false);
  };

  const handleImageClick = () => {
    if (isEditMode && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = () => {
    console.log('비밀번호 변경');
    navigate('/change-password');
  };

  const handleLogout = () => {
    console.log('로그아웃 시도');
    // AuthContext의 logout 함수 호출 (자동으로 메인 페이지로 리다이렉트됨)
    logout();
  };

  const handleWithdrawal = () => {
    if (window.confirm('정말로 회원탈퇴를 진행하시겠습니까?')) {
      console.log('회원탈퇴');
    }
  };

  const menuItems = [
    {
      id: 'create-group-purchase',
      icon: '➕',
      label: '공동구매 만들기',
      onClick: () => navigate('/products/register')
    },
    {
      id: 'purchase-history',
      icon: '📦',
      label: '공동구매 내역',
      onClick: () => navigate('/purchase-history')
    },
    {
      id: 'my-posts',
      icon: '📝',
      label: '내가 작성한 글',
      onClick: () => console.log('내가 작성한 글')
    }
  ];

  return (
    <Layout isLoggedIn={true} notificationCount={3}>
      <div className="mypage-container">
        {/* 프로필 섹션 */}
        <section className="profile-section">
          <div className="profile-content">
            <div className="profile-image-wrapper">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <div 
                className={`profile-image-container ${isEditMode ? 'editable' : ''}`}
                onClick={handleImageClick}
              >
                {(isEditMode ? tempAvatar : profile.avatar) ? (
                  <img 
                    src={isEditMode ? tempAvatar : profile.avatar} 
                    alt={profile.name} 
                    className="profile-image" 
                  />
                ) : (
                  <div className="profile-image-placeholder">
                    <span className="profile-icon">👤</span>
                  </div>
                )}
                {isEditMode && (
                  <div className="profile-image-overlay">
                    <span className="camera-icon">📷</span>
                    <span className="overlay-text">변경</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="profile-info">
              {isEditMode ? (
                <div className="profile-edit-name">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="닉네임을 입력하세요"
                    size="medium"
                  />
                </div>
              ) : (
                <h2 className="profile-name">{profile.name}님</h2>
              )}
              <p className="profile-email">{profile.email}</p>
              <p className="profile-join-date">{profile.joinDate} 가입</p>
            </div>
            
            <div className="profile-actions">
              {isEditMode ? (
                <>
                  <button 
                    className="profile-action-btn profile-save-btn"
                    onClick={handleProfileEdit}
                  >
                    저장
                  </button>
                  <button 
                    className="profile-action-btn"
                    onClick={handleCancelEdit}
                  >
                    취소
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="profile-action-btn"
                    onClick={handleProfileEdit}
                  >
                    프로필 편집
                  </button>
                  {/* 로컬 계정 사용자만 비밀번호 변경 가능 (소셜 로그인 사용자 제외) */}
                  {canChangePassword() && (
                    <button
                      className="profile-action-btn"
                      onClick={handlePasswordChange}
                    >
                      비밀번호 변경
                    </button>
                  )}
                  <button
                    className="profile-action-btn"
                    onClick={handleLogout}
                  >
                    로그아웃
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* 통계 카드 섹션 */}
        <section className="stats-section">
          <div className="stats-content">
            <StatCard 
              label="진행중인 공동구매" 
              value="1" 
              unit="건" 
              color="#3399ff" 
            />
            <StatCard 
              label="참여중인 공동구매" 
              value="3" 
              unit="건" 
              color="#ff5e2f" 
            />
            <StatCard 
              label="완료된 공동구매" 
              value="12" 
              unit="건" 
              color="#6633cc" 
            />
            <StatCard
              label="좋아요한 상품"
              value="8"
              unit="개"
              color="#ff3333"
            />
          </div>
        </section>

        {/* 메뉴 섹션 */}
        <section className="menu-section">
          <div className="menu-content">
            {/* 공동구매 관련 메뉴 */}
            <div className="menu-group">
              <div className="menu-items-horizontal">
                {menuItems.map(item => (
                  <button
                    key={item.id}
                    className="menu-item-btn"
                    onClick={item.onClick}
                  >
                    <span className="menu-item-icon">{item.icon}</span>
                    <span className="menu-item-label">{item.label}</span>
                  </button>
                ))}
                <button
                  className="menu-item-btn menu-item-danger"
                  onClick={handleWithdrawal}
                >
                  <span className="menu-item-icon">👋</span>
                  <span className="menu-item-label">회원탈퇴</span>
                </button>
              </div>
            </div>

            {/* 알림 설정 */}
            <div className="menu-item-expandable">
              <button 
                className="menu-item-header"
                onClick={() => handleSectionToggle('notifications')}
              >
                <div className="menu-item-left">
                  <span className="menu-icon menu-icon-warning">🔔</span>
                  <span className="menu-item-title">알림 설정</span>
                </div>
                <span className={`menu-arrow ${expandedSection === 'notifications' ? 'menu-arrow-up' : ''}`}>
                  ∨
                </span>
              </button>
              
              {expandedSection === 'notifications' && (
                <div className="menu-item-content">
                  <div className="notification-item">
                    <span className="notification-label">구매 모집 완료 알림</span>
                    <ToggleSwitch
                      checked={notificationSettings.purchaseComplete}
                      onChange={(checked) => setNotificationSettings({
                        ...notificationSettings,
                        purchaseComplete: checked
                      })}
                    />
                  </div>
                  <div className="notification-item">
                    <span className="notification-label">채팅방 새 메시지 알림</span>
                    <ToggleSwitch
                      checked={notificationSettings.newMessage}
                      onChange={(checked) => setNotificationSettings({
                        ...notificationSettings,
                        newMessage: checked
                      })}
                    />
                  </div>
                  <div className="notification-item">
                    <span className="notification-label">마감 임박 알림 (1시간 전)</span>
                    <ToggleSwitch
                      checked={notificationSettings.deadlineAlert}
                      onChange={(checked) => setNotificationSettings({
                        ...notificationSettings,
                        deadlineAlert: checked
                      })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 고객센터 */}
            <div className="menu-item-expandable">
              <button 
                className="menu-item-header"
                onClick={() => handleSectionToggle('support')}
              >
                <div className="menu-item-left">
                  <span className="menu-icon menu-icon-success">💬</span>
                  <span className="menu-item-title">고객센터</span>
                </div>
                <span className={`menu-arrow ${expandedSection === 'support' ? 'menu-arrow-up' : ''}`}>
                  ∨
                </span>
              </button>
              
              {expandedSection === 'support' && (
                <div className="menu-item-content">
                  <div className="support-item">
                    <span className="support-text">☎️ 고객센터: 1599-1234 (평일 09:00 - 18:00)</span>
                  </div>
                  <div className="support-item">
                    <span className="support-text">📧 이메일: support@hamkkesayo.com</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default MyPage;