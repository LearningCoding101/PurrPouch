import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCatProfile } from "../services/api";
import PageWrapper from "../component/global/PageWrapper";
import catGang from "../assets/image/catprofile/gang.png";
import { splineTheme } from "../theme/global_theme";

// Blurry Loading Image Component
const BlurryLoadingImage = ({ src, alt }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <>
      {/* Blurred small image that shows immediately */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(20px)",
          transform: "scale(1.1)", // Slightly scaled to avoid blurry edges from showing
          opacity: imageLoaded ? 0 : 1,
          transition: "opacity 0.3s ease-in-out",
        }}
      />

      {/* Main high quality image that loads in the background */}
      <img
        src={src}
        alt={alt}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: imageLoaded ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
        }}
        onLoad={() => setImageLoaded(true)}
      />
    </>
  );
};

function CatProfileDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCatProfile = async () => {
      try {
        setLoading(true);
        const response = await getCatProfile(id);
        setProfile(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching cat profile:", err);
        setError("Failed to load this cat profile. Please try again later.");
        setLoading(false);
      }
    };

    fetchCatProfile();
  }, [id]);

  // Handle back button click
  const handleBack = () => {
    navigate("/cat-profile");
  };

  // Format the label from enum values
  const formatLabel = (value) => {
    if (!value) return "";
    return value
      .toLowerCase()
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  return (
    <PageWrapper>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "2rem",
          maxWidth: "1200px",
          margin: "0 auto",
          minHeight: "80vh",
        }}
      >
        {/* Main Page Header */}
        <h1
          style={{
            fontSize: "4.5rem",
            color: "#5991dc",
            marginBottom: "2.5rem",
            fontFamily: "Luckiest Guy",
            fontWeight: "normal",
            textAlign: "center",
            textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
          }}
        >
          CAT PROFILE
        </h1>

        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              color: "#5A87C5",
              fontFamily: splineTheme.typography.fontFamily.body,
            }}
          >
            <p>Loading cat profile...</p>
          </div>
        ) : error ? (
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              color: "#e74c3c",
              fontFamily: splineTheme.typography.fontFamily.body,
            }}
          >
            <p>{error}</p>
            <button
              style={{
                padding: "0.5rem 1.5rem",
                backgroundColor: "#5991dc",
                color: "#FFFFFF",
                borderRadius: "30px",
                border: "none",
                cursor: "pointer",
                marginTop: "1rem",
                fontFamily: splineTheme.typography.fontFamily.body,
              }}
              onClick={handleBack}
            >
              Go Back
            </button>
          </div>
        ) : profile ? (
          <>
            {/* Cat Identity Card */}
            <div
              style={{
                width: "100%",
                // maxWidth: "800px",
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                padding: "2rem",
                boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
                marginBottom: "2rem",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Decorative geometric element */}
              <div
                style={{
                  position: "absolute",
                  top: "18px",
                  left: "18px",
                  width: "60px",
                  height: "60px",
                  zIndex: 0,
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                }}
              >
                {/* Soft pink background triangle */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "38px",
                    height: "38px",
                    background: "#FFF4F4",
                    clipPath: "polygon(0 0, 100% 0, 0 100%)",
                    borderRadius: "6px",
                  }}
                ></div>
                {/* Blue triangle overlay */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "38px",
                    height: "38px",
                    background: "#C1D2E9",
                    clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
                    borderRadius: "6px",
                  }}
                ></div>
              </div>
              {/* Card Header with Identity Card Title */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: "2rem",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <h2
                  style={{
                    fontSize: "2.5rem",
                    color: "#C1D2E9",
                    fontFamily: splineTheme.typography.fontFamily.heading,
                    fontWeight: "bold",
                    textAlign: "center",
                    letterSpacing: "1px",
                  }}
                >
                  IDENTITY CARD
                </h2>
              </div>{" "}
              {/* Main content container - split 40/60 */}
              <div style={{ display: "flex", marginBottom: "2rem" }}>
                {/* Left Column - Cat Name and Photo (40%) */}
                <div
                  style={{
                    width: "40%",
                    paddingRight: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    height: "100%",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "3rem",
                      color: "#1d3557",
                      fontFamily: "Luckiest Guy, cursive",
                      marginBottom: "1.5rem",
                      marginTop: "0",
                      textTransform: "uppercase",
                      textAlign: "center",
                    }}
                  >
                    {profile.name}{" "}
                    {/* <span style={{ fontSize: "1.6rem", color: "#5a87c5" }}>
                      ({profile.gender || "UNKNOWN"})
                    </span> */}
                  </h3>
                  <div
                    style={{
                      width: "100%",
                      maxWidth: "80%",
                      height: "400px",
                      borderRadius: "10px",
                      overflow: "hidden",
                      position: "relative",
                      backgroundColor: "#f0f4fa",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
                      margin: "0 auto",
                    }}
                  >
                    <BlurryLoadingImage
                      src={profile.photoUrl || catGang}
                      alt={profile.name}
                    />
                  </div>{" "}
                </div>{" "}
                {/* Right Column - Cat Details (60%) */}
                <div style={{ width: "60%" }}>
                  {/* Age */}
                  <div style={{ display: "flex", marginBottom: "0.75rem" }}>
                    <div
                      style={{
                        width: "150px",
                        backgroundColor: "#dce6f5",
                        padding: "0.75rem 1rem",
                        color: "#1d3557",
                        marginRight: "10px",
                        borderRadius: "10px  10px 10px 10px",

                        fontWeight: "600",
                        fontFamily: splineTheme.typography.fontFamily.body,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      Age
                    </div>
                    <div
                      style={{
                        flex: "1",
                        backgroundColor: "#fbe7e7",
                        padding: "0.75rem 1rem",
                        color: "#1d3557",
                        marginRight: "10px",
                        borderRadius: "10px  10px 10px 10px",

                        fontFamily: splineTheme.typography.fontFamily.body,
                      }}
                    >
                      {profile.age} {profile.age === 1 ? "year" : "years"}
                      {profile.age < 1 ? " months (Kitten)" : ""}
                    </div>
                  </div>{" "}
                  {/* Weight */}
                  <div style={{ display: "flex", marginBottom: "0.75rem" }}>
                    <div
                      style={{
                        width: "150px",
                        backgroundColor: "#dce6f5",
                        padding: "0.75rem 1rem",
                        color: "#1d3557",
                        marginRight: "10px",
                        borderRadius: "10px  10px 10px 10px",

                        fontWeight: "600",
                        fontFamily: splineTheme.typography.fontFamily.body,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      Weight
                    </div>
                    <div
                      style={{
                        flex: "1",
                        backgroundColor: "#fbe7e7",
                        padding: "0.75rem 1rem",
                        color: "#1d3557",
                        marginRight: "10px",
                        borderRadius: "10px  10px 10px 10px",

                        fontFamily: splineTheme.typography.fontFamily.body,
                      }}
                    >
                      {profile.weight} kg
                    </div>
                  </div>
                  {/* Activity Level */}
                  <div style={{ display: "flex", marginBottom: "0.75rem" }}>
                    <div
                      style={{
                        width: "150px",
                        backgroundColor: "#dce6f5",
                        padding: "0.75rem 1rem",
                        color: "#1d3557",
                        marginRight: "10px",
                        borderRadius: "10px  10px 10px 10px",

                        fontWeight: "600",
                        fontFamily: splineTheme.typography.fontFamily.body,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      Activity Level
                    </div>
                    <div
                      style={{
                        flex: "1",
                        backgroundColor: "#fbe7e7",
                        padding: "0.75rem 1rem",
                        color: "#1d3557",
                        marginRight: "10px",
                        borderRadius: "10px  10px 10px 10px",

                        fontFamily: splineTheme.typography.fontFamily.body,
                      }}
                    >
                      High & Energetic
                    </div>
                  </div>
                  {/* Water Intake */}
                  <div style={{ display: "flex", marginBottom: "0.75rem" }}>
                    <div
                      style={{
                        width: "150px",
                        backgroundColor: "#dce6f5",
                        padding: "0.75rem 1rem",
                        color: "#1d3557",
                        marginRight: "10px",
                        borderRadius: "10px  10px 10px 10px",

                        fontWeight: "600",
                        fontFamily: splineTheme.typography.fontFamily.body,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      Water Intake Habit
                    </div>
                    <div
                      style={{
                        flex: "1",
                        backgroundColor: "#fbe7e7",
                        padding: "0.75rem 1rem",
                        color: "#1d3557",
                        marginRight: "10px",
                        borderRadius: "10px  10px 10px 10px",

                        fontFamily: splineTheme.typography.fontFamily.body,
                      }}
                    >
                      Lazy to drink water
                    </div>
                  </div>
                  {/* Preferences, Requirements, Allergies, and Notes in a row */}
                  <div style={{ display: "flex", marginTop: "1.5rem" }}>
                    {/* Left side (60%) - Protein, dietary, allergies */}
                    <div style={{ width: "60%" }}>
                      {/* Protein Preferences */}
                      <div style={{ marginBottom: "1.25rem" }}>
                        <div style={{ marginBottom: "0.5rem" }}>
                          <span
                            style={{
                              color: "#e74c3c",
                              marginRight: "0.5rem",
                              fontSize: "1.1rem",
                            }}
                          >
                            *
                          </span>
                          <span
                            style={{
                              color: "#1d3557",
                              fontWeight: "600",
                              fontFamily:
                                splineTheme.typography.fontFamily.body,
                              fontSize: "1rem",
                            }}
                          >
                            Protein preferences
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.75rem",
                          }}
                        >
                          {profile.proteinPreferences &&
                          profile.proteinPreferences.length > 0 ? (
                            profile.proteinPreferences.map((protein, index) => {
                              // Determine if this is Turkey, Tuna, or Plant-based to apply special styling
                              const isSpecial = [
                                "TURKEY",
                                "TUNA",
                                "PLANT_BASED",
                              ].includes(protein);
                              const iconType =
                                protein === "TUNA"
                                  ? "🐟"
                                  : protein === "PLANT_BASED"
                                  ? "🌿"
                                  : "";

                              return (
                                <div
                                  key={index}
                                  style={{
                                    backgroundColor: isSpecial
                                      ? "#5991dc"
                                      : "#f8f9fa",
                                    border: `1px solid ${
                                      isSpecial ? "#4A7AC1" : "#dce6f5"
                                    }`,
                                    borderRadius: "30px",
                                    padding: "0.5rem 1rem",
                                    color: isSpecial ? "#FFFFFF" : "#1d3557",
                                    display: "flex",
                                    alignItems: "center",
                                    fontSize: "0.85rem",
                                    fontFamily:
                                      splineTheme.typography.fontFamily.body,
                                    fontWeight: "500",
                                    boxShadow: isSpecial
                                      ? "0 2px 4px rgba(0,0,0,0.1)"
                                      : "none",
                                  }}
                                >
                                  {formatLabel(protein)}
                                  {iconType && (
                                    <span style={{ marginLeft: "0.5rem" }}>
                                      {iconType}
                                    </span>
                                  )}
                                  {!iconType && isSpecial && (
                                    <span style={{ marginLeft: "0.5rem" }}>
                                      ✓
                                    </span>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <div
                              style={{
                                backgroundColor: "#f8f9fa",
                                border: "1px solid #dce6f5",
                                borderRadius: "30px",
                                padding: "0.5rem 1rem",
                                color: "#1d3557",
                                fontSize: "0.85rem",
                                fontFamily:
                                  splineTheme.typography.fontFamily.body,
                              }}
                            >
                              No preferences set
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Dietary Requirements Section */}
                      <div style={{ marginBottom: "1.25rem" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <span
                            style={{
                              color: "#e74c3c",
                              marginRight: "0.5rem",
                              fontSize: "1.1rem",
                            }}
                          >
                            *
                          </span>
                          <span
                            style={{
                              color: "#1d3557",
                              fontWeight: "600",
                              fontFamily:
                                splineTheme.typography.fontFamily.body,
                              fontSize: "1rem",
                            }}
                          >
                            Dietary Requirements
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.75rem",
                          }}
                        >
                          {profile.dietaryRequirements &&
                          profile.dietaryRequirements.length > 0 ? (
                            profile.dietaryRequirements.map((diet, index) => (
                              <div
                                key={index}
                                style={{
                                  backgroundColor: "#f8f9fa",
                                  border: "1px solid #dce6f5",
                                  borderRadius: "30px",
                                  padding: "0.5rem 1rem",
                                  color: "#1d3557",
                                  fontSize: "0.85rem",
                                  fontFamily:
                                    splineTheme.typography.fontFamily.body,
                                  fontWeight: "500",
                                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                }}
                              >
                                {diet === "WEIGHT_CONTROL"
                                  ? "Weight Control"
                                  : formatLabel(diet)}
                              </div>
                            ))
                          ) : (
                            <div
                              style={{
                                backgroundColor: "#f8f9fa",
                                border: "1px solid #dce6f5",
                                borderRadius: "30px",
                                padding: "0.5rem 1rem",
                                color: "#1d3557",
                                fontSize: "0.85rem",
                                fontFamily:
                                  splineTheme.typography.fontFamily.body,
                              }}
                            >
                              No dietary requirements
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Allergies & Intolerances Section */}
                      <div style={{ marginBottom: "1.25rem" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <span
                            style={{
                              color: "#e74c3c",
                              marginRight: "0.5rem",
                              fontSize: "1.1rem",
                            }}
                          >
                            *
                          </span>
                          <span
                            style={{
                              color: "#1d3557",
                              fontWeight: "600",
                              fontFamily:
                                splineTheme.typography.fontFamily.body,
                              fontSize: "1rem",
                            }}
                          >
                            Allergies & Intolerances
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.75rem",
                          }}
                        >
                          {profile.allergies && profile.allergies.length > 0 ? (
                            profile.allergies.map((allergy, index) => (
                              <div
                                key={index}
                                style={{
                                  backgroundColor: "#f8f9fa",
                                  border: "1px solid #dce6f5",
                                  borderRadius: "30px",
                                  padding: "0.5rem 1rem",
                                  color: "#1d3557",
                                  fontSize: "0.85rem",
                                  fontWeight: "500",
                                  fontFamily:
                                    splineTheme.typography.fontFamily.body,
                                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                }}
                              >
                                {allergy === "NO_CHICKEN"
                                  ? "No Chicken"
                                  : formatLabel(allergy)}
                              </div>
                            ))
                          ) : (
                            <div
                              style={{
                                backgroundColor: "#f8f9fa",
                                border: "1px solid #dce6f5",
                                borderRadius: "30px",
                                padding: "0.5rem 1rem",
                                color: "#1d3557",
                                fontSize: "0.85rem",
                                fontFamily:
                                  splineTheme.typography.fontFamily.body,
                              }}
                            >
                              No known allergies
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right side (40%) - Notes */}
                    <div style={{ width: "40%", paddingLeft: "1rem" }}>
                      {/* Notes Section */}
                      <div>
                        <div style={{ marginBottom: "0.5rem" }}>
                          <span
                            style={{
                              color: "#e74c3c",
                              marginRight: "0.5rem",
                              fontSize: "1.1rem",
                            }}
                          >
                            *
                          </span>
                          <span
                            style={{
                              color: "#1d3557",
                              fontWeight: "600",
                              fontFamily:
                                splineTheme.typography.fontFamily.body,
                              fontSize: "1rem",
                            }}
                          >
                            Notes
                          </span>
                        </div>
                        <div
                          style={{
                            backgroundColor: "#f8f9fa",
                            border: "1px solid #dce6f5",
                            borderRadius: "10px",
                            padding: "1rem",
                            color: "#1d3557",
                            height: "100%",
                            minHeight: "220px",
                            fontFamily: splineTheme.typography.fontFamily.body,
                            fontSize: "0.95rem",
                            lineHeight: "1.5",
                            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.05)",
                          }}
                        >
                          {profile.notes ||
                            "Lazy to drink water. Prefers to get water from wet food."}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>{" "}
            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                gap: "2rem",
                justifyContent: "flex-end",
                marginTop: "2rem",
                width: "100%",
                background: "none",
                pointerEvents: "auto",
              }}
            >
              <button
                style={{
                  padding: "0.85rem 2.5rem",
                  backgroundColor: "#f8d4d4",
                  color: "#1d3557",
                  border: "none",
                  borderRadius: "30px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "1rem",
                  fontFamily: splineTheme.typography.fontFamily.body,
                  boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
                  transition: "all 0.2s ease",
                }}
                onClick={() => navigate(`/diet-tracker/${profile.id}`)}
                onMouseOver={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 5px 8px rgba(0,0,0,0.15)";
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 3px 6px rgba(0,0,0,0.1)";
                }}
              >
                Diet Tracker
              </button>
              <button
                style={{
                  padding: "0.85rem 2.5rem",
                  backgroundColor: "#5991dc",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "30px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "1rem",
                  fontFamily: splineTheme.typography.fontFamily.body,
                  boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
                  transition: "all 0.2s ease",
                }}
                onClick={() => navigate(`/meal-plans/${profile.id}`)}
                onMouseOver={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.backgroundColor = "#4A7AC1";
                  e.target.style.boxShadow = "0 5px 8px rgba(0,0,0,0.15)";
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.backgroundColor = "#5991dc";
                  e.target.style.boxShadow = "0 3px 6px rgba(0,0,0,0.1)";
                }}
              >
                Customize meal plans now!
              </button>
            </div>
          </>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              color: "#e74c3c",
              fontFamily: splineTheme.typography.fontFamily.body,
            }}
          >
            <p>Cat profile not found.</p>
            <button
              style={{
                padding: "0.5rem 1.5rem",
                backgroundColor: "#5991dc",
                color: "#FFFFFF",
                borderRadius: "30px",
                border: "none",
                cursor: "pointer",
                marginTop: "1rem",
                fontFamily: splineTheme.typography.fontFamily.body,
              }}
              onClick={handleBack}
            >
              Go Back
            </button>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

export default CatProfileDetail;
