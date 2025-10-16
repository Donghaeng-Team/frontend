import { useNavigate, useSearchParams } from "react-router-dom"
import { useState, useEffect } from "react"
// import handleAuth from "../../utils/functions/authfunction"

const Callback = () => {
  const [status, setStatus] = useState<"loading" | "success" | "fail">(
    "loading"
  )
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const provider = searchParams.get("provider")
  const accessToken = searchParams.get("access_token")
  console.log(provider)

  useEffect(() => {
    if (!provider || !accessToken) {
      console.log("프로바이더 토큰 부존재 오류")
      setStatus("fail")
      setError(
        "요청하신 로그인이 정상적으로 처리되지 않았습니다. 다시 시도해주세요"
      )
      return
    }

    if (provider != "kakao" && provider != "google") {
      console.log(accessToken)
      setStatus("fail")
      setError("허용된 Oauth Provider가 아닙니다")
      console.log("프로바이더 오류")
    }
    console.log("오류검증 완료 ")
    const processAuth = async () => {
      // const success = await handleAuth(), refreshToken을 사용한 정식 검증과정 추후 추가 (cors오류발생, login전환시)
      setStatus("success")
      setTimeout(() => navigate("/"), 2000)
    }
    localStorage.setItem("accessToken", accessToken)
    console.log("✅ 토큰 저장 완료")
    processAuth()
  }, [provider])

  return (
    <div>
      <div>{status}</div>
    </div>
  )
}
export default Callback
