import React, { useState } from "react";
import PageWrapper from "../component/global/PageWrapper";
import { splineTheme } from "../theme/global_theme";
import { uploadImage } from "../services/api";

// Using cat from existing resources as a temporary placeholder
import catPaw from "../assets/image/homepage/cat_section1_2.png";

function CatProfile() {
  // State for form values
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    weight: "",
    age: "",
    proteinPreference: "",
    dietaryRequirements: [],
    allergies: "",
    notes: "",
    catPhoto: null,
  });

  // Add loading state for image upload
  const [isUploading, setIsUploading] = useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
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

    let submissionData = { ...formData };

    // If there's a catPhoto, upload it to imgBB and replace with URL
    if (formData.catPhoto) {
      setIsUploading(true);
      const imageUrl = await uploadImageHandler(formData.catPhoto);
      if (imageUrl) {
        submissionData.catPhoto = imageUrl;
      }
      setIsUploading(false);
    }

    console.log("Form Data to submit:", submissionData);
    // Here you would typically send the data to a backend service
  };
  // Protein preferences options
  const proteinOptions = [
    { value: "chicken", label: "Chicken" },
    { value: "turkey", label: "Turkey" },
    { value: "salmon", label: "Salmon" },
    { value: "beef", label: "Beef" },
    { value: "tuna", label: "Tuna" },
    { value: "duck", label: "Duck" },
    { value: "whitefish", label: "Whitefish" },
    { value: "plant", label: "Plant-based options" },
  ];

  // Dietary requirements options
  const dietaryOptions = [
    {
      value: "senior",
      title: "Senior Cat Formula",
      description: "Specialized nutrition for cats aged 7+",
    },
    {
      value: "sensitive",
      title: "Sensitive Stomach",
      description:
        "Easily digestible ingredients for cats with digestive issues",
    },
    {
      value: "kitten",
      title: "Kitten Growth Formula",
      description: "High protein meals for growing kittens",
    },
    {
      value: "kidney",
      title: "Kidney Support",
      description: "Reduced phosphorus & sodium to support kidney health",
    },
    {
      value: "urinary",
      title: "Urinary Tract Health",
      description: "High moisture meals to prevent UTIs",
    },
    {
      value: "weight",
      title: "Weight Control",
      description: "Low-calorie, high-protein meals for overweight cats",
    },
    {
      value: "hairball",
      title: "Hairball Control",
      description: "Fiber-rich ingredients to aid digestion",
    },
  ];

  // Allergies & Intolerances options
  const allergyOptions = [
    { value: "no-chicken", label: "No Chicken" },
    { value: "grain-free", label: "Grain-Free (No wheat, corn, soy)" },
    { value: "no-beef", label: "No Beef" },
    { value: "dairy-free", label: "Dairy-Free (No milk, cheese, yogurt)" },
    { value: "no-egg", label: "No Egg" },
    {
      value: "no-artificial",
      label: "No Artificial Preservatives or Colorants",
    },
    { value: "no-seafood", label: "No Seafood" },
  ];

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
          {" "}
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
          {/* Sign-in Title Block */}
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
              SIGN IN YOUR CAT PROFILE
            </h2>{" "}
            <p
              style={{
                fontSize: "1rem",
                color: "#555555",
                maxWidth: "700px",
                margin: "0 auto",
                fontFamily: splineTheme.typography.fontFamily.body,
              }}
            >
              PurrPouch AI will analyze your inputs and recommend the best meal
              combination while avoiding allergens or unwanted ingredients!
            </p>
          </div>
          {/* Form section */}{" "}
          <form onSubmit={handleSubmit}>
            {" "}
            {/* Two-column layout for entire form */}{" "}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "47.5% 47.5%",
                gap: "5%",
                marginBottom: "24px",
                position: "relative",
                minHeight:
                  "700px" /* Set a minimum height for the form layout to allow proper vertical sizing */,
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
                </div>{" "}
                {/* Breed, Weight, Age Fields - In a 3-column grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "30px" /* Increased gap between cells */,
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
                      <span style={{ color: "red" }}> *</span>
                    </label>
                    <input
                      type="text"
                      name="breed"
                      placeholder="Feline's breed"
                      value={formData.breed}
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
                      type="text"
                      name="weight"
                      placeholder="Feline's weight"
                      value={formData.weight}
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
                      type="text"
                      name="age"
                      placeholder="Feline's age"
                      value={formData.age}
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
                </div>{" "}
                {/* Dietary Requirements */}
                <div style={{ marginBottom: "24px" }}>
                  {" "}
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
              {/* Right column - Photo Upload and Notes */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%" /* Makes the right column take full height */,
                  width: "100%" /* Ensures the column takes full width */,
                }}
              >
                {/* Cat Photo Upload Section */}
                <div
                  style={{
                    marginBottom: "24px",
                    flex: "1" /* Takes up 50% of the available height */,
                    width:
                      "100%" /* Ensures full width equal to the Notes section */,
                  }}
                >
                  {" "}
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
                      width: "100%",
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
                    {" "}
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
                {/* Notes */}
                <div
                  style={{
                    flex: "1" /* Takes up 50% of the available height */,
                    width:
                      "100%" /* Ensures full width equal to the Photo Upload section */,
                  }}
                >
                  {" "}
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
                      resize: "vertical",
                      fontFamily: splineTheme.typography.fontFamily.body,
                    }}
                  />
                </div>
              </div>{" "}
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
              </label>{" "}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                  gap: "15px",
                }}
              >
                {allergyOptions
                  .sort((a, b) => a.label.length - b.label.length) // Sort by text length, shortest first
                  .map((option) => (
                    <div
                      key={option.value}
                      onClick={() =>
                        setFormData({ ...formData, allergies: option.value })
                      }
                      style={{
                        cursor: "pointer",
                        display: "flex",
                        alignItems:
                          "flex-start" /* Changed from 'center' to 'flex-start' to align with top */,
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
                          marginTop:
                            "10px" /* Added to align with the top of the label container */,
                        }}
                      >
                        {formData.allergies === option.value && (
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
                            formData.allergies === option.value
                              ? "#F8F9FD"
                              : "#FFFFFF",
                          borderColor:
                            formData.allergies === option.value
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
              {" "}
              <button
                type="submit"
                disabled={isUploading}
                style={{
                  backgroundColor: isUploading ? "#A8B8E8" : "#4A72B8",
                  color: "white",
                  padding: "15px 30px",
                  borderRadius: "6px",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  cursor: isUploading ? "not-allowed" : "pointer",
                  minWidth: "250px",
                  fontFamily: splineTheme.typography.fontFamily.body,
                }}
              >
                {isUploading
                  ? "UPLOADING IMAGE..."
                  : formData.catPhoto
                  ? "SUBMIT CAT PROFILE"
                  : "VIEW YOUR FELINE PROFILE"}
              </button>
            </div>
          </form>
        </div>

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
    </PageWrapper>
  );
}

export default CatProfile;
