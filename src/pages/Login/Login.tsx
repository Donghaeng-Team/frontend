import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import { setAccessToken, setRefreshToken, setUser } from '../../utils/token';
import type { User } from '../../types/auth';
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

  const handleTestLogin = (provider: 'LOCAL' | 'KAKAO' | 'GOOGLE') => {
    // Provider에 따른 테스트 사용자 데이터
    const testUsers: Record<'LOCAL' | 'KAKAO' | 'GOOGLE', User> = {
      LOCAL: {
        email: 'local@example.com',
        nickName: '로컬 테스트 사용자',
        avatarUrl: null,
        provider: 'LOCAL'
      },
      KAKAO: {
        email: 'kakao@example.com',
        nickName: '카카오 테스트 사용자',
        avatarUrl: 'https://via.placeholder.com/150',
        provider: 'KAKAO'
      },
      GOOGLE: {
        email: 'google@example.com',
        nickName: '구글 테스트 사용자',
        avatarUrl: 'https://via.placeholder.com/150',
        provider: 'GOOGLE'
      }
    };

    const testUser = testUsers[provider];

    // 테스트용 토큰 저장
    setAccessToken(`fake-access-token-${provider.toLowerCase()}`);
    setRefreshToken(`fake-refresh-token-${provider.toLowerCase()}`);

    // 사용자 정보 저장
    setUser(testUser);

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
              <span className="login-divider-text">개발용 테스트</span>
              <span className="login-divider-line"></span>
            </div>

            <div className="test-login-buttons">
              <Button
                variant="secondary"
                size="large"
                fullWidth
                onClick={() => handleTestLogin('LOCAL')}
              >
                🧪 LOCAL 테스트
              </Button>

              <Button
                variant="secondary"
                size="large"
                fullWidth
                onClick={() => handleTestLogin('KAKAO')}
              >
                💬 KAKAO 테스트
              </Button>

              <Button
                variant="secondary"
                size="large"
                fullWidth
                onClick={() => handleTestLogin('GOOGLE')}
              >
                🔍 GOOGLE 테스트
              </Button>
            </div>
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