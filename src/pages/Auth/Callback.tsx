import { useNavigate, useSearchParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { useAuthStore } from "../../stores/authStore"

const Callback = () => {
  const [status, setStatus] = useState<"loading" | "success" | "fail">(
    "loading"
  )
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initializeAuth = useAuthStore((state) => state.initializeAuth)
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
      return
    }
    console.log("오류검증 완료 ")

    const processAuth = async () => {
      try {
        // 1. JWT 토큰 디코딩하여 내용 확인
        try {
          const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]))
          console.log("🔍 JWT 토큰 Payload:", tokenPayload)
        } catch (jwtError) {
          console.error("❌ JWT 디코딩 실패:", jwtError)
        }

        // 2. 토큰 저장
        localStorage.setItem("accessToken", accessToken)
        console.log("✅ 토큰 저장 완료, accessToken:", accessToken.substring(0, 20) + "...")

        // 2. authStore 초기화하여 사용자 정보 로드
        console.log("🔄 initializeAuth 호출 시작...")
        await initializeAuth()
        console.log("✅ 인증 상태 초기화 완료")

        // 3. 초기화 후 authStore 상태 확인
        const authState = useAuthStore.getState()
        console.log("🔍 OAuth 완료 후 authStore 상태:", {
          isAuthenticated: authState.isAuthenticated,
          user: authState.user
        })

        // 4. 성공 상태로 변경 및 리다이렉트
        setStatus("success")
        setTimeout(() => navigate("/"), 1000)
      } catch (error) {
        console.error("❌ OAuth 인증 처리 실패:", error)
        setStatus("fail")
        setError("인증 처리 중 오류가 발생했습니다.")
      }
    }

    processAuth()
  }, [provider, accessToken, initializeAuth, navigate])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center'
    }}>
      {status === 'loading' && (
        <>
          <h2>로그인 처리 중...</h2>
          <p>잠시만 기다려주세요.</p>
        </>
      )}
      {status === 'success' && (
        <>
          <h2>✅ 로그인 성공!</h2>
          <p>메인 페이지로 이동합니다...</p>
        </>
      )}
      {status === 'fail' && (
        <>
          <h2>❌ 로그인 실패</h2>
          <p style={{ color: '#f24d4d', marginTop: '10px' }}>{error}</p>
          <button
            onClick={() => navigate('/login')}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#ff5e2e',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            로그인 페이지로 돌아가기
          </button>
        </>
      )}
    </div>
  )
}
export default Callback
