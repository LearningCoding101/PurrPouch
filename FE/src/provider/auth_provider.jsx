import { createContext, useState, useEffect, useContext } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getUserInfo } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user && localStorage.getItem("token")) {
        try {
          // Get user info from backend to get the role
          const response = await getUserInfo();
          setUserRole(response.data.role);
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          localStorage.removeItem("token");
        }
      } else {
        setUserRole(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Clear user role when token is removed
  useEffect(() => {
    const handleStorageChange = () => {
      if (!localStorage.getItem("token")) {
        setUserRole(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);
  const value = {
    currentUser,
    userRole,
    setUserRole,
    isAdmin: userRole === "ADMIN",
    isStaff: userRole === "STAFF" || userRole === "ADMIN",
    isCustomer: userRole === "USER" || userRole === "CUSTOMER",
    isUser: userRole === "USER" || userRole === "CUSTOMER", // Backward compatibility
    isAuthenticated: !!currentUser && !!localStorage.getItem("token"),
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
