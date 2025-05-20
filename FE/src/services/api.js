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

export default api;
