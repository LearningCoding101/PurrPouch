import React, { useState, useEffect } from "react";
import CatProfile from "./CatProfile";
import CreateCatProfilePrompt from "../component/cat/CreateCatProfilePrompt";

function CatProfileRouter() {
  // This is where we would check if the user has a cat profile
  // For now, we're setting this up just to demonstrate the UI

  // Use state to toggle between views - in a real app this would be based on API call
  const [hasProfile, setHasProfile] = useState(false);

  // This is for demo purposes only - in the actual implementation,
  // you would fetch this from an API endpoint or local storage
  useEffect(() => {
    // Mock logic: simulate API call to check if user has a profile
    // In the real implementation, replace this with actual API call
    const checkIfUserHasCatProfile = async () => {
      // For demonstration, we'll just set it to false to show the prompt
      // In your actual implementation, you would query your backend
      setHasProfile(false);
    };

    checkIfUserHasCatProfile();
  }, []);

  // For development purposes - let us toggle between views with a key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Press "T" key to toggle between views
      if (e.key === "t" || e.key === "T") {
        setHasProfile((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Show the cat profile creation prompt if the user doesn't have a profile
  // Otherwise show the actual cat profile page
  return (
    <>
      {hasProfile ? <CatProfile /> : <CreateCatProfilePrompt />}
      {/* Developer helper message */}
      {process.env.NODE_ENV !== "production" && (
        <div
          style={{
            position: "fixed",
            bottom: "10px",
            right: "10px",
            background: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "5px 10px",
            borderRadius: "5px",
            fontSize: "12px",
            zIndex: 9999,
          }}
        >
          Press 'T' to toggle between views
        </div>
      )}
    </>
  );
}

export default CatProfileRouter;
