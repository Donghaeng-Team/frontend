import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts';
import Button from '../../components/Button';
import './Login.css';

interface LoginProps {
  onKakaoLogin?: () => void;
  onGoogleLogin?: () => void;
  onEmailLogin?: () => void;
  onSignup?: () => void;
}

const Login: React.FC<LoginProps> = ({
  onKakaoLogin,
  onGoogleLogin,
  onEmailLogin,
  onSignup
}) => {
  const navigate = useNavigate();
  const { updateProfile } = useAuth();

  const handleTestLogin = () => {
    // 테스트용 가짜 사용자 데이터
    const testUser = {
      id: 'test-user-123',
      email: 'test@example.com',
      name: '테스트 사용자',
      phoneNumber: '010-1234-5678',
      profileImage: undefined,
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 가짜 토큰 저장
    localStorage.setItem('accessToken', 'fake-access-token-for-testing');
    localStorage.setItem('refreshToken', 'fake-refresh-token-for-testing');

    // 사용자 정보 업데이트
    updateProfile(testUser);

    // 홈으로 이동
    navigate('/');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-box">
          <button
            className="login-back-button"
            onClick={() => navigate('/')}
            type="button"
          >
            ← 홈으로
          </button>

          <div className="login-logo">🛒 함께 사요</div>
          
          <h1 className="login-title">로그인</h1>
          
          <p className="login-description">
            간편 로그인으로 시작하세요
          </p>

          <div className="login-buttons">
            <Button 
              variant="kakao" 
              size="large" 
              fullWidth
              onClick={onKakaoLogin}
            >
              💬  카카오로 시작하기
            </Button>

            <Button 
              variant="google" 
              size="large" 
              fullWidth
              onClick={onGoogleLogin}
            >
              🔍  구글로 시작하기
            </Button>

            <div className="login-divider">
              <span className="login-divider-line"></span>
              <span className="login-divider-text">또는</span>
              <span className="login-divider-line"></span>
            </div>

            <Button
              variant="primary"
              size="large"
              fullWidth
              onClick={() => navigate('/login-form')}
            >
              이메일로 로그인
            </Button>

            <div className="login-divider">
              <span className="login-divider-line"></span>
              <span className="login-divider-text">개발용</span>
              <span className="login-divider-line"></span>
            </div>

            <Button
              variant="secondary"
              size="large"
              fullWidth
              onClick={handleTestLogin}
            >
              🧪 테스트 로그인
            </Button>
          </div>

          <div className="login-footer">
            <p className="login-signup-text">
              아직 회원이 아니신가요?
            </p>
            <button 
              className="login-signup-link" 
              onClick={() => {
                navigate('/signup');
                onSignup?.();
              }}
            >
              회원가입 하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;