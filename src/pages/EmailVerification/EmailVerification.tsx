import axios from "axios"
import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

interface EMailVerify {
  email?: string
  token?: string
  VerifyType: "EMAIL" | "PASSWORD"
}

export default function EMailVerification() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get("token")
  const email = searchParams.get("email")

  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  // URL 파라미터 검증
  useEffect(() => {
    const verifyEmail = async () => {
      if (!token || !email) {
        window.alert("메일 인증에 실패하였습니다. 다시 시도해주십시오. ")
        navigate("/login")
        return
      }
      try {
        const response = await axios.post(
          "https://bytogether.net/api/v1/user/public/verify",
          {
            email: email,
            token: token,
            type: "EMAIL",
          }
        )
        if (response.status === 200) {
          window.alert("이메일 인증이 완료되었습니다")
          setSuccess(true)
          navigate("/login")
        }
      } catch (e) {
        console.error(e)
        window.alert("이 메일 인증에 실패하였습니다. 다시 시도해 주십시오.")
      }
    }
    verifyEmail()
  }, [token, email, navigate])

  return (
    <div>
      {success ? (
        <div>이메일 인증이 완료되었습니다. 로그인 페이지로 이동합니다. </div>
      ) : (
        <div>이메일 인증을 진행중입니다. 실패시 다시 시도해주십시오. </div>
      )}
    </div>
  )
}
