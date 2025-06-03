import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../firebase";
import axios from "axios";
import PageWrapper from "./global/PageWrapper";
import FontStyles from "../theme/FontStyles";

function ForgotPassword() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1=method selection, 2=phone verification, 3=email verification, 4=reset password
  const [method, setMethod] = useState(""); // 'phone' or 'email'
  const [confirmationResult, setConfirmationResult] = useState(null);
  const navigate = useNavigate();

  // Initialize reCAPTCHA verifier
  const setupRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "normal",
        callback: () => {
          // reCAPTCHA solved, allow sending verification code
        },
        "expired-callback": () => {
          // Reset reCAPTCHA
        },
      }
    );
  };

  const handleMethodSelect = (selectedMethod) => {
    setMethod(selectedMethod);
    setStep(selectedMethod === "phone" ? 2 : 3);
    setError("");
    if (selectedMethod === "phone") {
      setTimeout(() => {
        setupRecaptcha();
      }, 500);
    }
  };

  const handleSendPhoneVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      let formattedPhoneNumber = phoneNumber;
      // Format phone number to international format if not already
      if (!phoneNumber.startsWith("+")) {
        formattedPhoneNumber = phoneNumber.startsWith("0")
          ? "+84" + phoneNumber.substring(1)
          : "+84" + phoneNumber;
      }

      // Check if phone number exists in system
      const checkResponse = await axios.get(
        `http://localhost:8080/api/auth/phone/check-phone?phoneNumber=${encodeURIComponent(
          formattedPhoneNumber
        )}`
      );

      if (!checkResponse.data.exists) {
        setError("No account found with this phone number");
        setLoading(false);
        return;
      }

      // Send verification code using Firebase
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(
        auth,
        formattedPhoneNumber,
        appVerifier
      );
      setConfirmationResult(confirmation);
      setMessage("Verification code sent! Please check your phone.");
      setStep(4); // Move to verification code input
    } catch (error) {
      console.error("Error sending verification:", error);
      setError(
        error.message || "Failed to send verification code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmailVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Send password reset code via email
      const response = await axios.post(
        "http://localhost:8080/api/auth/email/forgot-password",
        { email }
      );
      setMessage("Password reset instructions sent to your email!");
      setStep(4); // Move to verification code input
    } catch (error) {
      console.error("Error sending email:", error);
      setError(
        error.response?.data?.message ||
          "Failed to send email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (method === "phone") {
        // Verify code with Firebase
        await confirmationResult.confirm(verificationCode);
        setMessage("Phone number verified successfully!");
        setStep(5); // Move to new password input
      } else {
        // Verify email code with backend
        const response = await axios.post(
          "http://localhost:8080/api/auth/email/verify-reset-code",
          {
            email,
            verificationCode,
          }
        );
        setMessage("Verification successful!");
        setStep(5); // Move to new password input
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      setError(error.message || "Invalid verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (method === "phone") {
        let formattedPhoneNumber = phoneNumber;
        if (!phoneNumber.startsWith("+")) {
          formattedPhoneNumber = phoneNumber.startsWith("0")
            ? "+84" + phoneNumber.substring(1)
            : "+84" + phoneNumber;
        }

        // Reset password with backend
        const response = await axios.post(
          "http://localhost:8080/api/auth/phone/reset-password",
          {
            phoneNumber: formattedPhoneNumber,
            verificationCode,
            newPassword,
          }
        );

        setMessage("Password reset successfully!");
        setTimeout(() => {
          navigate("/login", {
            state: {
              message:
                "Password has been reset. Please log in with your new password.",
            },
          });
        }, 2000);
      } else {
        // Reset password for email
        const response = await axios.post(
          "http://localhost:8080/api/auth/email/reset-password",
          {
            email,
            verificationCode,
            newPassword,
          }
        );

        setMessage("Password reset successfully!");
        setTimeout(() => {
          navigate("/login", {
            state: {
              message:
                "Password has been reset. Please log in with your new password.",
            },
          });
        }, 2000);
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setError(
        error.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FontStyles />
      <PageWrapper>
        <div
          style={{
            maxWidth: "500px",
            margin: "40px auto",
            padding: "30px",
            backgroundColor: "white",
            borderRadius: "10px",
            boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
            fontFamily: "'Spline Sans', sans-serif",
          }}
        >
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "600",
              color: "#4285f4",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            Forgot Password
          </h1>

          {error && (
            <div
              style={{
                padding: "12px",
                backgroundColor: "#FDECEA",
                color: "#B71C1C",
                borderRadius: "5px",
                marginBottom: "20px",
              }}
            >
              {error}
            </div>
          )}

          {message && (
            <div
              style={{
                padding: "12px",
                backgroundColor: "#E8F5E9",
                color: "#1B5E20",
                borderRadius: "5px",
                marginBottom: "20px",
              }}
            >
              {message}
            </div>
          )}

          {/* Step 1: Method Selection */}
          {step === 1 && (
            <div>
              <p style={{ marginBottom: "25px", textAlign: "center" }}>
                Select a method to reset your password:
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  justifyContent: "center",
                  marginBottom: "30px",
                }}
              >
                <button
                  onClick={() => handleMethodSelect("phone")}
                  style={{
                    flex: 1,
                    padding: "15px 20px",
                    backgroundColor: "#4285f4",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span style={{ fontSize: "24px" }}>📱</span>
                  Phone Number
                </button>

                <button
                  onClick={() => handleMethodSelect("email")}
                  style={{
                    flex: 1,
                    padding: "15px 20px",
                    backgroundColor: "#4285f4",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span style={{ fontSize: "24px" }}>✉️</span>
                  Email
                </button>
              </div>

              <div style={{ textAlign: "center" }}>
                <Link
                  to="/login"
                  style={{ color: "#4285f4", textDecoration: "none" }}
                >
                  Back to login
                </Link>
              </div>
            </div>
          )}

          {/* Step 2: Phone Verification */}
          {step === 2 && (
            <form onSubmit={handleSendPhoneVerification}>
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "500",
                  }}
                >
                  Enter your phone number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+84 xxx xxx xxx"
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "1rem",
                  }}
                />
                <small
                  style={{ display: "block", marginTop: "5px", color: "#666" }}
                >
                  Enter your phone number with country code (e.g., +84)
                </small>
              </div>

              <div
                id="recaptcha-container"
                style={{ marginBottom: "20px" }}
              ></div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "15px",
                  backgroundColor: "#4285f4",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  cursor: loading ? "default" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  marginBottom: "20px",
                }}
              >
                {loading ? "Sending..." : "Send Verification Code"}
              </button>

              <div style={{ textAlign: "center" }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#4285f4",
                    cursor: "pointer",
                  }}
                >
                  Back
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Email Verification */}
          {step === 3 && (
            <form onSubmit={handleSendEmailVerification}>
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "500",
                  }}
                >
                  Enter your email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "1rem",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "15px",
                  backgroundColor: "#4285f4",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  cursor: loading ? "default" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  marginBottom: "20px",
                }}
              >
                {loading ? "Sending..." : "Send Reset Instructions"}
              </button>

              <div style={{ textAlign: "center" }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#4285f4",
                    cursor: "pointer",
                  }}
                >
                  Back
                </button>
              </div>
            </form>
          )}

          {/* Step 4: Verification Code Input */}
          {step === 4 && (
            <form onSubmit={handleVerifyCode}>
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "500",
                  }}
                >
                  Enter verification code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "1.5rem",
                    letterSpacing: "0.5rem",
                    textAlign: "center",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "15px",
                  backgroundColor: "#4285f4",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  cursor: loading ? "default" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  marginBottom: "20px",
                }}
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>

              <div style={{ textAlign: "center" }}>
                <button
                  type="button"
                  onClick={() => setStep(method === "phone" ? 2 : 3)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#4285f4",
                    cursor: "pointer",
                  }}
                >
                  Back
                </button>
              </div>
            </form>
          )}

          {/* Step 5: New Password Input */}
          {step === 5 && (
            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "500",
                  }}
                >
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "1rem",
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "500",
                  }}
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "1rem",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "15px",
                  backgroundColor: "#4285f4",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  cursor: loading ? "default" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  marginBottom: "20px",
                }}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </PageWrapper>
    </>
  );
}

export default ForgotPassword;
