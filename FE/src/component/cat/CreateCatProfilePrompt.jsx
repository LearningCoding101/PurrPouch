// CreateCatProfilePrompt.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../global/PageWrapper";
import { splineTheme } from "../../theme/global_theme";
import catGang from "../../assets/image/catprofile/gang.png";
import { getCatProfiles } from "../../services/api";

// Import PurrPouch styles
import "../../App.css";

function CreateCatProfilePrompt() {
  const navigate = useNavigate();
  const [catProfiles, setCatProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Navigate to the cat profile creation page
  const handleSignUp = () => {
    navigate("/cat-profile-create");
  };

  // Navigate to view a specific cat profile
  const handleViewProfile = (id) => {
    navigate(`/cat-profile/${id}`);
  };

  // Fetch user's cat profiles on component mount
  useEffect(() => {
    const fetchCatProfiles = async () => {
      try {
        setLoading(true);
        const response = await getCatProfiles();
        setCatProfiles(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching cat profiles:", err);
        setError("Failed to load your cat profiles. Please try again later.");
        setLoading(false);
      }
    };

    fetchCatProfiles();
  }, []);
  return (
    <PageWrapper>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          maxWidth: "1200px",
          margin: "0 auto",
          minHeight: "80vh",
        }}
      >
        {" "}
        <h1
          style={{
            fontSize: "4.5rem",
            color: "#5991dc", // Updated to the blue color from the image
            marginBottom: "2.5rem",
            fontFamily: "Luckiest Guy", // Using Luckiest Guy font for Menu
            fontWeight: "normal", // Luckiest Guy works better with normal weight
            textAlign: "center",
          }}
        >
          {catProfiles.length > 0 ? "My Cats" : "Menu"}
        </h1>
        {/* Show loading indicator while fetching data */}
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              color: "#5A87C5",
              fontFamily: '"Spline Sans", sans-serif',
            }}
          >
            <p>Loading your cat profiles...</p>
          </div>
        ) : error ? (
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              color: "#e74c3c",
              fontFamily: '"Spline Sans", sans-serif',
            }}
          >
            <p>{error}</p>
            <button
              style={{
                padding: "0.5rem 1.5rem",
                backgroundColor: "#5991dc",
                color: "#FFFFFF",
                borderRadius: "30px",
                fontSize: "0.9rem",
                fontFamily: '"Spline Sans", sans-serif',
                border: "none",
                cursor: "pointer",
                marginTop: "1rem",
              }}
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        ) : catProfiles.length > 0 ? (
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "2rem",
                width: "100%",
                maxWidth: "1000px",
              }}
            >
              {catProfiles.map((profile) => (
                <div
                  key={profile.id}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "15px",
                    padding: "1.5rem",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.3s",
                  }}
                  onClick={() => handleViewProfile(profile.id)}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 12px rgba(0, 0, 0, 0.15)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 8px rgba(0, 0, 0, 0.1)";
                  }}
                >
                  <div
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      marginBottom: "1rem",
                      border: "3px solid #5991dc",
                    }}
                  >
                    <img
                      src={profile.photoUrl || catGang}
                      alt={profile.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <h3
                    style={{
                      color: "#283B5E",
                      fontSize: "1.5rem",
                      fontFamily: "Luckiest Guy",
                      fontWeight: "normal",
                      margin: "0.5rem 0",
                    }}
                  >
                    {profile.name}
                  </h3>
                  <p
                    style={{
                      color: "#5A87C5",
                      fontFamily: '"Spline Sans", sans-serif',
                      marginBottom: "0.5rem",
                    }}
                  >
                    {profile.breed || "Unknown breed"}
                    {profile.age ? ` • ${profile.age} years` : ""}
                  </p>
                  <button
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#5991dc",
                      color: "#FFFFFF",
                      borderRadius: "30px",
                      fontSize: "0.9rem",
                      fontFamily: '"Spline Sans", sans-serif',
                      border: "none",
                      cursor: "pointer",
                      marginTop: "1rem",
                    }}
                  >
                    View Profile
                  </button>
                </div>
              ))}

              {/* Add new cat profile card */}
              <div
                style={{
                  backgroundColor: "#F8F9FA",
                  borderRadius: "15px",
                  padding: "1.5rem",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.05)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  border: "2px dashed #5991dc",
                  minHeight: "260px",
                  transition: "transform 0.2s, box-shadow 0.3s",
                }}
                onClick={handleSignUp}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 12px rgba(0, 0, 0, 0.1)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 8px rgba(0, 0, 0, 0.05)";
                }}
              >
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    backgroundColor: "#5991dc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <span
                    style={{
                      color: "white",
                      fontSize: "2rem",
                      fontWeight: "bold",
                    }}
                  >
                    +
                  </span>
                </div>
                <h3
                  style={{
                    color: "#283B5E",
                    fontSize: "1.3rem",
                    fontFamily: "Luckiest Guy",
                    fontWeight: "normal",
                    margin: "0.5rem 0",
                    textAlign: "center",
                  }}
                >
                  Add New Cat
                </h3>
                <p
                  style={{
                    color: "#5A87C5",
                    fontFamily: '"Spline Sans", sans-serif',
                    textAlign: "center",
                    fontSize: "0.9rem",
                  }}
                >
                  Create a profile for another feline friend
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Show welcome screen for users with no cat profiles
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              padding: "1.5rem",
              gap: "2rem",
              maxWidth: "900px",
            }}
          >
            {/* Left side - Cat image */}
            <div
              style={{
                flex: "1",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                maxWidth: "400px",
              }}
            >
              <div
                style={{
                  width: "120%",
                  // height: "350px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  position: "relative",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  border: "none",
                }}
              >
                {" "}
                <img
                  src={catGang}
                  alt="Cat gang"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    objectPosition: "center",
                  }}
                />
              </div>
            </div>{" "}
            {/* Right side - Create Account content */}
            <div
              style={{
                flex: "1",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              {" "}
              <h2
                style={{
                  fontSize: "3rem",
                  color: "#283B5E",
                  fontFamily: "Luckiest Guy", // Using Luckiest Guy font
                  marginBottom: "1rem",
                  fontWeight: "normal", // Luckiest Guy works better with normal weight
                  whiteSpace: "nowrap", // Prevent line breaking
                }}
              >
                CREATE AN ACCOUNT
              </h2>{" "}
              <p
                style={{
                  fontSize: "1.1rem",
                  color: "#5A87C5",
                  fontFamily: '"Spline Sans", sans-serif', // Explicitly using Spline Sans
                  maxWidth: "80%",
                  margin: "0 auto 2rem auto",
                }}
              >
                Get started by setting up your <strong>PurrPouch</strong>{" "}
                dashboard for easy meal tracking!
              </p>
              <button
                style={{
                  padding: "0.75rem 2.5rem",
                  backgroundColor: "#5991dc",
                  color: "#FFFFFF",
                  borderRadius: "30px",
                  fontSize: "1.1rem",
                  fontFamily: '"Spline Sans", sans-serif',
                  border: "none",
                  cursor: "pointer",
                  transition: "transform 0.2s, background-color 0.3s",
                  fontWeight: "bold",
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#4A7AC1")
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = "#5991dc")}
                onClick={handleSignUp}
              >
                Sign up now!{" "}
              </button>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

export default CreateCatProfilePrompt;
