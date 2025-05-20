import React from "react";

const Navbar = () => {
  const navbarContainerStyle = {
    display: "flex",
    justifyContent: "space-evenly", // Changed from center to space-evenly for equal distribution
    alignItems: "center",
    backgroundColor: "#f2d4d4", // A light pink color close to the image
    borderRadius: "25px", // Rounded corners
    padding: "15px 20px", // Increased vertical padding by 50% (from 10px to 15px)
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Subtle shadow
    width: "50%", // Set to 50% of available width as requested
    margin: "20px auto", // Center the component
  };

  const navbarItemStyle = {
    color: "#fff", // White text
    fontFamily: "Arial, sans-serif", // Or your preferred font
    fontSize: "16px",
    fontWeight: "bold",
    padding: "0 15px", // Spacing around text
    cursor: "pointer",
    // Note: Hover effects with pure inline styles are tricky.
    // For production, consider CSS modules or a CSS-in-JS library.
  };

  const navbarDividerStyle = {
    width: "1px",
    backgroundColor: "#fff", // White divider
    height: "30px", // Increased height of the divider by 50% (from 20px to 30px)
    margin: "0 5px", // Spacing around the divider
  };

  return (
    <div style={navbarContainerStyle}>
      <div style={navbarItemStyle}>BLOGS</div>
      <div style={navbarDividerStyle}></div>
      <div style={navbarItemStyle}>ABOUT US</div>
      <div style={navbarDividerStyle}></div>
      <div style={navbarItemStyle}>NEWS</div>
    </div>
  );
};

export default Navbar;
