import React, { useState, useRef, useEffect } from "react";
import {
  initializeMap,
  reverseGeocode,
  geocodeAddress,
  placeMarker,
} from "../../utils/googleMaps";

const AddressFormModal = ({
  isOpen,
  onClose,
  onSave,
  initialAddress = null,
  onDelete = null,
}) => {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    province: "",
    district: "",
    ward: "",
    streetAddress: "",
    type: "HOME",
    isDefault: false,
    latitude: null,
    longitude: null,
  });

  const [errors, setErrors] = useState({});
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markerRef = useRef(null);

  // Initialize with existing address data if provided
  useEffect(() => {
    if (initialAddress) {
      setFormData({
        fullName: initialAddress.fullName || "",
        phoneNumber: initialAddress.phoneNumber || "",
        province: initialAddress.province || "",
        district: initialAddress.district || "",
        ward: initialAddress.ward || "",
        streetAddress: initialAddress.streetAddress || "",
        type: initialAddress.type || "HOME",
        isDefault: initialAddress.isDefault || false,
        latitude: initialAddress.latitude || null,
        longitude: initialAddress.longitude || null,
      });
    } else {
      // Reset form for new address
      setFormData({
        fullName: "",
        phoneNumber: "",
        province: "",
        district: "",
        ward: "",
        streetAddress: "",
        type: "HOME",
        isDefault: false,
        latitude: null,
        longitude: null,
      });
    }
  }, [initialAddress, isOpen]);

  // Initialize map when modal opens
  useEffect(() => {
    if (isOpen && !mapLoaded && mapContainerRef.current) {
      // Check if Google Maps script is loaded
      if (window.google && window.google.maps) {
        initializeGoogleMap();
      } else {
        // Load Google Maps script if not already loaded
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${
          import.meta.env.VITE_GOOGLE_MAPS_API_KEY
        }&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initializeGoogleMap;
        document.head.appendChild(script);
      }
    }
  }, [isOpen, mapLoaded]);

  const initializeGoogleMap = () => {
    const initialCoordinates =
      formData.latitude && formData.longitude
        ? { lat: formData.latitude, lng: formData.longitude }
        : { lat: 10.762622, lng: 106.660172 }; // Default to Ho Chi Minh City

    const { map, marker } = initializeMap(mapContainerRef.current, {
      center: initialCoordinates,
      zoom: 15,
      placeMarker: true,
      draggableMarker: true,
    });

    mapRef.current = map;
    markerRef.current = marker;

    // Add click event to map
    map.addListener("click", (event) => {
      const coordinates = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };

      // Update marker position
      markerRef.current.setPosition(coordinates);

      // Reverse geocode to get address details
      handleReverseGeocode(coordinates);
    });

    // Add dragend event to marker
    if (marker) {
      marker.addListener("dragend", () => {
        const position = marker.getPosition();
        const coordinates = {
          lat: position.lat(),
          lng: position.lng(),
        };

        handleReverseGeocode(coordinates);
      });
    }

    setMapLoaded(true);
  };

  const handleReverseGeocode = async (coordinates) => {
    const result = await reverseGeocode(coordinates);

    if (result.success) {
      setFormData((prev) => ({
        ...prev,
        province: result.province,
        district: result.district,
        ward: result.ward,
        streetAddress: result.streetAddress,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleAddressTypeChange = (type) => {
    setFormData((prev) => ({ ...prev, type }));
  };

  const handleGeocodeAddress = async () => {
    // Construct address string from form fields
    const addressString = [
      formData.streetAddress,
      formData.ward,
      formData.district,
      formData.province,
    ]
      .filter(Boolean)
      .join(", ");

    if (addressString.trim() === "") {
      setErrors((prev) => ({
        ...prev,
        streetAddress:
          "Please enter at least one address component to locate on map",
      }));
      return;
    }

    const result = await geocodeAddress(addressString);

    if (result.success) {
      // Update marker and map
      if (mapRef.current && markerRef.current) {
        markerRef.current.setPosition(result.coordinates);
        mapRef.current.setCenter(result.coordinates);
        mapRef.current.setZoom(16);

        // Update form with coordinates
        setFormData((prev) => ({
          ...prev,
          latitude: result.coordinates.lat,
          longitude: result.coordinates.lng,
        }));
      }
    } else {
      setErrors((prev) => ({
        ...prev,
        streetAddress:
          "Could not find this location on the map. Please try a different address.",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (
      !/^\+?[0-9]{10,15}$/.test(formData.phoneNumber.replace(/[()-\s]/g, ""))
    ) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    if (!formData.province.trim()) {
      newErrors.province = "Province/City is required";
    }

    if (!formData.district.trim()) {
      newErrors.district = "District is required";
    }

    if (!formData.ward.trim()) {
      newErrors.ward = "Ward is required";
    }

    if (!formData.streetAddress.trim()) {
      newErrors.streetAddress = "Street address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      onSave({
        ...formData,
        // Format phone number consistently
        phoneNumber: formData.phoneNumber.startsWith("+84")
          ? formData.phoneNumber
          : formData.phoneNumber.startsWith("0")
          ? `+84${formData.phoneNumber.substring(1)}`
          : `+84${formData.phoneNumber}`,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        className="modal-content"
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          width: "90%",
          maxWidth: "600px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "20px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          className="modal-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.5rem", color: "#333" }}>
            {initialAddress ? "Edit Address" : "Add New Address"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#999",
            }}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Personal Info */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "500",
              }}
            >
              Enter your name <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Full Name"
              style={{
                width: "100%",
                padding: "10px",
                border: errors.fullName ? "1px solid red" : "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "16px",
              }}
            />
            {errors.fullName && (
              <p style={{ color: "red", margin: "5px 0 0", fontSize: "14px" }}>
                {errors.fullName}
              </p>
            )}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "500",
              }}
            >
              Phone Number <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="Phone Number"
              style={{
                width: "100%",
                padding: "10px",
                border: errors.phoneNumber ? "1px solid red" : "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "16px",
              }}
            />
            {errors.phoneNumber && (
              <p style={{ color: "red", margin: "5px 0 0", fontSize: "14px" }}>
                {errors.phoneNumber}
              </p>
            )}
          </div>

          {/* Address Info */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "500",
              }}
            >
              Province/City <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="province"
              value={formData.province}
              onChange={handleInputChange}
              placeholder="Province/City"
              style={{
                width: "100%",
                padding: "10px",
                border: errors.province ? "1px solid red" : "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "16px",
              }}
            />
            {errors.province && (
              <p style={{ color: "red", margin: "5px 0 0", fontSize: "14px" }}>
                {errors.province}
              </p>
            )}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "500",
              }}
            >
              District <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleInputChange}
              placeholder="District"
              style={{
                width: "100%",
                padding: "10px",
                border: errors.district ? "1px solid red" : "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "16px",
              }}
            />
            {errors.district && (
              <p style={{ color: "red", margin: "5px 0 0", fontSize: "14px" }}>
                {errors.district}
              </p>
            )}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "500",
              }}
            >
              Ward <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="ward"
              value={formData.ward}
              onChange={handleInputChange}
              placeholder="Ward"
              style={{
                width: "100%",
                padding: "10px",
                border: errors.ward ? "1px solid red" : "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "16px",
              }}
            />
            {errors.ward && (
              <p style={{ color: "red", margin: "5px 0 0", fontSize: "14px" }}>
                {errors.ward}
              </p>
            )}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "500",
              }}
            >
              Street name, Block, Number <span style={{ color: "red" }}>*</span>
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleInputChange}
                placeholder="Street name, Block, Number"
                style={{
                  flex: 1,
                  padding: "10px",
                  border: errors.streetAddress
                    ? "1px solid red"
                    : "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "16px",
                }}
              />
              <button
                type="button"
                onClick={handleGeocodeAddress}
                style={{
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "0 15px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Locate
              </button>
            </div>
            {errors.streetAddress && (
              <p style={{ color: "red", margin: "5px 0 0", fontSize: "14px" }}>
                {errors.streetAddress}
              </p>
            )}
          </div>

          {/* Map Section */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "500",
              }}
            >
              Set on map
            </label>
            <div
              ref={mapContainerRef}
              style={{
                width: "100%",
                height: "250px",
                borderRadius: "4px",
                border: "1px solid #ddd",
              }}
            ></div>
            <p style={{ margin: "5px 0 0", fontSize: "14px", color: "#666" }}>
              Click on the map or drag the marker to set your exact location
            </p>
          </div>

          {/* Additional Options */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleInputChange}
                style={{ marginRight: "10px" }}
              />
              Set as Default address
            </label>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <p style={{ margin: "0 0 10px", fontWeight: "500" }}>
              Type of address
            </p>
            <div style={{ display: "flex", gap: "15px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="addressType"
                  checked={formData.type === "HOME"}
                  onChange={() => handleAddressTypeChange("HOME")}
                  style={{ marginRight: "8px" }}
                />
                Home
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="addressType"
                  checked={formData.type === "OFFICE"}
                  onChange={() => handleAddressTypeChange("OFFICE")}
                  style={{ marginRight: "8px" }}
                />
                Office
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="addressType"
                  checked={formData.type === "OTHER"}
                  onChange={() => handleAddressTypeChange("OTHER")}
                  style={{ marginRight: "8px" }}
                />
                Other
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "20px",
            }}
          >
            {initialAddress && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(initialAddress.id)}
                style={{
                  backgroundColor: "white",
                  color: "#DC3545",
                  border: "1px solid #DC3545",
                  borderRadius: "4px",
                  padding: "10px 20px",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                Delete Address
              </button>
            )}
            <button
              type="submit"
              style={{
                backgroundColor: "#007BFF",
                color: "white",
                border: "none",
                borderRadius: "4px",
                padding: "10px 20px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressFormModal;
