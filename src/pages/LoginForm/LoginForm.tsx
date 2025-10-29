import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import Button from '../../components/Button';
import './LoginForm.css';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
  });

  const validateForm = (): boolean => {
    const errors = {
      email: '',
      password: '',
    };

    if (!formData.email) {
      errors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = '올바른 이메일 형식을 입력해주세요.';
    }

    if (!formData.password) {
      errors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 6) {
      errors.password = '비밀번호는 최소 6자 이상이어야 합니다.';
    }

    setFormErrors(errors);
    return !errors.email && !errors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      console.error('로그인 실패:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    if (error) {
      clearError();
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="login-form-page">
      <div className="login-form-container">
        <div className="login-form-box">
          <button
            className="login-form-back-button"
            onClick={handleBackToLogin}
            type="button"
          >
            ← 돌아가기
          </button>

          <div className="login-form-logo">🛒 함께 사요</div>

          <h1 className="login-form-title">이메일 로그인</h1>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                이메일
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${formErrors.email ? 'error' : ''}`}
                placeholder="이메일을 입력하세요"
                disabled={loading}
              />
              {formErrors.email && (
                <span className="form-error">{formErrors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${formErrors.password ? 'error' : ''}`}
                placeholder="비밀번호를 입력하세요"
                disabled={loading}
              />
              {formErrors.password && (
                <span className="form-error">{formErrors.password}</span>
              )}
            </div>

            {error && (
              <div className="login-form-error">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              disabled={loading}
            >
              {loading ? '로그인 중...' : '로그인'}
            </Button>

            <div className="login-form-forgot-password">
              <button
                className="login-form-forgot-password-link"
                onClick={() => navigate('/password-reset-request')}
                type="button"
                disabled={loading}
              >
                비밀번호를 잊으셨나요?
              </button>
            </div>
          </form>

          <div className="login-form-footer">
            <p className="login-form-signup-text">
              아직 회원이 아니신가요?
            </p>
            <button
              className="login-form-signup-link"
              onClick={() => navigate('/signup')}
              type="button"
              disabled={loading}
            >
              회원가입 하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;