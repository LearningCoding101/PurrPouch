import React, { useEffect, useRef } from "react";
import PageWrapper from "../component/global/PageWrapper";
import Logo from "../component/global/Logo";
import Navbar from "../component/global/Navbar";
import NutritionalSetSection from "../component/homepage/NutritionalSetSection";
// Import the cat images
import catSection1 from "../assets/image/homepage/cat_section1.png";
import catSection1_1 from "../assets/image/homepage/cat_section1_1.png";
import catSection1_2 from "../assets/image/homepage/cat_section1_2.png";
import catCheat1 from "../assets/image/homepage/cat_cheat_1.png";
// Import the cat banner images for section 4
import catBanner1 from "../assets/image/homepage/cat_banner_1.png";
import catBanner2 from "../assets/image/homepage/cat_banner_2.png";
import catBanner3 from "../assets/image/homepage/cat_banner_3.png";

function Homepage() {
  // Define container styles
  const containerStyles = {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    maxWidth: "100vw",
    overflowX: "hidden",
    boxSizing: "border-box",
  };

  const sectionStyles = {
    height: "90vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "2rem",
    fontWeight: "bold",
    boxSizing: "border-box",
  };

  // Row styles for sections with multiple containers
  const rowStyles = {
    ...sectionStyles,
    flexDirection: "row",
    width: "100%", // Only the row (not the columns) should be 100% width
  };
  // Column styles for containers inside row sections
  const columnStyles = {
    flex: 1,
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxSizing: "border-box",
    minWidth: 0, // Prevent flex item from overflowing
    maxWidth: "50%", // Ensure columns don't take more than half the width
    overflow: "hidden", // Prevent content from overflowing
  };

  // Colors for different sections
  const colors = ["#f8f9fa", "#e9ecef", "#dee2e6", "#ced4da"];

  // Define each section separately
  const section1 = (
    <div
      style={{
        ...rowStyles,
        // backgroundColor: colors[0],
      }}
    >
      {" "}
      <div
        style={{
          ...columnStyles,
          padding: "5% 2rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "flex-start",
          textAlign: "left",
        }}
      >
        <div style={{ width: "100%" }}>
          {" "}
          {/* Logo section */}
          <div style={{ marginBottom: "2rem" }}>
            <Logo size="10rem" linkToHome={false} />
          </div>{" "}
          {/* Text content */}
          <div style={{ marginBottom: "2rem" }}>
            <h1
              style={{
                fontSize: "2.5rem",
                marginBottom: "1rem",
                fontFamily: "Luckiest Guy, cursive",
                color: "#1A335C",
              }}
            >
              We're here to support you
            </h1>
            <p
              style={{
                fontSize: "2rem",
                fontWeight: "normal",
                lineHeight: "1.5",
                fontFamily: "Luckiest Guy, cursive",
                color: "#1A335C",
              }}
            >
              -Cat owners in ensuring the health and happiness of your cats.
            </p>
          </div>
          {/* Button */}
          <button
            style={{
              backgroundColor: "#5A87C5",
              color: "white",
              padding: "0.8rem 2rem",
              border: "none",
              borderRadius: "8px",
              fontSize: "1.1rem",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Shop now
          </button>
        </div>{" "}
        {/* SVG circles at the bottom */}
        <div
          style={{
            display: "flex",
            gap: "10%",
            marginTop: "2rem",
            paddingLeft: "10%",
          }}
        >
          <div
            style={{
              width: "70%",
              height: "70%",
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            <img
              src={catSection1_1}
              alt="Cat 1"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
          <div
            style={{
              width: "70%",
              height: "70%",
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            <img
              src={catSection1_2}
              alt="Cat 2"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        </div>
      </div>
      <div
        style={{
          ...columnStyles,
          backgroundImage: `url(${catSection1})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderTopLeftRadius: "20px",
          borderBottomLeftRadius: "20px",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#EEBFBF",
        }}
      ></div>
    </div>
  );
  const section2 = (
    <div
      style={{
        ...rowStyles,
      }}
    >
      <NutritionalSetSection />
    </div>
  );
  const section3 = (
    <div
      style={{
        ...sectionStyles,
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
      }}
    >
      <img
        src={catCheat1}
        alt="Cat Cheat Sheet"
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain",
        }}
      />
      <button
        style={{
          position: "absolute",
          bottom: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#5A87C5",
          color: "white",
          padding: "0.8rem 2rem",
          border: "none",
          borderRadius: "8px",
          fontSize: "1.1rem",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        Plan & Pricing
      </button>
    </div>
  );
  const section4 = (
    <div
      style={{
        ...sectionStyles,
        backgroundColor: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Container for the scrolling banner with fade effects on edges */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "70%",
          overflow: "hidden",
        }}
      >
        {/* Left fade gradient */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "10%",
            height: "100%",
            background: "linear-gradient(to right, white, transparent)",
            zIndex: 2,
          }}
        ></div>

        {/* Right fade gradient */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: "10%",
            height: "100%",
            background: "linear-gradient(to left, white, transparent)",
            zIndex: 2,
          }}
        ></div>

        {/* Scrolling banner container */}
        <div
          id="banner-scroll"
          style={{
            display: "flex",
            height: "100%",
            animation: "scrollBanner 20s linear infinite",
            width: "fit-content",
          }}
        >
          {/* Duplicate images for seamless infinite effect */}
          {[
            catBanner1,
            catBanner2,
            catBanner3,
            catBanner1,
            catBanner2,
            catBanner3,
          ].map((img, index) => (
            <div
              key={`banner-${index}`}
              style={{
                height: "100%",
                padding: "0 20px",
              }}
            >
              <img
                src={img}
                alt={`Cat Banner ${(index % 3) + 1}`}
                style={{
                  height: "100%",
                  width: "auto",
                  objectFit: "contain",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* CSS animation for scrolling effect */}
      <style>
        {`
          @keyframes scrollBanner {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
        `}
      </style>
    </div>
  );
  return (
    <PageWrapper>
      <div style={containerStyles}>
        {section1}
        {section2}
        {section3}
        <Navbar />

        {section4}
      </div>
    </PageWrapper>
  );
}

export default Homepage;
