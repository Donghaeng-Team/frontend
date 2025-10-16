import { useState } from "react"
import Input from "../../components/Input"
import Button from "../../components/Button"
import "./ChangePassword.css"

const ChangePassword = () => {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const PASSWORD_REGEX =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/

  const handleInputChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setPasswords((prev) => ({
        ...prev,
        [field]: e.target.value,
      }))

      // 에러 초기화
      if (errors[field as keyof typeof errors]) {
        setErrors((prev) => ({
          ...prev,
          [field]: "",
        }))
      }
    }

  const validateForm = () => {
    const newErrors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }
    let isValid = true

    // 현재 비밀번호 검증
    if (!passwords.currentPassword) {
      newErrors.currentPassword = "현재의 비밀번호를 입력해주세요"
      isValid = false
    } else if (!PASSWORD_REGEX.test(passwords.currentPassword)) {
      newErrors.currentPassword =
        "비밀번호는 8자이상, 영문 대소문자, 특수문자 반드시 포함"
      isValid = false
    }
    // 새 비밀번호 검증
    if (!passwords.newPassword) {
      newErrors.newPassword = "새 비밀번호를 입력해주세요"
      isValid = false
    } else if (!PASSWORD_REGEX.test(passwords.newPassword)) {
      newErrors.newPassword =
        "비밀번호는 8자이상, 영문 대소문자, 특수문자 반드시 포함"
      isValid = false
    }

    // 비밀번호 확인 검증
    if (!passwords.confirmPassword) {
      newErrors.confirmPassword = "비밀번호를 다시 입력해주세요"
      isValid = false
    } else if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다"
      isValid = false
    }
    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // 비밀번호 변경 처리
    console.log("비밀번호 변경:", passwords.newPassword)
    alert("비밀번호가 변경되었습니다!")

    // 폼 초기화
    setPasswords({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
  }

  const handleCancel = () => {
    // 폼 초기화
    setPasswords({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
    setErrors({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })

    // 이전 페이지로 이동 또는 마이페이지로 이동
    window.history.back()
  }

  return (
    <div className="change-password-page">
      <div className="change-password-container">
        <div className="change-password-box">
          {/* 페이지 제목 */}
          <h1 className="change-password-title">비밀번호 변경</h1>

          {/* 비밀번호 변경 폼 */}
          <form onSubmit={handleSubmit} className="change-password-form">
            {/* 현재 비밀번호 */}
            <div className="password-field">
              <label className="password-label">현재 비밀번호(확인)</label>
              <Input
                type="password"
                name="currentPassword"
                placeholder="현재 비밀번호 입력(8자 이상, 영문대소문자, 숫자, 특수문자 반드시 포함)"
                value={passwords.currentPassword}
                onChange={handleInputChange("currentPassword")}
                error={errors.currentPassword}
                fullWidth
                variant="filled"
              />
            </div>

            {/* 새 비밀번호 */}
            <div className="password-field">
              <label className="password-label">새 비밀번호</label>
              <Input
                type="password"
                name="newPassword"
                placeholder="비밀번호 입력(8자 이상, 영문대소문자, 숫자, 특수문자 반드시 포함)"
                value={passwords.newPassword}
                onChange={handleInputChange("newPassword")}
                error={errors.newPassword}
                fullWidth
                variant="filled"
              />
            </div>

            {/* 새 비밀번호 확인 */}
            <div className="password-field">
              <label className="password-label">새 비밀번호 확인</label>
              <Input
                type="password"
                name="confirmPassword"
                placeholder="새 비밀번호를 다시 입력하세요"
                value={passwords.confirmPassword}
                onChange={handleInputChange("confirmPassword")}
                error={errors.confirmPassword}
                fullWidth
                variant="filled"
              />
            </div>

            {/* 버튼 그룹 */}
            <div className="change-password-buttons">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                className="cancel-button"
              >
                취소
              </Button>
              <Button type="submit" variant="primary" className="submit-button">
                비밀번호 변경
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChangePassword
