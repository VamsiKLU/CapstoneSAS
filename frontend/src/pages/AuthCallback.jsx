import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

// The backend redirects directly to /dashboard after GitHub callback.
// This component is kept as a safety net and for future OAuth flows
// that redirect to the frontend with a token.
export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkSession } = useAuth();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      navigate(`/auth/error?reason=${encodeURIComponent(error)}`, { replace: true });
      return;
    }
    // Re-check session then navigate
    checkSession().then(() => {
      navigate("/dashboard", { replace: true });
    });
  }, [searchParams, navigate, checkSession]);

  return <Loader fullScreen message="Completing sign-in..." />;
}
