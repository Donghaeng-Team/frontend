import { useState } from 'react';
import Input from '../../components/Input';
import Checkbox from '../../components/Checkbox';
import Button from '../../components/Button';
import './SignUp.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    email: '',
    nickname: '',
    password: '',
    passwordConfirm: ''
  });
  
  const [agreements, setAgreements] = useState({
    all: false,
    terms: false,
    privacy: false,
    marketing: false
  });

  const [errors, setErrors] = useState({
    email: '',
    nickname: '',
    password: '',
    passwordConfirm: ''
  });

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    // 에러 초기화
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleAllAgree = (checked: boolean) => {
    setAgreements({
      all: checked,
      terms: checked,
      privacy: checked,
      marketing: checked
    });
  };

  const handleAgreeChange = (field: keyof typeof agreements) => (checked: boolean) => {
    const newAgreements = {
      ...agreements,
      [field]: checked
    };
    
    // 전체 동의 체크박스 상태 업데이트
    newAgreements.all = newAgreements.terms && newAgreements.privacy && newAgreements.marketing;
    
    setAgreements(newAgreements);
  };

  const validateForm = () => {
    const newErrors = {
      email: '',
      nickname: '',
      password: '',
      passwordConfirm: ''
    };
    let isValid = true;

    // 이메일 검증
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
      isValid = false;
    }

    // 닉네임 검증
    if (!formData.nickname) {
      newErrors.nickname = '닉네임을 입력해주세요';
      isValid = false;
    } else if (formData.nickname.length < 2) {
      newErrors.nickname = '닉네임은 2자 이상이어야 합니다';
      isValid = false;
    }

    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다';
      isValid = false;
    }

    // 비밀번호 확인 검증
    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호를 다시 입력해주세요';
      isValid = false;
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // 필수 약관 동의 확인
    if (!agreements.terms || !agreements.privacy) {
      alert('필수 약관에 동의해주세요');
      return;
    }

    // 회원가입 처리
    console.log('회원가입 데이터:', { ...formData, agreements });
    alert('회원가입이 완료되었습니다!');
    window.location.href = '/login';
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-box">
          {/* 로고 */}
          <div className="signup-logo">🛒 함께 사요</div>

          {/* 타이틀 */}
          <h1 className="signup-title">회원가입</h1>

          {/* 회원가입 폼 */}
          <form onSubmit={handleSubmit} className="signup-form">
            {/* 이메일 */}
            <Input
              label="이메일"
              type="email"
              name="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleInputChange('email')}
              error={errors.email}
              required
              fullWidth
            />

            {/* 닉네임 */}
            <Input
              label="닉네임"
              type="text"
              name="nickname"
              placeholder="홍길동"
              value={formData.nickname}
              onChange={handleInputChange('nickname')}
              error={errors.nickname}
              required
              fullWidth
            />

            {/* 비밀번호 */}
            <Input
              label="비밀번호"
              type="password"
              name="password"
              placeholder="8자 이상 입력하세요"
              value={formData.password}
              onChange={handleInputChange('password')}
              error={errors.password}
              required
              fullWidth
            />

            {/* 비밀번호 확인 */}
            <Input
              label="비밀번호 확인"
              type="password"
              name="passwordConfirm"
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.passwordConfirm}
              onChange={handleInputChange('passwordConfirm')}
              error={errors.passwordConfirm}
              required
              fullWidth
            />

            {/* 구분선 */}
            <div className="signup-divider" />

            {/* 약관 동의 */}
            <div className="signup-agreements">
              <Checkbox
                label="전체 동의합니다"
                checked={agreements.all}
                onChange={handleAllAgree}
                className="agreement-all"
              />

              <Checkbox
                label="[필수] 이용약관 동의"
                checked={agreements.terms}
                onChange={handleAgreeChange('terms')}
              />

              <Checkbox
                label="[필수] 개인정보 처리방침 동의"
                checked={agreements.privacy}
                onChange={handleAgreeChange('privacy')}
              />

              <Checkbox
                label="[선택] 마케팅 정보 수신 동의"
                checked={agreements.marketing}
                onChange={handleAgreeChange('marketing')}
              />
            </div>

            {/* 회원가입 버튼 */}
            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
            >
              회원가입
            </Button>
          </form>

          {/* 로그인 링크 */}
          <div className="signup-footer">
            <p className="signup-footer-text">이미 회원이신가요?</p>
            <a href="/login" className="signup-footer-link">로그인하기</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;