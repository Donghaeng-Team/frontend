import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import "./styles/reset.css"

// Pages
import Main from "./pages/Main"
import { Login } from "./pages/Login"
import LoginForm from "./pages/LoginForm"
import SignUp from "./pages/SignUp"
import MyPage from "./pages/MyPage"
import ProductList from "./pages/ProductList"
import ProductDetail from "./pages/ProductDetail"
import ProductRegister from "./pages/ProductRegister"
import ProductEdit from "./pages/ProductEdit"
import CommunityBoard from "./pages/CommunityBoard"
import CommunityPostCreate from "./pages/CommunityPostCreate"
import CommunityPostDetail from "./pages/CommunityPostDetail"
import CommunityPostEdit from "./pages/CommunityPostEdit"
import PurchaseHistory from "./pages/PurchaseHistory"
import ChangePassword from "./pages/ChangePassword"
import ComponentShowcase from "./pages/ComponentShowcase"
import Callback from "./pages/Auth/Callback"
import EMailVerification from "./pages/EmailVerification/EmailVerification"
import PasswordVerification from "./pages/PasswordVerification/PasswordVerification"


// Components
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* 메인 페이지 */}
        <Route path="/" element={<Main />} />

        {/* 인증 관련 */}
        <Route path="/login" element={<Login />} />
        <Route path="/login-form" element={<LoginForm />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/auth/callback" element={<Callback />} />
        <Route path="/verify/email" element={<EMailVerification />} />
        <Route path="/verify/password" element={<PasswordVerification />} />
        <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />

        {/* 마이페이지 */}
        <Route path="/mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
        <Route path="/purchase-history" element={<ProtectedRoute><PurchaseHistory /></ProtectedRoute>} />

        {/* 상품 관련 */}
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/register" element={<ProtectedRoute><ProductRegister /></ProtectedRoute>} />
        <Route path="/products/create" element={<ProtectedRoute><ProductRegister /></ProtectedRoute>} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/products/:id/edit" element={<ProtectedRoute><ProductEdit /></ProtectedRoute>} />

        {/* 커뮤니티 */}
        <Route path="/community" element={<CommunityBoard />} />
        <Route path="/community/create" element={<ProtectedRoute><CommunityPostCreate /></ProtectedRoute>} />
        <Route path="/community/:id" element={<CommunityPostDetail />} />
        <Route path="/community/:id/edit" element={<ProtectedRoute><CommunityPostEdit /></ProtectedRoute>} />

        {/* 개발용 컴포넌트 쇼케이스 */}
        <Route path="/showcase" element={<ComponentShowcase />} />

        {/* 404 페이지 */}
        <Route path="*" element={<div>페이지를 찾을 수 없습니다.</div>} />
      </Routes>
    </Router>
  )
}

export default App
