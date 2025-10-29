import axios from "axios"

const handleAuth = async () => {
  try {
    console.log("refresh API 호출 시작")
    const response = await axios.post(
      "https://bytogether.net/api/v1/user/public/refresh",
      {},
      {
        withCredentials: true,
      }
    )
    console.log("응답 전체:", response)
    console.log("응답 헤더:", response.headers)
    console.log("응답 데이터:", response.data)
    const accessTokenStr = response.headers["Authorization"]
    const accessToken = accessTokenStr.replace("Bearer ", "")
    localStorage.setItem("accessToken", accessToken)
    console.log(accessToken)
    return true
    //로그인 시도 필요
  } catch (error) {
    console.log(error)
    return false
  }
}

export default handleAuth
