import React from "react";
import { splineTheme } from "../../theme/global_theme";

// Using an existing cat image temporarily
import catImage from "../../assets/image/homepage/cat_section2_1.png";

const NutritionalSetSection = () => {
  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%", // Take full width of the parent
    height: "100%", // Take full height of the parent
    padding: "20px",
    backgroundColor: "#fff",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    flexDirection: "row", // Default for larger screens
  };

  const leftStyle = {
    flex: 1,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    textAlign: "center",
  };

  const catImageStyle = {
    maxWidth: "100%",
    height: "auto",
    // borderRadius: "50%",
    // boxShadow: "0 0 15px rgba(0, 0, 0, 0.1)",
  };

  const rightStyle = {
    flex: 1,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
  };
  const titleStyle = {
    fontSize: "2.25em", // 10% smaller than original 2.5em
    color: "#5d5d81",
    marginBottom: "20px",
    textTransform: "uppercase",
    fontWeight: "bold",
    letterSpacing: "1px",
    fontFamily: "Luckiest Guy, cursive",
  };
  const featureListStyle = {
    listStyle: "none",
    padding: 0,
    marginBottom: "25px", // Increased margin
    marginTop: "20px", // Added top margin
    padding: "15px 20px", // Added padding
    borderRadius: "8px", // Rounded corners
  };
  const featureItemStyle = {
    fontSize: "0.89em", // Made 10% smaller than previous 0.99em
    color: "#5A87C5", // Updated to requested color
    marginBottom: "15px", // Increased space between items
    position: "relative",
    paddingLeft: "28px", // Increased padding to make room for larger bullet
    fontFamily: splineTheme.typography.fontFamily.body,
    display: "flex",
    alignItems: "center",
  };
  const featureBulletStyle = {
    content: '"."',
    color: "#5A87C5", // Updated to match text color
    fontSize: "1.8em", // Increased size
    position: "absolute",
    left: 0,
    top: "50%", // Center vertically
    transform: "translateY(-50%)", // Perfect vertical centering
    fontWeight: "bold", // Make bullets bolder
    lineHeight: "1", // Improve alignment
  };
  const descriptionStyle = {
    fontSize: "0.97em", // 10% smaller than previous 1.08em
    color: "#253358", // Updated to requested color
    lineHeight: "1.5",
    marginBottom: "30px",
    fontFamily: splineTheme.typography.fontFamily.body,
  };
  const buttonStyle = {
    backgroundColor: "#ffb6c1",
    color: "white",
    padding: "15px 30px",
    border: "none",
    borderRadius: "5px",
    fontSize: "0.97em", // 10% smaller than previous 1.08em
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    textTransform: "uppercase",
    fontWeight: "bold",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
    fontFamily: splineTheme.typography.fontFamily.body,
  };

  const buttonHoverStyle = {
    backgroundColor: "#ff9cab",
  }; // Media query for smaller screens (inline style using JavaScript)
  const mediaQuery = `@media (max-width: 768px) {
    .nutritional-set-container {
      flex-direction: column !important;
    }
    .nutritional-set-left,
    .nutritional-set-right {
      padding: 15px !important;
      align-items: center !important;
      text-align: center !important;
    }
    .section-title {
      font-size: 1.8em !important; /* Reduced from 2em to keep 10% smaller */
    }
    .feature-list {
      width: 100% !important;
      padding: 10px !important;
    }
    .feature-item {
      padding-left: 15px !important;
      text-align: left !important;
      justify-content: flex-start !important;
    }
    .cat-image {
      max-width: 70% !important;
    }
  }`;

  return (
    <div className="nutritional-set-container" style={containerStyle}>
      {/* Inline style for the left section */}
      <div className="nutritional-set-left" style={leftStyle}>
        <img
          src={catImage}
          alt="Cute cat"
          className="cat-image"
          style={catImageStyle}
        />
      </div>
      {/* Inline style for the right section */}
      <div className="nutritional-set-right" style={rightStyle}>
        <h2 className="section-title" style={titleStyle}>
          3-MEAL NUTRITIONAL SET FOR CATS
        </h2>{" "}
        <ul className="feature-list" style={featureListStyle}>
          {" "}
          <li className="feature-item" style={featureItemStyle}>
            <span
              style={{
                ...featureBulletStyle,
                display: "inline-block",
                marginRight: "10px",
              }}
            >
              •
            </span>
            Portions tailored to the cat's age and health condition
          </li>
          <li className="feature-item" style={featureItemStyle}>
            <span
              style={{
                ...featureBulletStyle,
                display: "inline-block",
                marginRight: "10px",
              }}
            >
              •
            </span>
            Ensuring essential nutrients.
          </li>
          <li className="feature-item" style={featureItemStyle}>
            <span
              style={{
                ...featureBulletStyle,
                display: "inline-block",
                marginRight: "10px",
              }}
            >
              •
            </span>
            Feeding time structured - saving time.
          </li>
        </ul>
        <p className="description" style={descriptionStyle}>
          We support cat owners in improving cat well-being and simplifying meal
          planning effort.
        </p>
        <button
          className="order-button"
          style={buttonStyle}
          onMouseOver={(e) =>
            Object.assign(e.currentTarget.style, buttonHoverStyle)
          }
          onMouseOut={(e) => Object.assign(e.currentTarget.style, buttonStyle)}
        >
          Order now
        </button>
      </div>
      {/* Style element for media query */}
      <style>{mediaQuery}</style>
    </div>
  );
};

export default NutritionalSetSection;
