import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import StatCard from '../../components/StatCard';
import ToggleSwitch from '../../components/ToggleSwitch';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { canChangePassword } from '../../utils/auth';
import { useAuthStore } from '../../stores/authStore';
import { userService } from '../../api/services/user';
import { productService } from '../../api/services/product';
import { chatService } from '../../api/services/chat';
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

const MyPage: React.FC<MyPageProps> = () => {
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const refreshProfile = useAuthStore((state) => state.refreshProfile);

  // 프로필 상태 (authStore의 user를 기반으로 초기화)
  const [profile, setProfile] = useState<UserProfile>({
    name: authUser?.nickName || '사용자',
    email: authUser?.email || '',
    joinDate: '2025년 9월',
    avatar: authUser?.avatarUrl || undefined
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [tempAvatar, setTempAvatar] = useState(profile.avatar);
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // authUser가 변경되면 profile 업데이트
  useEffect(() => {
    if (authUser) {
      setProfile({
        name: authUser.nickName,
        email: authUser.email,
        joinDate: '2025년 9월',
        avatar: authUser.avatarUrl || undefined
      });
      setEditName(authUser.nickName);
      setTempAvatar(authUser.avatarUrl || undefined);
    }
  }, [authUser]);

  // 통계 데이터 상태
  const [stats, setStats] = useState({
    hosting: 0,
    participating: 0,
    completed: 0,
    liked: 0
  });

  // 통계 데이터 로드
  useEffect(() => {
    const loadStats = async () => {
      if (!authUser) return;

      try {
        // 채팅 API를 통한 공동구매 통계 조회
        const purchaseStatsResponse = await chatService.getMyPurchaseStats();

        // 좋아요한 상품 개수 (효율적인 API 사용)
        const likedCountResponse = await productService.getWishlistCount();
        const likedCount = likedCountResponse.success && likedCountResponse.data
          ? likedCountResponse.data
          : 0;

        if (purchaseStatsResponse.success && purchaseStatsResponse.data) {
          setStats({
            hosting: purchaseStatsResponse.data.activeAsCreator,
            participating: purchaseStatsResponse.data.activeAsBuyer,
            completed: purchaseStatsResponse.data.completed,
            liked: likedCount
          });
        } else {
          // API 실패 시 기본값
          setStats({
            hosting: 0,
            participating: 0,
            completed: 0,
            liked: likedCount
          });
        }
      } catch (error) {
        console.error('통계 데이터 로드 실패:', error);
        // Fallback to default values
        setStats({
          hosting: 0,
          participating: 0,
          completed: 0,
          liked: 0
        });
      }
    };

    loadStats();
  }, [authUser]);

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

  const handleProfileEdit = async () => {
    if (isEditMode) {
      // 저장 모드 - 닉네임/이미지 변경 API 호출
      if (!authUser?.userId) {
        alert('사용자 정보를 찾을 수 없습니다.');
        return;
      }

      const hasNicknameChange = editName !== profile.name;
      const hasImageChange = uploadedImageFile !== null;

      if (!hasNicknameChange && !hasImageChange) {
        // 변경사항 없으면 그냥 편집 모드 종료
        setIsEditMode(false);
        return;
      }

      setIsSaving(true);
      try {
        // 닉네임 변경
        if (hasNicknameChange) {
          await userService.changeNickname(authUser.userId, {
            nickname: editName
          });
        }

        // 이미지 변경
        if (hasImageChange && uploadedImageFile) {
          await userService.changeProfileImage(authUser.userId, uploadedImageFile);
        }

        // 성공 시 프로필 업데이트
        setProfile({
          ...profile,
          name: editName,
          avatar: tempAvatar
        });

        // authStore 프로필도 새로고침
        await refreshProfile();

        const changeMessages = [];
        if (hasNicknameChange) changeMessages.push('닉네임');
        if (hasImageChange) changeMessages.push('프로필 이미지');

        alert(`${changeMessages.join('과 ')}이(가) 변경되었습니다.`);
        setIsEditMode(false);
        setUploadedImageFile(null);
      } catch (error: any) {
        console.error('프로필 변경 실패:', error);
        alert(error.message || '프로필 변경에 실패했습니다.');
      } finally {
        setIsSaving(false);
      }
    } else {
      // 편집 모드
      setEditName(profile.name);
      setTempAvatar(profile.avatar);
      setUploadedImageFile(null);
      setIsEditMode(true);
    }
  };

  const handleCancelEdit = () => {
    setEditName(profile.name);
    setTempAvatar(profile.avatar);
    setUploadedImageFile(null);
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
      // 파일 크기 체크 (예: 5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        alert('이미지 크기는 5MB 이하여야 합니다.');
        return;
      }

      // 파일 타입 체크
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }

      // 미리보기를 위해 FileReader 사용
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);

      // 실제 업로드할 파일 객체 저장
      setUploadedImageFile(file);
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

  const handleWithdrawal = async () => {
    if (!authUser?.userId) {
      alert('사용자 정보를 찾을 수 없습니다.');
      return;
    }

    if (window.confirm('정말로 회원탈퇴를 진행하시겠습니까?\n\n탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.')) {
      try {
        await userService.deleteAccount(authUser.userId);
        alert('회원탈퇴가 완료되었습니다.');
        // 로그아웃 처리 (자동으로 메인 페이지로 리다이렉트됨)
        logout();
      } catch (error: any) {
        console.error('회원탈퇴 실패:', error);
        alert(error.message || '회원탈퇴에 실패했습니다.');
      }
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
      onClick: () => navigate(`/community?search=${encodeURIComponent(profile.name)}`)
    }
  ];

  return (
    <Layout isLoggedIn={true}>
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
              value={stats.hosting.toString()}
              unit="건"
              color="#3399ff"
              onClick={() => navigate('/purchase-history?tab=hosting')}
            />
            <StatCard
              label="참여중인 공동구매"
              value={stats.participating.toString()}
              unit="건"
              color="#ff5e2f"
              onClick={() => navigate('/purchase-history?tab=participating')}
            />
            <StatCard
              label="완료된 공동구매"
              value={stats.completed.toString()}
              unit="건"
              color="#6633cc"
              onClick={() => navigate('/purchase-history?tab=completed')}
            />
            <StatCard
              label="좋아요한 상품"
              value={stats.liked.toString()}
              unit="개"
              color="#ff3333"
              onClick={() => navigate('/purchase-history?tab=liked')}
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