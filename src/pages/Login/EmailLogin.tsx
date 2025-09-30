import React, { useState } from 'react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Checkbox from '../../components/Checkbox';
import './EmailLogin.css';

interface EmailLoginProps {
  onLogin?: (email: string, password: string, rememberMe: boolean) => void;
  onForgotPassword?: () => void;
  onSignup?: () => void;
  onBack?: () => void;
}

const EmailLogin: React.FC<EmailLoginProps> = ({
  onLogin,
  onForgotPassword,
  onSignup,
  onBack
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin?.(email, password, rememberMe);
  };

  return (
    <div className="email-login-page">
      <div className="email-login-container">
        <div className="email-login-box">
          <div className="email-login-logo">🛒 함께 사요</div>
          
          <h1 className="email-login-title">이메일로 로그인</h1>

          <form onSubmit={handleSubmit} className="email-login-form">
            <Input
              label="이메일"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              fullWidth
              required
            />

            <Input
              label="비밀번호"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              fullWidth
              required
            />

            <div className="email-login-options">
              <Checkbox
                label="로그인 상태 유지"
                checked={rememberMe}
                onChange={setRememberMe}
              />
            </div>

            <Button 
              type="submit"
              variant="primary" 
              size="large" 
              fullWidth
            >
              로그인
            </Button>
          </form>

          <button 
            className="email-login-forgot-password"
            onClick={onForgotPassword}
          >
            비밀번호를 잊으셨나요?
          </button>

          <div className="email-login-divider"></div>

          <div className="email-login-footer">
            <p className="email-login-signup-text">
              아직 회원이 아니신가요?
            </p>
            <button 
              className="email-login-signup-link" 
              onClick={onSignup}
            >
              회원가입 하기
            </button>
          </div>

          <button 
            className="email-login-back-button"
            onClick={onBack}
          >
            ← 다른 방법으로 로그인
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailLogin;