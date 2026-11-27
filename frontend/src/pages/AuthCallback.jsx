import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

/**
 * The Spring Boot backend handles the GitHub OAuth callback and redirects the browser
 * directly to /dashboard or /connect-github.
 *
 * This component is a safety net for any OAuth flows that land here.
 */
export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkSession, user } = useAuth();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      navigate(`/auth/error?reason=${encodeURIComponent(error)}`, { replace: true });
      return;
    }
    // Re-check session then route based on state
    checkSession().then(() => {
      if (!user) {
        navigate("/", { replace: true });
        return;
      }
      if (user.role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else if (user.githubConnected) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/connect-github", { replace: true });
      }
    });
  }, [searchParams, navigate, checkSession]);

  return <Loader fullScreen message="Completing sign-in..." />;
}
