import axios from "axios";

// Constants
const DEFAULT_ZOOM = 15;
const DEFAULT_CENTER = { lat: 10.762622, lng: 106.660172 }; // Ho Chi Minh City center

/**
 * Initialize a Google Map in the specified container
 * @param {HTMLElement} container - The DOM element to render the map in
 * @param {Object} options - Map options
 * @returns {Object} The Google Map instance
 */
export const initializeMap = (container, options = {}) => {
  const mapOptions = {
    zoom: options.zoom || DEFAULT_ZOOM,
    center: options.center || DEFAULT_CENTER,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: options.fullscreenControl || false,
    zoomControl: options.zoomControl || true,
  };

  // Create the map
  const map = new window.google.maps.Map(container, mapOptions);

  // Create marker if requested
  let marker = null;
  if (options.placeMarker) {
    marker = new window.google.maps.Marker({
      position: mapOptions.center,
      map: map,
      draggable: options.draggableMarker || true,
      animation: window.google.maps.Animation.DROP,
    });
  }

  return { map, marker };
};

/**
 * Reverse geocode coordinates to get a formatted address
 * @param {Object} coordinates - The lat/lng coordinates
 * @returns {Promise} A promise resolving to the address data
 */
export const reverseGeocode = async (coordinates) => {
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.lat},${coordinates.lng}&key=${apiKey}`
    );

    if (response.data.status === "OK") {
      const result = response.data.results[0];

      // Extract address components
      const addressComponents = {};

      // Extract address components like province, district, ward, street
      result.address_components.forEach((component) => {
        const types = component.types;

        if (types.includes("administrative_area_level_1")) {
          addressComponents.province = component.long_name;
        } else if (types.includes("administrative_area_level_2")) {
          addressComponents.district = component.long_name;
        } else if (
          types.includes("administrative_area_level_3") ||
          types.includes("sublocality_level_1")
        ) {
          addressComponents.ward = component.long_name;
        } else if (types.includes("route")) {
          addressComponents.street = component.long_name;
        } else if (types.includes("street_number")) {
          addressComponents.streetNumber = component.long_name;
        }
      });

      // Format the street address
      let streetAddress = "";
      if (addressComponents.streetNumber) {
        streetAddress += addressComponents.streetNumber + " ";
      }
      if (addressComponents.street) {
        streetAddress += addressComponents.street;
      }

      return {
        success: true,
        formattedAddress: result.formatted_address,
        province: addressComponents.province || "",
        district: addressComponents.district || "",
        ward: addressComponents.ward || "",
        streetAddress: streetAddress.trim() || "",
        coordinates: {
          lat: coordinates.lat,
          lng: coordinates.lng,
        },
      };
    } else {
      return {
        success: false,
        error: response.data.status,
      };
    }
  } catch (error) {
    console.error("Error during reverse geocoding:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Geocode an address string to get coordinates
 * @param {string} address - The address to geocode
 * @returns {Promise} A promise resolving to the coordinates
 */
export const geocodeAddress = async (address) => {
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${apiKey}`
    );

    if (response.data.status === "OK") {
      const location = response.data.results[0].geometry.location;
      return {
        success: true,
        coordinates: {
          lat: location.lat,
          lng: location.lng,
        },
      };
    } else {
      return {
        success: false,
        error: response.data.status,
      };
    }
  } catch (error) {
    console.error("Error during geocoding:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Places a marker on the map at the specified coordinates
 * @param {Object} map - The Google Map instance
 * @param {Object} coordinates - The lat/lng coordinates
 * @param {Object} options - Options for the marker
 * @returns {Object} The marker instance
 */
export const placeMarker = (map, coordinates, options = {}) => {
  const marker = new window.google.maps.Marker({
    position: coordinates,
    map: map,
    draggable: options.draggable || true,
    animation: window.google.maps.Animation.DROP,
    title: options.title || "Selected Location",
  });

  // Center map on marker if requested
  if (options.centerMap) {
    map.setCenter(coordinates);
  }

  return marker;
};
