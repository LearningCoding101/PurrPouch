import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication services
export const login = (email, password) => {
  return api.post("/auth/signin", { email, password });
};

export const register = (username, email, password) => {
  return api.post("/auth/signup", { username, email, password });
};

export const getUserInfo = () => {
  return api.get("/auth/user-info");
};

export const loginWithGoogle = (idToken) => {
  return api.post(
    "/auth/google-auth",
    { idToken }, // Include the token in the request body
    {
      headers: { Authorization: `Bearer ${idToken}` }, // Also include in the Authorization header
    }
  );
};

// Image upload service
export const uploadImage = async (imageBase64) => {
  try {
    const apiKey = import.meta.env.VITE_IMGBB_API_KEY;

    // Remove the data:image/jpeg;base64, part if present
    const base64Image = imageBase64.split(",")[1] || imageBase64;

    const formData = new FormData();
    formData.append("image", base64Image);

    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      formData
    );

    if (response.data.success) {
      return {
        success: true,
        url: response.data.data.url,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        error: response.data.error,
      };
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Cat profile services
export const getCatProfiles = () => {
  return api.get("/cat-profiles");
};

export const getCatProfile = (id) => {
  return api.get(`/cat-profiles/${id}`);
};

export const getCatProfileById = (id) => {
  return api.get(`/cat-profiles/${id}`);
};

export const createCatProfile = (profileData) => {
  return api.post("/cat-profiles", profileData);
};

export const updateCatProfile = (id, profileData) => {
  return api.put(`/cat-profiles/${id}`, profileData);
};

// Chat services
export const sendChatMessage = (message, catId) => {
  return api.post("/chat/send", {
    message,
    catId,
    userId: localStorage.getItem("userId"), // Assuming userId is stored in localStorage
  });
};

export const getCatRecommendations = (catId) => {
  return api.get(`/chat/recommendations/${catId}`);
};

// Local storage functions for chat history
export const saveChatHistory = (catId, messages) => {
  try {
    localStorage.setItem(`chat_history_${catId}`, JSON.stringify(messages));
    return true;
  } catch (error) {
    console.error("Error saving chat history:", error);
    return false;
  }
};

export const getChatHistory = (catId) => {
  try {
    const history = localStorage.getItem(`chat_history_${catId}`);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error("Error loading chat history:", error);
    return [];
  }
};

export const clearChatHistory = (catId) => {
  try {
    localStorage.removeItem(`chat_history_${catId}`);
    return true;
  } catch (error) {
    console.error("Error clearing chat history:", error);
    return false;
  }
};

export const deleteCatProfile = (id) => {
  return api.delete(`/cat-profiles/${id}`);
};

// Meal plan services - These are placeholders for future backend implementation
export const getMealPlans = (catId) => {
  // Mock implementation until backend is ready
  return Promise.resolve({
    data: [
      {
        id: 1,
        name: "Light and Easy-To-Digest Meal Plan",
        price: 150000,
        items: [
          {
            time: "Morning",
            name: "Royal Canin Kitten Instinctive Gravy Wet Pouch",
            portion: "50g",
          },
          { time: "Morning", name: "Fresh water", portion: "50ml" },
          {
            time: "Midday snack",
            name: "Farmina N&D Prime Kitten Dry Food",
            portion: "20g",
          },
          {
            time: "Evening",
            name: "Royal Canin Kitten Instinctive Wet Pouch",
            portion: "50g",
          },
          { time: "Evening", name: "Tuna topping", portion: "10g" },
        ],
      },
      {
        id: 2,
        name: "For Picky Eaters Who Need Extra Hydration",
        price: 180000,
        items: [
          {
            time: "Morning",
            name: "Tiki Cat Velvet Mousse Chicken Wet Food",
            portion: "50g",
          },
          {
            time: "Morning",
            name: "Water with chicken broth",
            portion: "30ml",
          },
          {
            time: "Midday snack",
            name: "Soaked Orijen Cat & Kitten Dry Food",
            portion: "20g",
          },
          {
            time: "Evening",
            name: "Ziwi Peak Lamb Recipe Wet Food",
            portion: "50g",
          },
          { time: "Evening", name: "Bonito flakes topping", portion: "5g" },
        ],
      },
    ],
  });
};

export const addToCart = (mealPlanId, quantity, catId) => {
  // Mock implementation until backend is ready
  console.log(
    `Added meal plan ${mealPlanId} for cat ${catId} with quantity ${quantity} to cart`
  );
  return Promise.resolve({ success: true });
};

// AI Meal Kit Generation
export const generateAiMealKit = (catId, chatHistory) => {
  return api.post("/chat/generate-meal-kit", {
    catId,
    chatHistory,
  });
};

// Get all food SKUs
export const getAllFoodSkus = () => {
  return api.get("/food/skus");
};

// Get food SKUs by type
export const getFoodSkusByType = (type) => {
  return api.get(`/food/skus/type/${type}`);
};

// Get meal kits for a cat
export const getMealKitsForCat = (catId) => {
  return api.get(`/meal-kits/cat/${catId}`);
};

export default api;
