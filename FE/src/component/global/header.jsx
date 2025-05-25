import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { splineTheme } from "../../theme/global_theme";
import Logo from "./Logo";
import { useAuth } from "../../provider/auth_provider";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";
import { getCartItems } from "../../services/api";

function Header() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    // Load cart items on component mount
    updateCartCount();

    // Add event listener for storage changes (for cart updates from other tabs)
    window.addEventListener("storage", handleStorageChange);

    // Set up interval to periodically check cart
    const interval = setInterval(updateCartCount, 5000); // Check every 5 seconds

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const updateCartCount = () => {
    const items = getCartItems();
    setCartItemCount(items.length);
  };

  const handleStorageChange = (e) => {
    if (e.key === "cart_items") {
      updateCartCount();
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
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
          </div>          <div>
            <Link to="/cart" style={{ color: "black", textDecoration: "none", position: "relative", display: "inline-block" }}>
              {/* Shopping Cart SVG Icon */}
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
                <path d="m1 1 4 4 13 2 1 8H7"></path>
              </svg>
              
              {/* Red Badge Circle */}
              {cartItemCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    backgroundColor: "#ff6b6b",
                    color: "white",
                    borderRadius: "50%",
                    width: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "bold",
                    fontFamily: splineTheme.typography.fontFamily.body,
                  }}
                >
                  {cartItemCount}
                </span>
              )}
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
