// filepath: d:\projects\purr_pouch\FE\src\page\LogoExamplePage.jsx
import React from "react";
import Logo from "../component/global/Logo";
import PageWrapper from "../component/global/PageWrapper";

function LogoExamplePage() {
  return (
    <PageWrapper>
      <div style={{ padding: "2rem" }}>
        <h1>Logo Examples</h1>

        <h2>Different Sizes</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <p>Small Logo (1rem):</p>
            <Logo size="1rem" />
          </div>

          <div>
            <p>Medium Logo (Default - 1.5rem):</p>
            <Logo />
          </div>

          <div>
            <p>Large Logo (2rem):</p>
            <Logo size="2rem" />
          </div>

          <div>
            <p>Extra Large Logo (3rem):</p>
            <Logo size="3rem" />
          </div>

          <div>
            <p>Using numeric size (24px = 1.5rem):</p>
            <Logo size={24} />
          </div>
        </div>

        <h2>Without Home Link</h2>
        <div>
          <p>Logo without link to home:</p>
          <Logo linkToHome={false} size="2rem" />
        </div>

        <h2>With Custom Styling</h2>
        <div>
          <p>Logo with custom styles:</p>
          <Logo
            size="2rem"
            style={{
              backgroundColor: "#f5f5f5",
              padding: "10px",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          />
        </div>
      </div>
    </PageWrapper>
  );
}

export default LogoExamplePage;
