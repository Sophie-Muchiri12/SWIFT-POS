import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { token, isAuthenticated, isLoading } = useSelector((state) => state.auth);

  // Check if auth state is still being loaded (from localStorage or API)
  if (isLoading) {
    return <div>Loading...</div>; 
  }

  // console.log("ProtectedRoute check - Token:", token, "Authenticated:", isAuthenticated);

  // If not authenticated or token is missing, redirect to login page
  if (!token || !isAuthenticated) {
    console.log("Redirecting to login...");
    return <Navigate to="/landing-page" replace />;
  }

  return children;
};

export default ProtectedRoute;