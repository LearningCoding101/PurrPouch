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
    {},
    {
      headers: { Authorization: `Bearer ${idToken}` },
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

export const deleteCatProfile = (id) => {
  return api.delete(`/cat-profiles/${id}`);
};

export default api;
