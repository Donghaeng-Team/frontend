import axios from "axios"
import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

interface passwordVerify {
  email?: string
  token?: string
  type : "PASSWORD"
  password: String
  passwordConfirm: String
}

export default function PasswordVerification() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get("token")
  const email = searchParams.get("email")

  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [error, setError] = useState("")
  const [isValid, setIsValid] = useState(false)

  // URL 파라미터 검증
  if (!token || !email) {
    navigate("/login")
    return null
  }

  //유효성 검사
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

  //비밀번호 변경
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
  }

  // 비밀번호 확인 입력 후 포커스 아웃 시 검사
  const handlePasswordCheckBlur = () => {
    if (passwordConfirm && password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.")
    } else {
      setError("")
    }
  }

  //Form제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await axios.post(
        "http://localhost:8080/api/v1/user/public/password/confirm-reset",
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
      window.alert("비밀번호 변경에 실패하였습니다.")
    }
    // 1초 후 로그인 페이지로 이동
  }
  return (
    <div>
      <div>
        <h2>새 비밀번호 설정</h2>
        <p>새로운 비밀번호를 입력해 주세요</p>
        <form onSubmit={handleSubmit}>
          <div>
            <label>새 비밀번호</label>
            <input
              type="password"
              placeholder="새 비밀번호를 입력하세요"
              value={password}
              onChange={handlePasswordChange}
              required
            />
            {/* 비밀번호 조건별 체크 UI */}
            <div className="mt-2 space-y-1 text-xs">
              <div>{hasUpper ? "✔" : "✖"} 영문 대문자 포함</div>
              <div>{hasLower ? "✔" : "✖"} 영문 소문자 포함</div>
              <div>{hasNumber ? "✔" : "✖"} 숫자 포함</div>
              <div>{hasSpecial ? "✔" : "✖"} 특수문자 포함</div>
              <div>{hasLength ? "✔" : "✖"} 8자 이상</div>
            </div>
          </div>

          <div>
            <label>새 비밀번호 확인</label>
            <input
              type="password"
              placeholder="새 비밀번호를 다시 입력하세요"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              onBlur={handlePasswordCheckBlur}
              required
            />
            {passwordConfirm.length > 0 && password !== passwordConfirm && (
              <p>비밀번호가 일치하지 않습니다</p>
            )}
          </div>

          {error && <div>{error}</div>}
          <button type="submit" disabled={!isValid}>
            비밀번호 변경
          </button>
          <div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                navigate("/login")
              }}
            >
              로그인으로 돌아가기
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
