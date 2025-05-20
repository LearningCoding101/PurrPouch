import React from "react";
import { Link } from "react-router-dom";
import { luckyTheme } from "../../theme/global_theme";

/**
 * Reusable PurrPouch logo component
 * @param {Object} props
 * @param {string|number} props.size - Font size (e.g., '1.5rem', 24, etc.)
 * @param {boolean} props.linkToHome - Whether logo should link to home page
 * @param {string} props.className - Additional CSS class
 * @param {Object} props.style - Additional inline styles
 * @returns {JSX.Element} Logo component
 */
function Logo({
  size = "1.5rem",
  linkToHome = true,
  className = "",
  style = {},
}) {
  // Convert numeric sizes to string with rem units
  const fontSize = typeof size === "number" ? `${size / 16}rem` : size;

  const logoContent = (
    <div
      style={{
        fontWeight: "bold",
        fontSize: fontSize,
        fontFamily: luckyTheme.typography.fontFamily.heading,
        display: "flex",
        ...style,
      }}
      className={className}
    >
      <div style={{ color: "#EEBFBF" }}>PURR</div>
      <div style={{ color: "#5A87C5" }}>POUCH</div>
    </div>
  );

  if (linkToHome) {
    return (
      <Link
        to="/"
        style={{ color: "black", textDecoration: "none", display: "flex" }}
      >
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}

export default Logo;
