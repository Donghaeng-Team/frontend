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

  // 필드별 검증 함수
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'email':
        if (!value || value.trim() === '') {
          return '이메일을 입력해주세요';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return '올바른 이메일 형식이 아닙니다';
        }
        break;
      case 'nickname':
        if (!value || value.trim() === '') {
          return '닉네임을 입력해주세요';
        }
        if (value.length < 2) {
          return '닉네임은 최소 2자 이상이어야 합니다';
        }
        if (value.length > 10) {
          return '닉네임은 최대 10자까지 입력 가능합니다';
        }
        if (!/^[a-zA-Z0-9가-힣]+$/.test(value)) {
          return '닉네임은 한글, 영문, 숫자만 사용 가능합니다';
        }
        break;
      case 'password':
        if (!value || value.trim() === '') {
          return '비밀번호를 입력해주세요';
        }
        if (value.length < 8) {
          return '비밀번호는 최소 8자 이상이어야 합니다';
        }
        if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(value)) {
          return '비밀번호는 영문과 숫자를 포함해야 합니다';
        }
        break;
      case 'passwordConfirm':
        if (!value || value.trim() === '') {
          return '비밀번호를 다시 입력해주세요';
        }
        if (formData.password !== value) {
          return '비밀번호가 일치하지 않습니다';
        }
        break;
    }
    return '';
  };

  // 전체 폼 검증
  const validateForm = () => {
    const newErrors = {
      email: validateField('email', formData.email),
      nickname: validateField('nickname', formData.nickname),
      password: validateField('password', formData.password),
      passwordConfirm: validateField('passwordConfirm', formData.passwordConfirm)
    };

    setErrors(newErrors);

    // 에러가 하나라도 있으면 false 반환
    return !Object.values(newErrors).some(error => error !== '');
  };

  // 필드별 블러 이벤트 핸들러
  const handleBlur = (field: string) => () => {
    const value = formData[field as keyof typeof formData];
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 폼 검증
    if (!validateForm()) {
      alert('입력하신 내용을 다시 확인해주세요.');
      return;
    }

    // 필수 약관 동의 확인
    if (!agreements.terms || !agreements.privacy) {
      alert('필수 약관에 동의해주세요.');
      return;
    }

    // 회원가입 처리
    console.log('회원가입 데이터:', { ...formData, agreements });
    alert('회원가입이 완료되었습니다!');

    // TODO: 실제로는 로그인 페이지로 이동
    // navigate('/login');
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
              onBlur={handleBlur('email')}
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
              onBlur={handleBlur('nickname')}
              error={errors.nickname}
              required
              fullWidth
            />

            {/* 비밀번호 */}
            <Input
              label="비밀번호"
              type="password"
              name="password"
              placeholder="8자 이상, 영문+숫자 조합"
              value={formData.password}
              onChange={handleInputChange('password')}
              onBlur={handleBlur('password')}
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
              onBlur={handleBlur('passwordConfirm')}
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