import axios from "axios"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Button from "../../components/Button"
import "./PasswordResetRequest.css"

export default function PasswordResetRequest() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const validateEmail = (email: string): boolean => {
    if (!email) {
      setError("이메일을 입력해주세요.")
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("올바른 이메일 형식을 입력해주세요.")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateEmail(email)) {
      return
    }

    setLoading(true)

    try {
      const response = await axios.post(
        "https://bytogether.net/api/v1/user/public/password/request-reset",
        {
          email: email,
        }
      )

      if (response.status === 200) {
        window.alert(
          "비밀번호 재설정 이메일이 발송되었습니다. 이메일을 확인해주세요."
        )
        navigate("/login")
      }
    } catch (e) {
      console.error(e)
      setError("비밀번호 재설정 요청에 실패했습니다. 이메일을 확인해주세요.")
    } finally {
      setLoading(false)
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (error) {
      setError("")
    }
  }

  return (
    <div className="password-reset-request-page">
      <div className="password-reset-request-container">
        <div className="password-reset-request-box">
          <button
            className="password-reset-request-back-button"
            onClick={() => navigate("/login-form")}
            type="button"
          >
            ← 돌아가기
          </button>

          <div className="password-reset-request-logo">🛒 함께 사요</div>

          <h1 className="password-reset-request-title">비밀번호 찾기</h1>

          <p className="password-reset-request-description">
            가입하신 이메일 주소를 입력하시면
            <br />
            비밀번호 재설정 링크를 보내드립니다.
          </p>

          <form onSubmit={handleSubmit} className="password-reset-request-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                이메일
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleEmailChange}
                className={`form-input ${error ? "error" : ""}`}
                placeholder="이메일을 입력하세요"
                disabled={loading}
                required
              />
              {error && <span className="form-error">{error}</span>}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              disabled={loading}
            >
              {loading ? "발송 중..." : "재설정 링크 받기"}
            </Button>
          </form>

          <div className="password-reset-request-footer">
            <p className="password-reset-request-text">
              이메일이 기억나지 않으시나요?
            </p>
            <button
              className="password-reset-request-link"
              onClick={() => navigate("/signup")}
              type="button"
            >
              새로 가입하기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
