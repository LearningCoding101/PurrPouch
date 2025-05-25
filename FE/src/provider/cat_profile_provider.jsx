import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { getCatProfile } from "../services/api";

// Create the context
const CatProfileContext = createContext(null);

// Create a provider component
export const CatProfileProvider = ({ children }) => {
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState({});

  // Function to fetch a cat profile
  const fetchCatProfile = useCallback(
    async (id) => {
      if (!id) return;

      // If we're already loading this profile or already have it, don't fetch again
      if (loading[id] || (profiles[id] && !error[id])) return;

      setLoading((prev) => ({ ...prev, [id]: true }));
      setError((prev) => ({ ...prev, [id]: null }));

      try {
        const response = await getCatProfile(id);
        setProfiles((prev) => ({ ...prev, [id]: response.data }));
      } catch (err) {
        console.error(`Error fetching cat profile ${id}:`, err);
        setError((prev) => ({
          ...prev,
          [id]: "Failed to load this cat profile. Please try again later.",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, [id]: false }));
      }
    },
    [profiles, loading, error]
  );
  // Function to update a cat profile in the context
  const updateCatProfile = useCallback((id, newData) => {
    if (!id) return;
    setProfiles((prev) => ({ ...prev, [id]: { ...prev[id], ...newData } }));
  }, []);

  // Create the context value
  const value = {
    profiles,
    loading,
    error,
    fetchCatProfile,
    updateCatProfile,
  };

  return (
    <CatProfileContext.Provider value={value}>
      {children}
    </CatProfileContext.Provider>
  );
};

// Create a custom hook to use the cat profile context
export const useCatProfile = () => {
  const context = useContext(CatProfileContext);
  if (context === null) {
    throw new Error("useCatProfile must be used within a CatProfileProvider");
  }
  return context;
};
