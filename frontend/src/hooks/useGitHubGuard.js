import { useAuth } from "../context/AuthContext";
import { useNotification } from "../components/Notification";

/**
 * Returns a guard function for developer operations.
 * If GitHub is not connected, shows a notification and returns false.
 * Usage:
 *   const guard = useGitHubGuard();
 *   const handleAction = () => { if (!guard()) return; };
 */
export function useGitHubGuard() {
  const { isDeveloper, isGithubConnected } = useAuth();
  const { warning } = useNotification();

  return function checkGitHub() {
    if (isDeveloper && !isGithubConnected) {
      warning("Connect your GitHub account to continue.");
      return false;
    }
    return true;
  };
}
