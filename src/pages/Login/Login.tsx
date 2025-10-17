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