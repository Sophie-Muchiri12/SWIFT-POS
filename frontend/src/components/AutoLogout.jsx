import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout, updateLastActivity } from "../redux/slices/authenticationSlice";

const AutoLogout = () => {
  const dispatch = useDispatch();
  const { lastActivity, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) return;

    const checkInactivity = () => {
      const currentTime = Date.now();
    // Inactive time of 60 minutes
      const INACTIVITY_LIMIT = 60 * 60 * 1000; 

      if (currentTime - lastActivity > INACTIVITY_LIMIT) {
        console.log("User inactive. Logging out...");
        dispatch(logout());
      }
    };

    // Check every 5 seconds
    const interval = setInterval(checkInactivity, 5000); 

    return () => clearInterval(interval);
  }, [lastActivity, isAuthenticated, dispatch]);

  // Event listeners to track activity
  useEffect(() => {
    if (!isAuthenticated) return;

    const resetTimer = () => dispatch(updateLastActivity());

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);

    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, [isAuthenticated, dispatch]);

  return null;
};

export default AutoLogout;