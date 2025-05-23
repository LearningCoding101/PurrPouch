import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  getIdToken,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { login, loginWithGoogle, getUserInfo } from "../services/api";
import { useAuth } from "../provider/auth_provider";
import Header from "./global/header";
import Footer from "./global/footer";
import FontStyles from "../theme/FontStyles";
import catPaw from "../assets/image/login/cat_paw.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setUserRole } = useAuth();

  // Check for success message from registration
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [location]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      // Login with email/password
      const response = await login(email, password);
      localStorage.setItem("token", response.data.token);

      // Get user info to set role
      const userInfo = await getUserInfo();
      setUserRole(userInfo.data.role);

      // Redirect based on role
      if (userInfo.data.role === "USER") {
        navigate("/"); // Redirect to homepage for regular users
      } else {
        navigate("/dashboard"); // Redirect to dashboard for other roles
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      // Sign in with Google
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await getIdToken(result.user);

      // Authenticate with backend
      const response = await loginWithGoogle(idToken);
      localStorage.setItem("token", idToken);

      // Get user info to set role
      const userInfo = await getUserInfo();
      setUserRole(userInfo.data.role);

      // Redirect based on role
      if (userInfo.data.role === "USER") {
        navigate("/"); // Redirect to homepage for regular users
      } else {
        navigate("/dashboard"); // Redirect to dashboard for other roles
      }
    } catch (err) {
      setError("Google authentication failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  return (
    <>
      <FontStyles />
      <Header />{" "}
      <div
        style={{
          height: "calc(100vh - 72px - 250px)", // Exact height to account for header and footer
          backgroundColor: "#EEBFBF", // Light pink background
          display: "flex",
          padding:
            "20px 20px 0 20px" /* Remove bottom padding to allow image to sit flush with footer */,
          fontFamily: "'Spline Sans', sans-serif",
          position: "relative", // For positioning elements
          overflow: "hidden", // Prevent any overflow
        }}
      >
        {/* Left 50% Column with Centered Card */}
        <div
          style={{
            width: "50%",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          {" "}
          {/* White Card */}{" "}
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "50px 55px",
              display: "flex",
              flexDirection: "column",
              width: "90%",
              maxWidth: "495px" /* 450px + 10% */,
              borderRadius: "11px",
              boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
              fontFamily: "'Spline Sans', sans-serif",
              zIndex: "1",
            }}
          >
            <div>
              {" "}
              <h1
                style={{
                  fontSize: "3.3rem" /* 3rem + 10% */,
                  fontWeight: "600",
                  color: "#4285f4", // Blue color matching the design
                  marginBottom: "9px" /* 8px + 10% */,
                  fontFamily: "'Spline Sans', sans-serif",
                }}
              >
                Sign in
              </h1>{" "}
              <p
                style={{
                  fontSize: "1.2rem" /* 1.1rem + 10% */,
                  marginBottom: "33px" /* 30px + 10% */,
                  display: "flex",
                  alignItems: "center",
                  gap: "9px" /* 8px + 10% */,
                }}
              >
                <span style={{ color: "#4A5568" }}>or</span>{" "}
                <Link
                  to="/register"
                  style={{
                    color: "#f8a4a4", // Soft pink/salmon color as shown in design
                    textDecoration: "none",
                  }}
                >
                  create an account?
                </Link>
              </p>
            </div>
            {error && (
              <p style={{ color: "red", marginBottom: "15px" }}>{error}</p>
            )}
            {successMessage && (
              <p style={{ color: "green", marginBottom: "15px" }}>
                {successMessage}
              </p>
            )}
            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              <div style={{ marginBottom: "20px" }}>
                {" "}
                <input
                  type="email" // Keep as email for functionality, but use phone number label/placeholder
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Phone number"
                  style={{
                    width: "100%",
                    padding: "16.5px" /* 15px + 10% */,
                    border: "1px solid #E2E8F0",
                    borderRadius: "9px" /* 8px + 10% */,
                    fontSize: "1.1rem" /* 1rem + 10% */,
                    fontFamily: "'Spline Sans', sans-serif",
                    boxSizing: "border-box",
                    marginBottom: "16.5px" /* 15px + 10% */,
                  }}
                />
              </div>
              <div style={{ marginBottom: "20px", position: "relative" }}>
                {" "}
                <div style={{ position: "relative", marginBottom: "15px" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Password"
                    style={{
                      width: "100%",
                      padding: "16.5px" /* 15px + 10% */,
                      paddingRight: "44px" /* 40px + 10% */,
                      border: "1px solid #E2E8F0",
                      borderRadius: "9px" /* 8px + 10% */,
                      fontSize: "1.1rem" /* 1rem + 10% */,
                      fontFamily: "'Spline Sans', sans-serif",
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#718096",
                    }}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>{" "}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "25px",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: "#4A5568",
                    cursor: "pointer",
                    fontSize: "1rem",
                    fontFamily: "'Spline Sans', sans-serif",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    style={{
                      marginRight: "8px",
                      width: "16px",
                      height: "16px",
                    }}
                  />
                  Remember me
                </label>
                <Link
                  to="/forgot-password"
                  style={{
                    color: "#4285f4", // Blue color matching the design
                    textDecoration: "none",
                    fontSize: "0.95rem",
                    fontFamily: "'Spline Sans', sans-serif",
                  }}
                >
                  Forgotten your password?
                </Link>
              </div>{" "}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "16.5px" /* 15px + 10% */,
                  backgroundColor: "#4285f4", // Blue color matching the design
                  color: "white",
                  border: "none",
                  borderRadius: "9px" /* 8px + 10% */,
                  fontSize: "1.2rem" /* 1.1rem + ~10% */,
                  fontWeight: "600",
                  cursor: "pointer",
                  marginBottom: "22px" /* 20px + 10% */,
                  fontFamily: "'Spline Sans', sans-serif",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                Sign in
              </button>
            </form>{" "}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              style={{
                width: "100%",
                padding: "15.5px" /* 14px + 10% */,
                backgroundColor: "white",
                color: "#4A5568",
                border: "1px solid #E2E8F0",
                borderRadius: "9px" /* 8px + 10% */,
                fontSize: "1.1rem" /* 1rem + 10% */,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontFamily: "'Spline Sans', sans-serif",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <span
                style={{
                  marginRight: "10px",
                  display: "inline-block",
                  width: "20px",
                  height: "20px",
                }}
              >
                <svg viewBox="0 0 48 48" width="20px" height="20px">
                  <path
                    fill="#FFC107"
                    d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                  />
                </svg>
              </span>
              Sign in with Google
            </button>
          </div>{" "}
        </div>{" "}
        {/* Right 50% Column with cat paw image */}
        <div
          style={{
            width: "50%",
            position: "relative",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            height: "100%",
            overflow: "visible" /* Allow image to overflow its container */,
          }}
        >
          <img
            src={catPaw}
            alt="Cat Paw"
            style={{
              position: "absolute",
              bottom: "0" /* Position at the bottom to sit flush with footer */,
              left: "50%" /* Center the image horizontally in the right column */,
              height: "100%" /* Make the image bigger */,
              width: "auto",
              maxWidth: "none" /* Remove max-width constraint */,
              objectFit: "contain",
              transform:
                "translateX(-50%)" /* Center horizontally by shifting left by half its width */,
              zIndex: "0",
            }}
          />
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Login;
