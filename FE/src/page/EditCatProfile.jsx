import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { updateCatProfile, uploadImage } from "../services/api";
import PageWrapper from "../component/global/PageWrapper";
import catGang from "../assets/image/catprofile/gang.png";
import { splineTheme } from "../theme/global_theme";
import { useCatProfile } from "../provider/cat_profile_provider";

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

function EditCatProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    profiles,
    loading: profileLoading,
    error: profileError,
    fetchCatProfile,
    updateCatProfile: updateProfileInContext,
  } = useCatProfile();

  // Get the profile from context
  const profile = profiles[id];
  const loading = profileLoading && !profile;
  const error = profileError && profileError[id];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    weight: "",
    age: "",
    proteinPreference: "",
    dietaryRequirements: [],
    allergies: [],
    notes: "",
    photoUrl: null,
    catPhoto: null, // For handling new photo uploads
  });

  // Protein preferences options
  const proteinOptions = [
    { value: "CHICKEN", label: "Chicken" },
    { value: "TURKEY", label: "Turkey" },
    { value: "SALMON", label: "Salmon" },
    { value: "BEEF", label: "Beef" },
    { value: "TUNA", label: "Tuna" },
    { value: "DUCK", label: "Duck" },
    { value: "WHITEFISH", label: "Whitefish" },
    { value: "PLANT_BASED", label: "Plant-based options" },
  ];

  // Dietary requirements options
  const dietaryOptions = [
    {
      value: "SENIOR_CAT_FORMULA",
      title: "Senior Cat Formula",
      description: "Specialized nutrition for cats aged 7+",
    },
    {
      value: "SENSITIVE_STOMACH",
      title: "Sensitive Stomach",
      description:
        "Easily digestible ingredients for cats with digestive issues",
    },
    {
      value: "KITTEN_GROWTH_FORMULA",
      title: "Kitten Growth Formula",
      description: "High protein meals for growing kittens",
    },
    {
      value: "KIDNEY_SUPPORT",
      title: "Kidney Support",
      description: "Reduced phosphorus & sodium to support kidney health",
    },
    {
      value: "URINARY_TRACT_HEALTH",
      title: "Urinary Tract Health",
      description: "High moisture meals to prevent UTIs",
    },
    {
      value: "WEIGHT_CONTROL",
      title: "Weight Control",
      description: "Low-calorie, high-protein meals for overweight cats",
    },
    {
      value: "HAIRBALL_CONTROL",
      title: "Hairball Control",
      description: "Fiber-rich ingredients to aid digestion",
    },
  ];
  // Allergies & Intolerances options
  const allergyOptions = [
    { value: "NO_CHICKEN", label: "No Chicken" },
    { value: "GRAIN_FREE", label: "Grain-Free (No wheat, corn, soy)" },
    { value: "NO_BEEF", label: "No Beef" },
    { value: "DAIRY_FREE", label: "Dairy-Free (No milk, cheese, yogurt)" },
    { value: "NO_EGG", label: "No Egg" },
    {
      value: "NO_ARTIFICIAL_PRESERVATIVES",
      label: "No Artificial Preservatives or Colorants",
    },
    { value: "NO_SEAFOOD", label: "No Seafood" },
  ];
  useEffect(() => {
    // Fetch cat profile if not already in context
    fetchCatProfile(id);

    // Initialize form data when profile is available
    if (profile) {
      setFormData({
        name: profile.name || "",
        breed: profile.breed || "",
        weight: profile.weight ? profile.weight.toString() : "",
        age: profile.age ? profile.age.toString() : "",
        proteinPreference:
          profile.proteinPreferences && profile.proteinPreferences.length > 0
            ? profile.proteinPreferences[0]
            : "",
        dietaryRequirements: profile.dietaryRequirements || [],
        allergies: profile.allergies || [],
        notes: profile.notes || "",
        photoUrl: profile.photoUrl || null,
        catPhoto: null,
      });
    }
  }, [id, profile, fetchCatProfile]);

  // Handle back button click
  const handleBack = () => {
    navigate(`/cat-profile/${id}`);
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

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  }; // Handle protein preference selection
  const handleProteinChange = (protein) => {
    setFormData({
      ...formData,
      proteinPreference: protein,
    });
  };

  // Handle dietary requirements checkbox changes
  const handleDietaryChange = (requirement) => {
    if (formData.dietaryRequirements.includes(requirement)) {
      setFormData({
        ...formData,
        dietaryRequirements: formData.dietaryRequirements.filter(
          (item) => item !== requirement
        ),
      });
    } else {
      setFormData({
        ...formData,
        dietaryRequirements: [...formData.dietaryRequirements, requirement],
      });
    }
  };

  // Handle allergies checkbox changes
  const handleAllergyChange = (allergy) => {
    if (formData.allergies.includes(allergy)) {
      setFormData({
        ...formData,
        allergies: formData.allergies.filter((item) => item !== allergy),
      });
    } else {
      setFormData({
        ...formData,
        allergies: [...formData.allergies, allergy],
      });
    }
  };

  // Function to upload image using our API service
  const uploadImageHandler = async (imageBase64) => {
    const result = await uploadImage(imageBase64);
    if (result.success) {
      console.log("Image uploaded successfully:", result.url);
      return result.url;
    } else {
      console.error("Failed to upload image:", result.error);
      return null;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    try {
      let submissionData = { ...formData };

      // If there's a new catPhoto, upload it to imgBB and replace with URL
      if (formData.catPhoto) {
        setIsUploading(true);
        const imageUrl = await uploadImageHandler(formData.catPhoto);
        if (imageUrl) {
          submissionData.photoUrl = imageUrl; // Change key from catPhoto to photoUrl to match the backend
        }
        setIsUploading(false);
      } // Prepare the data for the backend
      const catProfileData = {
        name: submissionData.name,
        breed: submissionData.breed,
        weight: parseFloat(submissionData.weight),
        age: parseInt(submissionData.age, 10),
        proteinPreferences: submissionData.proteinPreference
          ? [submissionData.proteinPreference]
          : [],
        dietaryRequirements: submissionData.dietaryRequirements,
        allergies: submissionData.allergies,
        notes: submissionData.notes,
        photoUrl: submissionData.photoUrl || null,
      };
      console.log("Form Data to submit:", catProfileData);

      // Send the data to the backend
      setIsSubmitting(true);
      const response = await updateCatProfile(id, catProfileData);

      // Update the cat profile in the context
      updateProfileInContext(id, response.data);

      setIsSubmitting(false);

      // Navigate back to the cat profile detail page
      navigate(`/cat-profile/${id}`);
    } catch (error) {
      setIsSubmitting(false);
      console.error("Error updating cat profile:", error);
      setSubmitError("Failed to update cat profile. Please try again.");
    }
  };
  return (
    <PageWrapper>
      <div
        style={{
          backgroundColor: "#FFFFFF",
          padding: "40px 20px 60px",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Main Container */}
        <div
          style={{
            maxWidth: "1140px",
            width: "100%",
            margin: "0 auto",
            position: "relative",
          }}
        >
          {/* Header Section */}
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              color: "#4A72B8",
              textAlign: "center",
              marginTop: "40px",
              marginBottom: "30px",
              fontFamily: "'Luckiest Guy', cursive",
            }}
          >
            CAT PROFILE
          </h1>

          {/* Edit Title Block */}
          <div
            style={{
              marginBottom: "40px",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                fontSize: "1.8rem",
                fontWeight: "bold",
                color: "#333333",
                marginBottom: "15px",
                fontFamily: "'Luckiest Guy', cursive",
              }}
            >
              EDIT YOUR CAT PROFILE
            </h2>
            <p
              style={{
                fontSize: "1rem",
                color: "#555555",
                maxWidth: "700px",
                margin: "0 auto",
                fontFamily: splineTheme.typography.fontFamily.body,
              }}
            >
              Update your cat's information to keep their profile current and
              accurate.
            </p>
          </div>

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
            <form onSubmit={handleSubmit}>
              {/* Two-column layout for entire form */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "47.5% 47.5%",
                  gap: "5%",
                  marginBottom: "24px",
                  position: "relative",
                  minHeight: "700px",
                }}
              >
                {/* Left column - Form Inputs */}
                <div>
                  {/* Basic Info - Name Field */}
                  <div style={{ marginBottom: "20px" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        color: "#333",
                        marginBottom: "8px",
                        fontFamily: splineTheme.typography.fontFamily.body,
                      }}
                    >
                      Enter feline's name
                      <span style={{ color: "red" }}> *</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Feline's name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "4px",
                        border: "1px solid #CCCCCC",
                        fontSize: "1rem",
                      }}
                    />
                  </div>

                  {/* Breed, Weight, Age Fields - In a 3-column grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "30px",
                      marginBottom: "24px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.9rem",
                          fontWeight: "500",
                          color: "#333",
                          marginBottom: "8px",
                          fontFamily: splineTheme.typography.fontFamily.body,
                        }}
                      >
                        Enter feline's breed
                      </label>
                      <input
                        type="text"
                        name="breed"
                        placeholder="Feline's breed"
                        value={formData.breed}
                        onChange={handleInputChange}
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "4px",
                          border: "1px solid #CCCCCC",
                          fontSize: "1rem",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.9rem",
                          fontWeight: "500",
                          color: "#333",
                          marginBottom: "8px",
                          fontFamily: splineTheme.typography.fontFamily.body,
                        }}
                      >
                        Enter feline's weight
                        <span style={{ color: "red" }}> *</span>
                      </label>
                      <input
                        type="number"
                        name="weight"
                        placeholder="Feline's weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        required
                        step="0.1"
                        min="0.1"
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "4px",
                          border: "1px solid #CCCCCC",
                          fontSize: "1rem",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.9rem",
                          fontWeight: "500",
                          color: "#333",
                          marginBottom: "8px",
                          fontFamily: splineTheme.typography.fontFamily.body,
                        }}
                      >
                        Enter feline's age
                        <span style={{ color: "red" }}> *</span>
                      </label>
                      <input
                        type="number"
                        name="age"
                        placeholder="Feline's age"
                        value={formData.age}
                        onChange={handleInputChange}
                        required
                        min="0"
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "4px",
                          border: "1px solid #CCCCCC",
                          fontSize: "1rem",
                        }}
                      />
                    </div>
                  </div>

                  {/* Protein Preferences */}
                  <div style={{ marginBottom: "24px" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "1rem",
                        fontWeight: "500",
                        color: "#333",
                        marginBottom: "12px",
                        fontFamily: splineTheme.typography.fontFamily.body,
                      }}
                    >
                      Protein preferences
                      <span style={{ color: "red" }}> *</span>
                    </label>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(150px, 1fr))",
                        gap: "15px",
                      }}
                    >
                      {proteinOptions.map((option) => (
                        <div
                          key={option.value}
                          onClick={() =>
                            setFormData({
                              ...formData,
                              proteinPreference: option.value,
                            })
                          }
                          style={{
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {" "}
                          {/* Radio button circle */}
                          <div
                            style={{
                              width: "20px",
                              height: "20px",
                              borderRadius: "50%",
                              border: "2px solid #B0B0B0",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginRight: "10px",
                              flexShrink: 0,
                            }}
                          >
                            {formData.proteinPreference === option.value && (
                              <div
                                style={{
                                  width: "10px",
                                  height: "10px",
                                  borderRadius: "50%",
                                  backgroundColor: "#4A72B8",
                                }}
                              ></div>
                            )}
                          </div>
                          {/* Main label container */}
                          <div
                            style={{
                              padding: "10px 12px",
                              borderRadius: "8px",
                              border: "1px solid #D0D0D0",
                              backgroundColor:
                                formData.proteinPreference === option.value
                                  ? "#F8F9FD"
                                  : "#FFFFFF",
                              borderColor:
                                formData.proteinPreference === option.value
                                  ? "#A8B8E8"
                                  : "#D0D0D0",
                              flex: 1,
                            }}
                          >
                            <div
                              style={{
                                fontWeight: "500",
                                fontSize: "0.9rem",
                                color: "#686868",
                              }}
                            >
                              {option.label}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dietary Requirements */}
                  <div style={{ marginBottom: "24px" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "1rem",
                        fontWeight: "500",
                        color: "#333",
                        marginBottom: "12px",
                        fontFamily: splineTheme.typography.fontFamily.body,
                      }}
                    >
                      Dietary Requirements (Select if applicable)
                    </label>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "15px",
                      }}
                    >
                      {dietaryOptions.map((option) => (
                        <div
                          key={option.value}
                          onClick={() => handleDietaryChange(option.value)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                          }}
                        >
                          {/* Radio button circle */}
                          <div
                            style={{
                              width: "20px",
                              height: "20px",
                              borderRadius: "50%",
                              border: "2px solid #B0B0B0",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginRight: "15px",
                              flexShrink: 0,
                            }}
                          >
                            {formData.dietaryRequirements.includes(
                              option.value
                            ) && (
                              <div
                                style={{
                                  width: "10px",
                                  height: "10px",
                                  borderRadius: "50%",
                                  backgroundColor: "#4A72B8",
                                }}
                              ></div>
                            )}
                          </div>

                          {/* Content container */}
                          <div
                            style={{
                              flex: 1,
                            }}
                          >
                            {/* Main label container */}
                            <div
                              style={{
                                padding: "12px 15px",
                                borderRadius: "8px",
                                border: "1px solid #D0D0D0",
                                backgroundColor:
                                  formData.dietaryRequirements.includes(
                                    option.value
                                  )
                                    ? "#F8F9FD"
                                    : "#FFFFFF",
                                borderColor:
                                  formData.dietaryRequirements.includes(
                                    option.value
                                  )
                                    ? "#A8B8E8"
                                    : "#D0D0D0",
                              }}
                            >
                              <div
                                style={{
                                  fontWeight: "500",
                                  fontSize: "0.95rem",
                                  color: "#686868",
                                }}
                              >
                                {option.title}
                              </div>
                            </div>

                            {/* Descriptive sub-label */}
                            <div
                              style={{
                                fontSize: "0.85rem",
                                color: "#A8B8E8",
                                marginTop: "5px",
                                marginLeft: "5px",
                              }}
                            >
                              {option.description}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>{" "}
                {/* Right column - Photo Upload and Notes */}{" "}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    height:
                      "100%" /* Makes the right column take full height */,
                    width: "100%" /* Ensures the column takes full width */,
                    gap: "24px" /* Adds consistent spacing between sections */,
                    minHeight:
                      "700px" /* Ensure the container has enough height */,
                  }}
                >
                  {/* Cat Photo Upload Section */}{" "}
                  <div
                    style={{
                      flex: "1" /* Takes up 50% of the available height */,
                      width:
                        "100%" /* Ensures full width equal to the Notes section */,
                      maxHeight:
                        "calc(50% - 12px)" /* Explicitly limit to 50% minus gap */,
                    }}
                  >
                    <label
                      style={{
                        display: "block",
                        fontSize: "1rem",
                        fontWeight: "500",
                        color: "#333",
                        marginBottom: "12px",
                        fontFamily: splineTheme.typography.fontFamily.body,
                      }}
                    >
                      Upload Your Cat's Photo
                    </label>
                    <div
                      style={{
                        height:
                          "calc(100% - 40px)" /* Height fills the container except for label height */,
                        borderRadius: "20px",
                        backgroundColor: "#FFEBEF",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        border: "2px dashed #F8C4D4",
                        cursor: "pointer",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      {formData.catPhoto ? (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          <img
                            src={formData.catPhoto}
                            alt="Cat Preview"
                            style={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              minWidth: "100%",
                              minHeight: "100%",
                              objectFit: "cover",
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              top: "10px",
                              right: "10px",
                              background: "rgba(255,255,255,0.8)",
                              borderRadius: "50%",
                              width: "30px",
                              height: "30px",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              cursor: "pointer",
                              zIndex: 2,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData({ ...formData, catPhoto: null });
                            }}
                          >
                            ✕
                          </div>
                        </div>
                      ) : formData.photoUrl ? (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          <BlurryLoadingImage
                            src={formData.photoUrl}
                            alt={formData.name}
                          />
                          <div
                            style={{
                              position: "absolute",
                              top: "10px",
                              right: "10px",
                              background: "rgba(255,255,255,0.8)",
                              borderRadius: "50%",
                              width: "30px",
                              height: "30px",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              cursor: "pointer",
                              zIndex: 2,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData({
                                ...formData,
                                photoUrl: null,
                              });
                            }}
                          >
                            ✕
                          </div>
                        </div>
                      ) : (
                        <>
                          <svg
                            width="40"
                            height="40"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#F06292"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                            <circle cx="12" cy="13" r="4"></circle>
                          </svg>
                          <p
                            style={{
                              marginTop: "10px",
                              color: "#F06292",
                              fontSize: "0.9rem",
                            }}
                          >
                            Click to upload your cat's photo
                          </p>
                          <p
                            style={{
                              color: "#888",
                              fontSize: "0.8rem",
                              marginTop: "5px",
                            }}
                          >
                            JPG, PNG or GIF (max. 5MB)
                          </p>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          opacity: 0,
                          cursor: "pointer",
                        }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            // File size validation (max 5MB)
                            if (e.target.files[0].size > 5 * 1024 * 1024) {
                              alert(
                                "File size exceeds 5MB limit. Please choose a smaller file."
                              );
                              return;
                            }

                            const reader = new FileReader();
                            reader.onload = (event) => {
                              // Store the base64 image temporarily for preview
                              setFormData({
                                ...formData,
                                catPhoto: event.target.result,
                              });
                            };
                            reader.readAsDataURL(e.target.files[0]);
                          }
                        }}
                      />
                    </div>
                  </div>{" "}
                  {/* Notes */}{" "}
                  <div
                    style={{
                      flex: "1" /* Takes up 50% of the available height */,
                      width:
                        "100%" /* Ensures full width equal to the Photo Upload section */,
                      minHeight:
                        "calc(50% - 12px)" /* Ensure minimum height of 50% minus gap */,
                    }}
                  >
                    <label
                      style={{
                        display: "block",
                        fontSize: "1rem",
                        fontWeight: "500",
                        color: "#333",
                        marginBottom: "12px",
                        fontFamily: splineTheme.typography.fontFamily.body,
                      }}
                    >
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      placeholder="Feline's special notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "4px",
                        border: "1px solid #CCCCCC",
                        fontSize: "1rem",
                        height:
                          "calc(100% - 40px)" /* Height fills the container except for label height */,
                        resize: "none",
                        fontFamily: splineTheme.typography.fontFamily.body,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Allergies & Intolerances - Below both columns */}
              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "1rem",
                    fontWeight: "500",
                    color: "#333",
                    marginBottom: "12px",
                    fontFamily: splineTheme.typography.fontFamily.body,
                  }}
                >
                  Allergies & Intolerances (Avoid specific ingredients)
                  <span style={{ color: "red" }}> *</span>
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: "15px",
                  }}
                >
                  {allergyOptions
                    .sort((a, b) => a.label.length - b.label.length) // Sort by text length, shortest first
                    .map((option) => (
                      <div
                        key={option.value}
                        onClick={() => handleAllergyChange(option.value)}
                        style={{
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "flex-start",
                          width: "100%",
                        }}
                      >
                        {/* Radio button circle */}
                        <div
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            border: "2px solid #B0B0B0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: "10px",
                            flexShrink: 0,
                            marginTop: "10px",
                          }}
                        >
                          {formData.allergies.includes(option.value) && (
                            <div
                              style={{
                                width: "10px",
                                height: "10px",
                                borderRadius: "50%",
                                backgroundColor: "#4A72B8",
                              }}
                            ></div>
                          )}
                        </div>

                        {/* Main label container */}
                        <div
                          style={{
                            padding: "10px 12px",
                            borderRadius: "8px",
                            border: "1px solid #D0D0D0",
                            backgroundColor: formData.allergies.includes(
                              option.value
                            )
                              ? "#F8F9FD"
                              : "#FFFFFF",
                            borderColor: formData.allergies.includes(
                              option.value
                            )
                              ? "#A8B8E8"
                              : "#D0D0D0",
                            flex: 1,
                          }}
                        >
                          <div
                            style={{
                              fontWeight: "500",
                              fontSize: "0.9rem",
                              color: "#686868",
                            }}
                          >
                            {option.label}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Action Button */}
              <div
                style={{
                  textAlign: "center",
                  marginTop: "40px",
                  marginBottom: "40px",
                }}
              >
                <button
                  type="submit"
                  disabled={isUploading || isSubmitting}
                  style={{
                    backgroundColor:
                      isUploading || isSubmitting ? "#A8B8E8" : "#4A72B8",
                    color: "white",
                    padding: "15px 30px",
                    borderRadius: "6px",
                    border: "none",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    cursor:
                      isUploading || isSubmitting ? "not-allowed" : "pointer",
                    minWidth: "250px",
                    fontFamily: splineTheme.typography.fontFamily.body,
                  }}
                >
                  {isUploading
                    ? "UPLOADING IMAGE..."
                    : isSubmitting
                    ? "SAVING CHANGES..."
                    : "SAVE CHANGES"}
                </button>
                <button
                  type="button"
                  onClick={handleBack}
                  style={{
                    backgroundColor: "#f8d4d4",
                    color: "#333",
                    padding: "15px 30px",
                    borderRadius: "6px",
                    border: "none",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    cursor: "pointer",
                    minWidth: "200px",
                    fontFamily: splineTheme.typography.fontFamily.body,
                    marginLeft: "20px",
                  }}
                >
                  CANCEL
                </button>
                {submitError && (
                  <p
                    style={{
                      color: "#e74c3c",
                      marginTop: "10px",
                      fontFamily: splineTheme.typography.fontFamily.body,
                    }}
                  >
                    {submitError}
                  </p>
                )}
              </div>
            </form>
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

          {/* Floating Chat Icon */}
          <div
            style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #4A72B8, #6B5B95)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
              cursor: "pointer",
              zIndex: 1000,
            }}
          >
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="10" r="1"></circle>
              <circle cx="8" cy="10" r="1"></circle>
              <circle cx="16" cy="10" r="1"></circle>
            </svg>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default EditCatProfile;
