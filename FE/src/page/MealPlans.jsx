import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getMealPlans,
  addToCart,
  sendChatMessage,
  getCatRecommendations,
  saveChatHistory,
  getChatHistory,
  clearChatHistory,
  generateAiMealKit,
  getAllFoodSkus,
} from "../services/api";
import PageWrapper from "../component/global/PageWrapper";
import { splineTheme } from "../theme/global_theme";
import {
  useCatProfile,
  CatProfileProvider,
} from "../provider/cat_profile_provider";
import { formatMealItems } from "../utils/formatMealItems";

// Food type images from assets
import rawChickenImg from "../assets/image/meal-plan/image.png";
import dryKibbleImg from "../assets/image/meal-plan/image-1.png";
import wetFoodImg from "../assets/image/meal-plan/image-2.png";
import mixedFoodImg from "../assets/image/meal-plan/image-3.png";

// Mic icon for voice input
import micIcon from "../assets/icons/mic.svg";

// MealSetCard Component for displaying meal plans in the required layout
function MealSetCard({
  mealKit,
  isSelected,
  onSelect,
  quantity,
  onQuantityChange,
  totalPrice,
  onAddToCart,
}) {
  // Map meal types to user-friendly labels
  const mealTypeLabels = {
    BREAKFAST: "Morning",
    LUNCH: "Midday snack",
    DINNER: "Evening",
  };

  // Determines which icon to use for each food item
  const getItemIcon = (index) => {
    // Use diamond for main foods, plus for supplements
    return index < 2 ? "◆" : "+";
  };

  // Get icon color based on index
  const getIconColor = (index) => {
    return index < 2 ? "#FFA500" : "#555"; // Orange for main foods, dark gray for supplements
  };

  return (
    <div
      onClick={onSelect}
      style={{
        width: "calc(50% - 1rem)",
        minWidth: "300px",
        borderRadius: "10px",
        backgroundColor: "#FFFFFF",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: isSelected ? "0 4px 8px rgba(90, 135, 197, 0.2)" : "none",
        overflow: "hidden",
        border: isSelected ? "2px solid #5A87C5" : "1px solid #dce6f5",
      }}
    >
      {/* Title Bar */}
      <div
        style={{
          backgroundColor: "#E9ECEF",
          padding: "12px 16px",
          borderTopLeftRadius: "10px",
          borderTopRightRadius: "10px",
          textAlign: "center",
          fontFamily: splineTheme.typography.fontFamily.body,
        }}
      >
        <h4 style={{ margin: 0, fontWeight: "normal" }}>{mealKit.kitName}</h4>
      </div>

      {/* Meal Sections */}
      {mealKit.meals.map((meal, mealIndex) => (
        <div
          key={`meal-${mealIndex}`}
          style={{
            marginBottom: mealIndex < mealKit.meals.length - 1 ? "12px" : 0,
          }}
        >
          {/* Meal Header Row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              backgroundColor: "#FFFFFF",
              padding: "10px 16px",
              borderBottom: "1px solid #E9ECEF",
            }}
          >
            <div
              style={{
                fontWeight: "600",
                color: "#333",
              }}
            >
              {mealTypeLabels[meal.mealType] || meal.mealType}
            </div>
            <div
              style={{
                fontWeight: "600",
                color: "#333",
              }}
            >
              Portions
            </div>
          </div>

          {/* Food Items */}
          {meal.foodItems.map((item, itemIndex) => (
            <div
              key={`food-item-${itemIndex}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 16px",
                backgroundColor: "#FFFFFF",
                borderBottom:
                  itemIndex < meal.foodItems.length - 1
                    ? "1px solid #f5f5f5"
                    : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "75%",
                }}
              >
                <span
                  style={{
                    marginRight: "8px",
                    color: getIconColor(itemIndex),
                    fontWeight: "bold",
                  }}
                >
                  {getItemIcon(itemIndex)}
                </span>
                <span style={{ fontSize: "0.9rem" }}>{item.name}</span>
              </div>
              <span
                style={{
                  fontSize: "0.9rem",
                  textAlign: "right",
                }}
              >
                {item.quantity} {item.unit}
              </span>
            </div>
          ))}
        </div>
      ))}

      {/* Quantity and Price Section */}
      <div
        style={{
          padding: "16px",
          backgroundColor: "#f8f9fa",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              backgroundColor: "#E9ECEF",
              padding: "6px 12px",
              borderRadius: "5px",
              marginRight: "10px",
              fontSize: "0.9rem",
            }}
          >
            Quantity
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuantityChange(-1);
              }}
              style={{
                width: "28px",
                height: "28px",
                border: "1px solid #dce6f5",
                borderRadius: "50%",
                background: "#FFFFFF",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              -
            </button>
            <span style={{ margin: "0 10px", fontSize: "1rem" }}>
              {quantity}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuantityChange(1);
              }}
              style={{
                width: "28px",
                height: "28px",
                border: "1px solid #dce6f5",
                borderRadius: "50%",
                background: "#FFFFFF",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              +
            </button>
          </div>
        </div>
        <div
          style={{
            backgroundColor: "#E9ECEF",
            padding: "6px 12px",
            borderRadius: "5px",
            fontWeight: "bold",
            fontSize: "1.1rem",
          }}
        >
          {totalPrice.toLocaleString()}
        </div>
      </div>

      {/* Add to Cart Button */}
      {isSelected && (
        <div
          style={{
            padding: "0 16px 16px 16px",
            backgroundColor: "#f8f9fa",
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
            style={{
              padding: "10px",
              backgroundColor: "#3D5A9A",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "600",
              fontFamily: splineTheme.typography.fontFamily.body,
              width: "100%",
            }}
          >
            Add to cart
          </button>
        </div>
      )}
    </div>
  );
}

function MealPlans() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    profiles,
    loading: profileLoading,
    error: profileError,
    fetchCatProfile,
  } = useCatProfile();
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("ai-chat");
  const [activeDietType, setActiveDietType] = useState("Suggest Diet Type");
  const [quantity, setQuantity] = useState(1);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [generatingMeal, setGeneratingMeal] = useState(false);
  const [generatedMealKits, setGeneratedMealKits] = useState([]);
  const [selectedMealKitId, setSelectedMealKitId] = useState(null);
  const [foodSkus, setFoodSkus] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const chatContainerRef = useRef(null);
  const recognitionRef = useRef(null);

  // Get the profile from context
  const profile = profiles[id];
  useEffect(() => {
    // Fetch cat profile if not already in context
    fetchCatProfile(id);

    // Fetch meal plans
    const fetchMealPlans = async () => {
      try {
        setLoading(true);
        const response = await getMealPlans(id);
        setMealPlans(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching meal plans:", err);
        setError("Failed to load meal plans. Please try again later.");
        setLoading(false);
      }
    };

    // Fetch all food SKUs for price calculation
    const fetchFoodSkus = async () => {
      try {
        const response = await getAllFoodSkus();
        setFoodSkus(response.data);
      } catch (err) {
        console.error("Error fetching food SKUs:", err);
      }
    };

    fetchMealPlans();
    fetchFoodSkus();

    // Load chat history from localStorage
    if (id) {
      const history = getChatHistory(id);
      if (history && history.length > 0) {
        setChatMessages(history);

        // If there are recommendations in the last AI message, show them
        const lastAiMessage = [...history]
          .reverse()
          .find((msg) => msg.type === "ai" && msg.recommendations);
        if (lastAiMessage && lastAiMessage.recommendations) {
          setRecommendations(lastAiMessage.recommendations);
        }
      }
    }

    // Initialize speech recognition
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setChatInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [id, fetchCatProfile]);

  // Load chat history from localStorage
  useEffect(() => {
    if (id) {
      const history = getChatHistory(id);
      if (history && history.length > 0) {
        setChatMessages(history);

        // If there are recommendations in the last AI message, show them
        const lastAiMessage = [...history]
          .reverse()
          .find((msg) => msg.type === "ai" && msg.recommendations);
        if (lastAiMessage && lastAiMessage.recommendations) {
          setRecommendations(lastAiMessage.recommendations);
        }
      }
    }
  }, [id]);

  // Scroll to bottom of chat container when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping]);

  // Initialize speech recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setChatInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);
  const handleVoiceInput = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      } else {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (error) {
          console.error("Speech recognition error:", error);
        }
      }
    } else {
      alert("Speech recognition is not supported in your browser.");
    }
  };
  const handleTabChange = (tab) => {
    setActiveTab(tab);

    // If switching to suggest-diet tab and no meal kits are generated yet, start generating
    if (
      tab === "suggest-diet" &&
      generatedMealKits.length === 0 &&
      !generatingMeal
    ) {
      handleGenerateMealKit();
    }
  };

  const handleQuantityChange = (change) => {
    // Prevent quantity from going below 1
    const newQuantity = Math.max(1, quantity + change);
    setQuantity(newQuantity);

    // Recalculate price if we have a selected meal kit
    if (selectedMealKitId) {
      const selectedKit = generatedMealKits.find(
        (kit) => kit.kitId === selectedMealKitId
      );
      if (selectedKit) {
        calculateTotalPrice(selectedKit, newQuantity);
      }
    }
  };

  const handleMealKitSelect = (kitId) => {
    setSelectedMealKitId(kitId);
    const selectedKit = generatedMealKits.find((kit) => kit.kitId === kitId);
    if (selectedKit) {
      calculateTotalPrice(selectedKit);
    }
  };

  const calculateTotalPrice = (mealKit, qty = quantity) => {
    if (!mealKit || !foodSkus || foodSkus.length === 0) return;

    let price = 0;
    // Loop through all meals and their food items
    mealKit.meals.forEach((meal) => {
      meal.foodItems.forEach((item) => {
        // Find the matching SKU in our foodSkus array
        const skuInfo = foodSkus.find((sku) => sku.id === item.foodSkuId);
        if (skuInfo && skuInfo.price) {
          price += skuInfo.price * item.quantity;
        }
      });
    });

    // If no price information is found, set a default price
    if (price === 0) {
      price = 150000; // Default price if no SKU prices are available
    }

    // Multiply by quantity
    price = price * qty;

    setTotalPrice(price);
    return price;
  };
  const handleGenerateMealKit = async () => {
    try {
      setGeneratingMeal(true);

      // DEVELOPMENT MOCK: Using a mock response instead of calling the AI service
      // to save tokens during development
      const mockResponse = {
        data: {
          kitId: 3,
          kitName: "Khiem's Daily Meal Kit",
          catProfileId: id,
          meals: [
            {
              mealId: 7,
              mealType: "BREAKFAST",
              foodItems: [
                {
                  foodSkuId: 2,
                  name: "Royal Canin Chicken in Gravy",
                  type: "WET",
                  brand: "Royal Canin",
                  quantity: 1.0,
                  unit: "ml",
                },
                {
                  foodSkuId: 7,
                  name: "Whiskas Chicken Chunks #1",
                  type: "TOPPING",
                  brand: "Whiskas",
                  quantity: 0.5,
                  unit: "gram",
                },
              ],
            },
            {
              mealId: 8,
              mealType: "LUNCH",
              foodItems: [
                {
                  foodSkuId: 89,
                  name: "Me-O Kitten Formula #22",
                  type: "DRY",
                  brand: "Me-O",
                  quantity: 1.0,
                  unit: "gram",
                },
                {
                  foodSkuId: 4,
                  name: "Royal Canin FreezeBites",
                  type: "SNACK",
                  brand: "Royal Canin",
                  quantity: 0.5,
                  unit: "gram",
                },
              ],
            },
            {
              mealId: 9,
              mealType: "DINNER",
              foodItems: [
                {
                  foodSkuId: 2,
                  name: "Royal Canin Chicken in Gravy",
                  type: "WET",
                  brand: "Royal Canin",
                  quantity: 1.0,
                  unit: "ml",
                },
                {
                  foodSkuId: 7,
                  name: "Whiskas Chicken Chunks #1",
                  type: "TOPPING",
                  brand: "Whiskas",
                  quantity: 0.5,
                  unit: "gram",
                },
              ],
            },
          ],
        },
      };

      // Comment out the actual API call during development
      // const response = await generateAiMealKit(id, chatHistory);

      // Use the mock response instead
      const response = mockResponse;

      if (response.data) {
        // In a real scenario, the API would return multiple meal kits
        // For now we'll create a second variant based on the first one
        const firstMealKit = response.data;

        // Create a second meal kit as a variant of the first one
        const secondMealKit = {
          ...JSON.parse(JSON.stringify(firstMealKit)),
          kitId: firstMealKit.kitId + 100, // Ensure unique ID
          kitName: `${profile?.name || "Cat"}'s Premium Meal Kit`, // Different name
        };

        // Modify some items in the second meal kit to make it different
        if (secondMealKit.meals && secondMealKit.meals.length > 0) {
          secondMealKit.meals.forEach((meal) => {
            if (meal.foodItems && meal.foodItems.length > 0) {
              meal.foodItems.forEach((item) => {
                // Make premium version slightly more expensive
                item.quantity = Math.round(item.quantity * 1.2 * 10) / 10;

                // Change some item names to make it visibly different
                if (item.name.includes("Royal Canin")) {
                  item.name = item.name.replace(
                    "Royal Canin",
                    "Premium Royal Canin"
                  );
                  item.brand = "Premium Royal Canin";
                } else if (item.name.includes("Purina")) {
                  item.name = item.name.replace("Purina", "Purina Premium");
                  item.brand = "Purina Premium";
                }
              });
            }
          });
        }

        // Set both meal kits in state
        const mealKits = [firstMealKit, secondMealKit];
        setGeneratedMealKits(mealKits);
        setSelectedMealKitId(firstMealKit.kitId);
        calculateTotalPrice(firstMealKit);
      }
    } catch (err) {
      console.error("Error generating AI meal kit:", err); // If there's an error, set mock meal kits for testing
      const mockMealKit1 = {
        kitId: 1,
        kitName: "Set 1: Light and Easy-to-Digest Meal Plan",
        catProfileId: id,
        meals: [
          {
            mealId: 1,
            mealType: "BREAKFAST",
            foodItems: [
              {
                foodSkuId: 2,
                name: "Royal Canin Kitten Instinctive Gravy Wet Pouch",
                type: "WET",
                brand: "Royal Canin",
                quantity: 50.0,
                unit: "g",
              },
              {
                foodSkuId: 11,
                name: "Reflex Plus Kitten Chicken & Rice",
                type: "DRY",
                brand: "Reflex Plus",
                quantity: 20.0,
                unit: "g",
              },
              {
                foodSkuId: 15,
                name: "Kit Cat Goat Milk",
                type: "SUPPLEMENT",
                brand: "Kit Cat",
                quantity: 10.0,
                unit: "ml",
              },
            ],
          },
          {
            mealId: 2,
            mealType: "LUNCH",
            foodItems: [
              {
                foodSkuId: 263,
                name: "Bow Wow Freeze-Dried Salmon Bites",
                type: "TREAT",
                brand: "Bow Wow",
                quantity: 10.0,
                unit: "g",
              },
              {
                foodSkuId: 204,
                name: "CIAO Churu Tuna Puree",
                type: "TOPPING",
                brand: "CIAO",
                quantity: 10.0,
                unit: "ml",
              },
            ],
          },
          {
            mealId: 3,
            mealType: "DINNER",
            foodItems: [
              {
                foodSkuId: 30,
                name: "Schesir Tuna & Aloe Wet Food",
                type: "WET",
                brand: "Schesir",
                quantity: 50.0,
                unit: "g",
              },
              {
                foodSkuId: 31,
                name: "Fitmin For Life Kitten Dry Food",
                type: "DRY",
                brand: "Fitmin",
                quantity: 20.0,
                unit: "g",
              },
              {
                foodSkuId: 32,
                name: "Kit Cat Goat Milk",
                type: "SUPPLEMENT",
                brand: "Kit Cat",
                quantity: 10.0,
                unit: "ml",
              },
            ],
          },
        ],
      };

      // Create a premium variant
      const mockMealKit2 = {
        kitId: 2,
        kitName: "Set 2: Premium Nutrient-Rich Meal Plan",
        catProfileId: id,
        meals: [
          {
            mealId: 1,
            mealType: "BREAKFAST",
            foodItems: [
              {
                foodSkuId: 5,
                name: "Premium Royal Canin Salmon in Gravy",
                type: "WET",
                brand: "Premium Royal Canin",
                quantity: 60.0,
                unit: "g",
              },
              {
                foodSkuId: 15,
                name: "Hill's Science Diet Kitten Indoor",
                type: "DRY",
                brand: "Hill's",
                quantity: 25.0,
                unit: "g",
              },
              {
                foodSkuId: 16,
                name: "Whiskas Catmilk Plus",
                type: "SUPPLEMENT",
                brand: "Whiskas",
                quantity: 15.0,
                unit: "ml",
              },
            ],
          },
          {
            mealId: 2,
            mealType: "LUNCH",
            foodItems: [
              {
                foodSkuId: 270,
                name: "Orijen Free-Run Duck Treats",
                type: "TREAT",
                brand: "Orijen",
                quantity: 15.0,
                unit: "g",
              },
              {
                foodSkuId: 210,
                name: "Wellness CORE Protein-Rich Salmon",
                type: "TOPPING",
                brand: "Wellness",
                quantity: 15.0,
                unit: "g",
              },
            ],
          },
          {
            mealId: 3,
            mealType: "DINNER",
            foodItems: [
              {
                foodSkuId: 35,
                name: "Hill's Science Diet Chicken Wet Food",
                type: "WET",
                brand: "Hill's Science Diet",
                quantity: 60.0,
                unit: "g",
              },
              {
                foodSkuId: 38,
                name: "Blue Buffalo Indoor Health Dry Food",
                type: "DRY",
                brand: "Blue Buffalo",
                quantity: 25.0,
                unit: "g",
              },
              {
                foodSkuId: 39,
                name: "Whiskas Catmilk Plus",
                type: "SUPPLEMENT",
                brand: "Whiskas",
                quantity: 15.0,
                unit: "ml",
              },
            ],
          },
        ],
      };

      const mealKits = [mockMealKit1, mockMealKit2];
      setGeneratedMealKits(mealKits);
      setSelectedMealKitId(mockMealKit1.kitId);
      calculateTotalPrice(mockMealKit1);
    } finally {
      setGeneratingMeal(false);
    }
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    // Add user message to chat
    const userMessage = {
      type: "user",
      content: chatInput,
    };

    setChatMessages((prevMessages) => {
      const updatedMessages = [...prevMessages, userMessage];
      saveChatHistory(id, updatedMessages);
      return updatedMessages;
    });

    // Show loading indicator
    setChatLoading(true);

    // Send message to backend
    sendChatMessage(chatInput, id)
      .then((response) => {
        if (response.data && response.data.success) {
          // Simulate typing for a more realistic chat experience
          simulateTyping(response.data.message, response.data.recommendations);
        }
      })
      .catch((err) => {
        console.error("Error sending chat message:", err);
        // Add error message to chat
        const errorMessage = {
          type: "error",
          content: "Sorry, I couldn't process that request. Please try again.",
        };
        setChatMessages((prevMessages) => [...prevMessages, errorMessage]);
      })
      .finally(() => {
        setChatLoading(false);
        setChatInput("");
      });
  };

  const simulateTyping = (message, recommendations = []) => {
    // Start typing animation
    setIsTyping(true);

    // Delay adding the message to simulate typing
    setTimeout(() => {
      setIsTyping(false);

      // Add AI message to chat
      const aiMessage = {
        type: "ai",
        content: message,
        recommendations: recommendations,
      };

      setChatMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, aiMessage];
        saveChatHistory(id, updatedMessages);
        return updatedMessages;
      });

      // If there are recommendations, update state
      if (recommendations && recommendations.length > 0) {
        setRecommendations(recommendations);
      }
    }, 1500); // Simulate 1.5 seconds of typing
  };
  const handleAddToCart = async (mealPlanId) => {
    try {
      // If this is an AI-generated meal kit, send it differently
      const selectedKit = generatedMealKits.find(
        (kit) => kit.kitId === mealPlanId
      );
      if (selectedKit) {
        await addToCart(mealPlanId, quantity, id, selectedKit);
      } else {
        await addToCart(mealPlanId, quantity, id);
      }
      alert("Added to cart successfully!");
      // Optionally navigate to cart or show a success message
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("Failed to add to cart. Please try again.");
    }
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
            color: "#3D5A9A",
            marginBottom: "1rem",
            fontFamily: "Luckiest Guy",
            fontWeight: "normal",
            textAlign: "center",
            textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
          }}
        >
          MENU
        </h1>{" "}
        <h2
          style={{
            fontSize: "2.5rem",
            color: "#1d3557",
            marginBottom: "2.5rem",
            fontFamily: "Luckiest Guy",
            fontWeight: "normal",
            textAlign: "center",
            textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
          }}
        >
          ORDER MEAL
        </h2>
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              color: "#5A87C5",
              fontFamily: splineTheme.typography.fontFamily.body,
            }}
          >
            <p>Loading meal plans...</p>
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
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                marginTop: "1rem",
                fontFamily: splineTheme.typography.fontFamily.body,
              }}
              onClick={() => navigate(`/cat-profile/${id}`)}
            >
              Go Back
            </button>
          </div>
        ) : profile ? (
          <>
            {/* Visual Food Showcase */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                width: "100%",
                marginBottom: "2rem",
              }}
            >
              {" "}
              {[rawChickenImg, dryKibbleImg, wetFoodImg, mixedFoodImg].map(
                (img, index) => (
                  <div
                    key={index}
                    style={{
                      width: "14vw",
                      height: "14vw",
                      borderRadius: "50%",
                      overflow: "hidden",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
                      minWidth: "150px",
                      minHeight: "150px",
                      maxWidth: "270px",
                      maxHeight: "270px",
                    }}
                  >
                    <img
                      src={img}
                      alt={`Food type ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                )
              )}
            </div>

            {/* AI Recommendation Text */}
            <p
              style={{
                fontSize: "1.2rem",
                color: "#5A87C5",
                marginBottom: "2rem",
                textAlign: "center",
                fontFamily: splineTheme.typography.fontFamily.body,
              }}
            >
              Here's the AI recommendation nutrition meal for{" "}
              <span style={{ fontWeight: "bold", color: "#5A87C5" }}>
                {profile.name}
              </span>
              , check it out!
            </p>

            {/* Tabbed Interface */}
            <div
              style={{
                width: "100%",
                marginBottom: "2rem",
              }}
            >
              {/* Tab Navigation */}
              <div
                style={{
                  display: "flex",
                  marginBottom: "1px",
                }}
              >
                <div
                  style={{
                    padding: "1rem 2rem",
                    backgroundColor:
                      activeTab === "ai-chat" ? "#FCEEEE" : "#f8f9fa",
                    borderTopLeftRadius: "10px",
                    borderTopRightRadius: "10px",
                    cursor: "pointer",
                    fontWeight: activeTab === "ai-chat" ? "600" : "normal",
                    fontFamily: splineTheme.typography.fontFamily.body,
                  }}
                  onClick={() => handleTabChange("ai-chat")}
                >
                  AI Chat Bot
                </div>
                <div
                  style={{
                    padding: "1rem 2rem",
                    backgroundColor:
                      activeTab === "suggest-diet" ? "#FCEEEE" : "#f8f9fa",
                    borderTopLeftRadius: "10px",
                    borderTopRightRadius: "10px",
                    marginLeft: "10px",
                    cursor: "pointer",
                    fontWeight: activeTab === "suggest-diet" ? "600" : "normal",
                    fontFamily: splineTheme.typography.fontFamily.body,
                  }}
                  onClick={() => handleTabChange("suggest-diet")}
                >
                  Suggest Diet Type
                </div>
              </div>

              {/* Tab Content */}
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "2px solid #FCEEEE",
                  borderRadius: "0 10px 10px 10px",
                  padding: "2rem",
                  minHeight: "400px",
                }}
              >
                {activeTab === "ai-chat" ? (
                  <div>
                    {/* AI Chat Bot Content */}
                    <div
                      style={{
                        marginBottom: "1.5rem",
                        fontFamily: splineTheme.typography.fontFamily.body,
                      }}
                    >
                      {/* Welcome Message */}
                      {chatMessages.length === 0 && (
                        <>
                          <p style={{ marginBottom: "1rem", color: "#5A87C5" }}>
                            Hi {profile.ownerName || "there"}, welcome to
                            PurrPawchi
                          </p>
                          <p
                            style={{ marginBottom: "1.5rem", color: "#5A87C5" }}
                          >
                            Here's the recommendation for{" "}
                            <span style={{ fontWeight: "bold" }}>
                              {profile.name}
                            </span>
                            , check it out!
                          </p>
                        </>
                      )}

                      {/* Chat Messages */}
                      <div
                        style={{
                          marginBottom: "1.5rem",
                          minHeight: 220,
                          maxHeight: 300,
                          overflowY: "auto",
                          border: "1px solid #FCEEEE",
                          borderRadius: 10,
                          padding: 12,
                        }}
                        ref={chatContainerRef}
                      >
                        {chatMessages.map((msg, index) => (
                          <div
                            key={index}
                            style={{
                              marginBottom: "1rem",
                              textAlign: msg.type === "user" ? "right" : "left",
                            }}
                          >
                            <div
                              style={{
                                display: "inline-block",
                                backgroundColor:
                                  msg.type === "user"
                                    ? "#E3F2FD"
                                    : msg.type === "error"
                                    ? "#FFEBEE"
                                    : "#f8f9fa",
                                padding: "0.75rem 1rem",
                                borderRadius: "10px",
                                maxWidth: "80%",
                                color:
                                  msg.type === "error" ? "#D32F2F" : "#5A87C5",
                                textAlign: "left",
                                fontFamily:
                                  splineTheme.typography.fontFamily.body,
                              }}
                            >
                              {msg.content}
                            </div>
                          </div>
                        ))}
                        {/* Typing animation */}
                        {isTyping && (
                          <div
                            style={{ textAlign: "left", marginBottom: "1rem" }}
                          >
                            <div
                              style={{
                                display: "inline-block",
                                backgroundColor: "#f8f9fa",
                                padding: "0.75rem 1rem",
                                borderRadius: "10px",
                                color: "#5A87C5",
                                fontFamily:
                                  splineTheme.typography.fontFamily.body,
                              }}
                            >
                              <span className="typing-indicator">
                                PurrPouch AI is typing...
                              </span>
                            </div>
                          </div>
                        )}
                        {chatLoading && !isTyping && (
                          <div
                            style={{
                              textAlign: "center",
                              marginBottom: "1rem",
                            }}
                          >
                            <p style={{ color: "#5A87C5" }}>Thinking...</p>
                          </div>
                        )}
                      </div>

                      {/* Chat Input Bar */}
                      <form
                        onSubmit={handleChatSubmit}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginTop: 8,
                        }}
                      >
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Ask for a meal recommendation..."
                          style={{
                            flex: 1,
                            padding: "0.75rem 1rem",
                            borderRadius: "10px",
                            border: "1px solid #FCEEEE",
                            fontSize: "1rem",
                            fontFamily: splineTheme.typography.fontFamily.body,
                          }}
                          disabled={chatLoading || isTyping}
                        />
                        <button
                          type="button"
                          onClick={handleVoiceInput}
                          style={{
                            background: isListening ? "#F8C8C8" : "#FCEEEE",
                            border: "none",
                            borderRadius: "50%",
                            width: 40,
                            height: 40,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            marginRight: 4,
                          }}
                          title={isListening ? "Listening..." : "Voice input"}
                          disabled={chatLoading || isTyping}
                        >
                          <img
                            src={micIcon}
                            alt="Mic"
                            style={{
                              width: 22,
                              height: 22,
                              opacity: isListening ? 1 : 0.7,
                            }}
                          />
                        </button>
                        <button
                          type="submit"
                          style={{
                            background: "#5A87C5",
                            color: "#fff",
                            border: "none",
                            borderRadius: "10px",
                            padding: "0.75rem 1.5rem",
                            fontWeight: 600,
                            fontFamily: splineTheme.typography.fontFamily.body,
                            cursor:
                              chatInput.trim() && !chatLoading && !isTyping
                                ? "pointer"
                                : "not-allowed",
                            opacity:
                              chatInput.trim() && !chatLoading && !isTyping
                                ? 1
                                : 0.6,
                          }}
                          disabled={
                            !chatInput.trim() || chatLoading || isTyping
                          }
                        >
                          Send{" "}
                        </button>{" "}
                      </form>

                      {/* Recommendations Section - show if we have recommendations */}
                      {recommendations.length > 0 && (
                        <div
                          style={{
                            backgroundColor: "#f8f9fa",
                            padding: "1.5rem",
                            borderRadius: "10px",
                            marginBottom: "1.5rem",
                          }}
                        >
                          <p
                            style={{
                              fontWeight: "bold",
                              marginBottom: "0.5rem",
                              fontSize: "1.1rem",
                              color: "#5A87C5",
                            }}
                          >
                            Recommended Foods for {profile.name}
                          </p>

                          <ul style={{ paddingLeft: "1.5rem" }}>
                            {recommendations.map((item, index) => (
                              <li
                                key={index}
                                style={{
                                  marginBottom: "0.5rem",
                                  color: "#5A87C5",
                                }}
                              >
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* If no recommendations yet and no chat history, show default recommendation */}
                      {recommendations.length === 0 &&
                        chatMessages.length === 0 && (
                          <div
                            style={{
                              backgroundColor: "#f8f9fa",
                              padding: "1.5rem",
                              borderRadius: "10px",
                              marginBottom: "1.5rem",
                            }}
                          >
                            <p
                              style={{
                                fontWeight: "bold",
                                marginBottom: "0.5rem",
                                fontSize: "1.1rem",
                                color: "#5A87C5",
                              }}
                            >
                              Default Recommended Foods for {profile.name}
                            </p>

                            <ul style={{ paddingLeft: "1.5rem" }}>
                              <li
                                style={{
                                  marginBottom: "0.5rem",
                                  color: "#5A87C5",
                                }}
                              >
                                ✓ Pate: Royal Canin Kitten Instinctive Wet Pouch
                              </li>
                              <li
                                style={{
                                  marginBottom: "0.5rem",
                                  color: "#5A87C5",
                                }}
                              >
                                ✓ Dry Food: Farmina N&D Prime Chicken &
                                Pomegranate Kitten
                              </li>{" "}
                              <li
                                style={{
                                  marginBottom: "0.5rem",
                                  color: "#5A87C5",
                                }}
                              >
                                ✓ Topping: KitRoot Savory Tuna Wet Food
                              </li>
                            </ul>
                          </div>
                        )}
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Suggest Diet Type Content */}
                    <div>
                      {/* Filter/Category Buttons */}
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "0.5rem",
                          marginBottom: "2rem",
                          overflowX: "auto",
                        }}
                      >
                        {[
                          "Suggest Diet Type",
                          "High-protein, energy-boosting meals with hydration support",
                          "Wet Food",
                          "Dry Food",
                          "Topping",
                          "Treat",
                        ].map((type) => (
                          <button
                            key={type}
                            style={{
                              padding: "0.5rem 1rem",
                              backgroundColor:
                                activeDietType === type ? "#F8C8C8" : "#FCEEEE",
                              color:
                                activeDietType === type ? "#FFFFFF" : "#555",
                              border: "none",
                              borderRadius: "20px",
                              cursor: "pointer",
                              fontFamily:
                                splineTheme.typography.fontFamily.body,
                              whiteSpace: "nowrap",
                            }}
                            onClick={() => setActiveDietType(type)}
                          >
                            {type}
                          </button>
                        ))}
                      </div>{" "}
                      <h3
                        style={{
                          textAlign: "center",
                          marginBottom: "2rem",
                          color: "#1d3557",
                          fontFamily: splineTheme.typography.fontFamily.body,
                        }}
                      >
                        Customize your cat meal!
                      </h3>
                      {/* Loading state while generating meal kit */}
                      {generatingMeal && (
                        <div
                          style={{
                            textAlign: "center",
                            padding: "2rem",
                            color: "#5A87C5",
                            fontFamily: splineTheme.typography.fontFamily.body,
                          }}
                        >
                          <p>
                            Generating personalized meal kits for {profile.name}
                            ...
                          </p>
                          <p
                            style={{
                              fontSize: "0.9rem",
                              marginTop: "0.5rem",
                              color: "#777",
                            }}
                          >
                            This may take a moment as we analyze your cat's
                            profile and preferences.
                          </p>
                        </div>
                      )}
                      {/* AI Generated Meal Kit Cards */}
                      {!generatingMeal && generatedMealKits.length > 0 && (
                        <div>
                          <h3
                            style={{
                              textAlign: "center",
                              marginBottom: "1.5rem",
                              color: "#1d3557",
                              fontFamily:
                                splineTheme.typography.fontFamily.body,
                            }}
                          >
                            AI Generated Meal Kits for {profile.name}
                          </h3>{" "}
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "2rem",
                              justifyContent: "center",
                              marginBottom: "2rem",
                            }}
                          >
                            {generatedMealKits.map((mealKit) => (
                              <MealSetCard
                                key={mealKit.kitId}
                                mealKit={mealKit}
                                isSelected={selectedMealKitId === mealKit.kitId}
                                onSelect={() =>
                                  handleMealKitSelect(mealKit.kitId)
                                }
                                quantity={quantity}
                                onQuantityChange={handleQuantityChange}
                                totalPrice={totalPrice}
                                onAddToCart={() =>
                                  handleAddToCart(mealKit.kitId)
                                }
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
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
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                marginTop: "1rem",
                fontFamily: splineTheme.typography.fontFamily.body,
              }}
              onClick={() => navigate("/cat-profile")}
            >
              Go Back
            </button>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

export default MealPlans;
