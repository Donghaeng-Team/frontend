import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../../utils/token';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * 인증이 필요한 라우트를 보호하는 컴포넌트
 * 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트됩니다.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    // 로그인 후 원래 페이지로 돌아가기 위해 현재 위치 저장
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
