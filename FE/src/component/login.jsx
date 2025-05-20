import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  getIdToken,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { login, loginWithGoogle, getUserInfo } from "../services/api";
import { useAuth } from "../provider/auth_provider";
import PageWrapper from "./global/PageWrapper";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUserRole } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Login with email/password
      const response = await login(email, password);
      localStorage.setItem("token", response.data.token);

      // Get user info to set role
      const userInfo = await getUserInfo();
      setUserRole(userInfo.data.role);

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

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

      navigate("/dashboard");
    } catch (err) {
      setError("Google authentication failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <PageWrapper>
      <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
        <h2>Login</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                display: "block",
                width: "100%",
                padding: "8px",
                marginTop: "5px",
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                display: "block",
                width: "100%",
                padding: "8px",
                marginTop: "5px",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#4285f4",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginBottom: "10px",
            }}
          >
            Login
          </button>
        </form>
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "white",
            color: "#757575",
            border: "1px solid #ddd",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Login with Google
        </button>{" "}
        <p style={{ marginTop: "20px", textAlign: "center" }}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </PageWrapper>
  );
}

export default Login;
