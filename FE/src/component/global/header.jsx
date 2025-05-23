import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { splineTheme } from "../../theme/global_theme";
import Logo from "./Logo";
import { useAuth } from "../../provider/auth_provider";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";

function Header() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("token");
      navigate("/login");
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };
  return (
    <header
      style={{
        display: "flex",
        // width: "100%",
        backgroundColor: "#FFFFFF",
        color: "black",
        padding: "1rem 2rem",
        position: "sticky",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      {/* Left Container with 4 smaller containers */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "20px",
            alignItems: "center",
            fontFamily: splineTheme.typography.fontFamily.heading,
          }}
        >
          {" "}
          <div>
            <Link
              to="/about-us"
              style={{ color: "black", textDecoration: "none" }}
            >
              About us
            </Link>
          </div>
          <div>
            <Link
              to="/products"
              style={{ color: "black", textDecoration: "none" }}
            >
              Menu
            </Link>
          </div>{" "}
          <div>
            <Link
              to="/cat-profile"
              style={{ color: "black", textDecoration: "none" }}
            >
              Cat Profile
            </Link>
          </div>
          <div>
            <Link
              to="/about"
              style={{ color: "black", textDecoration: "none" }}
            >
              Plan
            </Link>
          </div>
        </div>
      </div>{" "}
      {/* Middle Container */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Logo size="1.5rem" />
      </div>{" "}
      {/* Right Container with person icon, sign in button, and shopping cart */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-evenly",
            alignItems: "center",
          }}
        >
          <div>
            <Link
              to="/account"
              style={{ color: "black", textDecoration: "none" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </Link>
          </div>
          <div>
            <Link to="/cart" style={{ color: "black", textDecoration: "none" }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </Link>
          </div>{" "}
          <div>
            {isAuthenticated ? (
              <button
                onClick={handleSignOut}
                style={{
                  backgroundColor: "#E74C3C",
                  color: "white",
                  textDecoration: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  fontWeight: "500",
                  fontFamily: splineTheme.typography.fontFamily.body,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Sign out
              </button>
            ) : (
              <Link
                to="/login"
                style={{
                  backgroundColor: "#5A87C5",
                  color: "white",
                  textDecoration: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  fontWeight: "500",
                  fontFamily: splineTheme.typography.fontFamily.body,
                }}
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
