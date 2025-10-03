import React, { useState } from 'react';
import Layout from '../../components/Layout';
import StatCard from '../../components/StatCard';
import ToggleSwitch from '../../components/ToggleSwitch';
import Button from '../../components/Button';
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
    console.log('프로필 편집');
  };

  const handlePasswordChange = () => {
    console.log('비밀번호 변경');
  };

  const handleLogout = () => {
    console.log('로그아웃');
  };

  const handleWithdrawal = () => {
    if (window.confirm('정말로 회원탈퇴를 진행하시겠습니까?')) {
      console.log('회원탈퇴');
    }
  };

  const menuItems = [
    {
      id: 'purchase-history',
      icon: '📦',
      label: '공동구매 내역',
      onClick: () => console.log('공동구매 내역')
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
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="profile-image" />
              ) : (
                <div className="profile-image-placeholder">
                  <span className="profile-icon">👤</span>
                </div>
              )}
            </div>
            
            <div className="profile-info">
              <h2 className="profile-name">{user.name}님</h2>
              <p className="profile-email">{user.email}</p>
              <p className="profile-join-date">{user.joinDate} 가입</p>
            </div>
            
            <div className="profile-actions">
              <button 
                className="profile-action-btn"
                onClick={handleProfileEdit}
              >
                프로필 편집
              </button>
              <button 
                className="profile-action-btn"
                onClick={handlePasswordChange}
              >
                비밀번호 변경
              </button>
              <button 
                className="profile-action-btn"
                onClick={handleLogout}
              >
                로그아웃
              </button>
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
              label="찜한 상품" 
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