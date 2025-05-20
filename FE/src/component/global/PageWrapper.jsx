import React from "react";
import Header from "./header";
import Footer from "./footer";

/**
 * PageWrapper component that wraps content between a header and footer
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The content to be wrapped
 * @returns {JSX.Element} PageWrapper component
 */
function PageWrapper({ children }) {
  return (
    <>
      <Header />
      <main style={{ minHeight: "calc(100vh - 250px - 72px)" }}>
        {children}
      </main>
      <Footer />
    </>
  );
}

export default PageWrapper;
