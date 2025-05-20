import React from "react";
import { Link } from "react-router-dom";
import { splineTheme } from "../../theme/global_theme";
import Logo from "./Logo";

/**
 * Footer component with three columns of equal width, centered content
 * @returns {JSX.Element} Footer component
 */
function Footer() {
  // Style constants for consistent column styling
  const columnStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "0 1rem",
    justifyContent: "center", // Changed from flex-start to center for vertical alignment
    alignItems: "flex-start",
    textAlign: "left",
  };

  const headingStyle = {
    marginBottom: "1.5rem",
    fontFamily: splineTheme.typography.fontFamily.heading,
  };

  return (
    <footer
      style={{
        display: "flex",
        // width: "100%",
        color: "black",
        padding: "2rem",
        backgroundColor: "white",
        borderTop: "1px solid #e0e0e0",
        boxShadow: "0 -2px 4px rgba(0,0,0,0.05)",
        fontFamily: splineTheme.typography.fontFamily.body,
        position: "relative",
        alignItems: "center", // Added to vertically center the columns in the footer
      }}
    >
      {/* Top divider */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          backgroundColor: "#e0e0e0",
        }}
      ></div>
      {/* Left/First Column */}{" "}
      <div style={{ ...columnStyle, height: "250px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "center",
          }}
        >
          <Logo
            size="2.5rem"
            linkToHome={true}
            style={{ marginBottom: "1.5rem" }}
          />
          <h3 style={headingStyle}>Contact Us</h3>
          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              justifyContent: "flex-start",
              marginTop: "1rem",
            }}
          >
            {/* Placeholder for 4 SVG logos */}
            <div
              style={{
                width: "30px",
                height: "30px",
                backgroundColor: "#e0e0e0",
                borderRadius: "50%",
              }}
            ></div>
            <div
              style={{
                width: "30px",
                height: "30px",
                backgroundColor: "#e0e0e0",
                borderRadius: "50%",
              }}
            ></div>
            <div
              style={{
                width: "30px",
                height: "30px",
                backgroundColor: "#e0e0e0",
                borderRadius: "50%",
              }}
            ></div>{" "}
            <div
              style={{
                width: "30px",
                height: "30px",
                backgroundColor: "#e0e0e0",
                borderRadius: "50%",
              }}
            ></div>
          </div>
        </div>
      </div>
      {/* Middle/Second Column */}
      <div style={{ ...columnStyle, height: "250px" }}>
        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-evenly", // Changed from space-between to space-evenly for better vertical distribution
          }}
        >
          <Link to="/" style={{ color: "black", textDecoration: "none" }}>
            Lorem ipsum dolor sit amet
          </Link>
          <Link to="/about" style={{ color: "black", textDecoration: "none" }}>
            Consectetur adipiscing elit
          </Link>
          <Link
            to="/services"
            style={{ color: "black", textDecoration: "none" }}
          >
            Sed do eiusmod tempor
          </Link>
          <Link
            to="/products"
            style={{ color: "black", textDecoration: "none" }}
          >
            Ut labore et dolore magna
          </Link>
          <Link
            to="/contact"
            style={{ color: "black", textDecoration: "none" }}
          >
            Aliqua ut enim ad minim
          </Link>
        </div>
      </div>
      {/* Right/Third Column */}{" "}
      <div style={{ ...columnStyle, height: "250px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "space-evenly", // Changed from space-between to space-evenly for better vertical distribution
          }}
        >
          <p>123 Kitty Lane</p>
          <p>Cat City, CC 12345</p>
          <p>Phone: (555) 123-4567</p>
          <p>Email: info@purrpouch.com</p>
          <p>Hours: 9AM - 6PM</p>
          <p>Weekends: 10AM - 4PM</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
