import axios from "axios"
import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import Button from "../../components/Button"
import "./PasswordVerification.css"

export default function PasswordVerification() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get("token")
  const email = searchParams.get("email")

  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [error, setError] = useState("")
  const [isValid, setIsValid] = useState(false)
  const [loading, setLoading] = useState(false)

  // URL 파라미터 검증
  if (!token || !email) {
    navigate("/login")
    return null
  }

  // 유효성 검사
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecial = /[^a-zA-Z0-9]/.test(password)
  const hasLength = password.length >= 8

  useEffect(() => {
    const isPasswordValid =
      hasUpper && hasLower && hasNumber && hasSpecial && hasLength
    const isPasswordMatch = password === passwordConfirm
    const isPasswordNotEmpty = password.length > 0
    const isConfirmNotEmpty = passwordConfirm.length > 0

    setIsValid(
      isPasswordValid &&
        isPasswordMatch &&
        isPasswordNotEmpty &&
        isConfirmNotEmpty
    )
  }, [
    password,
    passwordConfirm,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
    hasLength,
  ])

  // 비밀번호 변경
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    if (error) {
      setError("")
    }
  }

  // 비밀번호 확인 변경
  const handlePasswordConfirmChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPasswordConfirm(e.target.value)
    if (error) {
      setError("")
    }
  }

  // 비밀번호 확인 입력 후 포커스 아웃 시 검사
  const handlePasswordCheckBlur = () => {
    if (passwordConfirm && password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.")
    } else {
      setError("")
    }
  }

  // Form 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post(
        "https://bytogether.net/api/v1/user/public/password/confirm-reset",
        {
          email: email,
          token: token,
          type: "PASSWORD",
          password: password,
          passwordConfirm: passwordConfirm,
        }
      )
      if (response.status === 200) {
        window.alert("비밀번호 변경이 완료되었습니다.")
        navigate("/login")
      }
    } catch (e) {
      console.error(e)
      setError("비밀번호 변경에 실패하였습니다. 다시 시도해주세요.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="password-verification-page">
      <div className="password-verification-container">
        <div className="password-verification-box">
          <div className="password-verification-logo">🔐</div>

          <h1 className="password-verification-title">새 비밀번호 설정</h1>
          <p className="password-verification-description">
            안전한 비밀번호로 변경해 주세요
          </p>

          <form onSubmit={handleSubmit} className="password-verification-form">
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                새 비밀번호
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="새 비밀번호를 입력하세요"
                value={password}
                onChange={handlePasswordChange}
                className="form-input"
                disabled={loading}
                required
              />

              {/* 비밀번호 조건별 체크 UI */}
              <div className="password-requirements">
                <div className={`requirement ${hasUpper ? "valid" : ""}`}>
                  <span className="requirement-icon">
                    {hasUpper ? "✓" : "○"}
                  </span>
                  <span className="requirement-text">영문 대문자 포함</span>
                </div>
                <div className={`requirement ${hasLower ? "valid" : ""}`}>
                  <span className="requirement-icon">
                    {hasLower ? "✓" : "○"}
                  </span>
                  <span className="requirement-text">영문 소문자 포함</span>
                </div>
                <div className={`requirement ${hasNumber ? "valid" : ""}`}>
                  <span className="requirement-icon">
                    {hasNumber ? "✓" : "○"}
                  </span>
                  <span className="requirement-text">숫자 포함</span>
                </div>
                <div className={`requirement ${hasSpecial ? "valid" : ""}`}>
                  <span className="requirement-icon">
                    {hasSpecial ? "✓" : "○"}
                  </span>
                  <span className="requirement-text">특수문자 포함</span>
                </div>
                <div className={`requirement ${hasLength ? "valid" : ""}`}>
                  <span className="requirement-icon">
                    {hasLength ? "✓" : "○"}
                  </span>
                  <span className="requirement-text">8자 이상</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="passwordConfirm" className="form-label">
                새 비밀번호 확인
              </label>
              <input
                type="password"
                id="passwordConfirm"
                name="passwordConfirm"
                placeholder="새 비밀번호를 다시 입력하세요"
                value={passwordConfirm}
                onChange={handlePasswordConfirmChange}
                onBlur={handlePasswordCheckBlur}
                className={`form-input ${
                  passwordConfirm.length > 0 && password !== passwordConfirm
                    ? "error"
                    : ""
                }`}
                disabled={loading}
                required
              />
              {passwordConfirm.length > 0 && password !== passwordConfirm && (
                <span className="form-error">비밀번호가 일치하지 않습니다</span>
              )}
            </div>

            {error && <div className="password-verification-error">{error}</div>}

            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              disabled={!isValid || loading}
            >
              {loading ? "변경 중..." : "비밀번호 변경"}
            </Button>

            <div className="password-verification-footer">
              <button
                className="password-verification-back-link"
                onClick={(e) => {
                  e.preventDefault()
                  navigate("/login")
                }}
                type="button"
                disabled={loading}
              >
                로그인으로 돌아가기
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
