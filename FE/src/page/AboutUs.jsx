import React from "react";
import PageWrapper from "../component/global/PageWrapper";

// Import a placeholder image
// Note: You'll need to add a real image to the about folder
import aboutUsImage from "../assets/image/about/about-us.jpg";

/**
 * About Us page component that displays information about the company
 * @returns {JSX.Element} About Us page
 */
function AboutUs() {
  return (
    <PageWrapper>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "2rem",
          maxWidth: "100vw",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            width: "100%",
            textAlign: "center",
          }}
        >
          <img
            src={aboutUsImage}
            alt="About Purr Pouch"
            style={{
              width: "100%",
              height: "auto",
            }}
          />
        </div>
      </div>
    </PageWrapper>
  );
}

export default AboutUs;
