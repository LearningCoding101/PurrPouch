import React, { useState, useEffect } from "react";
import {
  getUserAddresses,
  createUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultUserAddress,
} from "../../services/api";
import AddressFormModal from "./AddressFormModal";
import AddressList from "./AddressList";

const AddressManager = ({
  onSelectAddress,
  selectedAddressId = null,
  isCollapsible = true,
  isSelectable = true,
}) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isExpanded, setIsExpanded] = useState(!isCollapsible);

  // Fetch addresses on component mount
  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getUserAddresses();
      setAddresses(response.data);

      // If there's a default address and no selected address yet, select it
      if (!selectedAddressId && response.data.length > 0) {
        const defaultAddress = response.data.find((addr) => addr.isDefault);
        if (defaultAddress && onSelectAddress) {
          onSelectAddress(defaultAddress.id);
        } else if (onSelectAddress) {
          // Otherwise select the first address
          onSelectAddress(response.data[0].id);
        }
      }
    } catch (err) {
      console.error("Error loading addresses:", err);
      setError("Failed to load your saved addresses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setIsAddressFormOpen(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setIsAddressFormOpen(true);
  };

  const handleSaveAddress = async (addressData) => {
    try {
      setLoading(true);

      if (editingAddress) {
        // Update existing address
        await updateUserAddress(editingAddress.id, addressData);

        // If this is being set as default, update it on the server
        if (addressData.isDefault && !editingAddress.isDefault) {
          await setDefaultUserAddress(editingAddress.id);
        }
      } else {
        // Create new address
        await createUserAddress(addressData);
      }

      // Reload addresses
      await loadAddresses();
      setIsAddressFormOpen(false);
    } catch (err) {
      console.error("Error saving address:", err);
      setError("Failed to save address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        setLoading(true);
        await deleteUserAddress(addressId);

        // If the deleted address was selected, select another one
        if (selectedAddressId === addressId && onSelectAddress) {
          const remainingAddresses = addresses.filter(
            (addr) => addr.id !== addressId
          );
          if (remainingAddresses.length > 0) {
            const defaultAddress = remainingAddresses.find(
              (addr) => addr.isDefault
            );
            if (defaultAddress) {
              onSelectAddress(defaultAddress.id);
            } else {
              onSelectAddress(remainingAddresses[0].id);
            }
          } else {
            onSelectAddress(null);
          }
        }

        await loadAddresses();
        setIsAddressFormOpen(false);
      } catch (err) {
        console.error("Error deleting address:", err);
        setError("Failed to delete address. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSelectAddress = (addressId) => {
    if (onSelectAddress) {
      onSelectAddress(addressId);
    }
  };

  const toggleExpanded = () => {
    if (isCollapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div
      style={{
        backgroundColor: isExpanded ? "white" : "#F8F9FA",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        marginBottom: "15px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        onClick={toggleExpanded}
        style={{
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: isCollapsible ? "pointer" : "default",
          borderBottom: isExpanded ? "1px solid #eee" : "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6C757D"
            strokeWidth="2"
            style={{ marginRight: "10px" }}
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#333333",
            }}
          >
            Delivery information
          </span>
        </div>

        {isCollapsible && (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6C757D"
            strokeWidth="2"
            style={{
              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          >
            <polyline points="6,9 12,15 18,9" />
          </svg>
        )}
      </div>

      {/* Content (visible when expanded) */}
      {isExpanded && (
        <div style={{ padding: "20px" }}>
          {loading && (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <p style={{ color: "#6c757d" }}>Loading your addresses...</p>
            </div>
          )}

          {error && (
            <div
              style={{
                backgroundColor: "#ffebee",
                color: "#c62828",
                padding: "10px 15px",
                borderRadius: "4px",
                marginBottom: "15px",
              }}
            >
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Address List */}
              <AddressList
                addresses={addresses}
                selectedAddressId={selectedAddressId}
                onSelect={handleSelectAddress}
                onEdit={handleEditAddress}
                isEditable={true}
              />

              {/* Add Address Button */}
              <button
                onClick={handleAddAddress}
                style={{
                  backgroundColor: "white",
                  color: "#007BFF",
                  border: "1px solid #007BFF",
                  borderRadius: "4px",
                  padding: "10px 15px",
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  width: "100%",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add New Address
              </button>
            </>
          )}

          {/* Address Form Modal */}
          <AddressFormModal
            isOpen={isAddressFormOpen}
            onClose={() => setIsAddressFormOpen(false)}
            onSave={handleSaveAddress}
            initialAddress={editingAddress}
            onDelete={editingAddress ? handleDeleteAddress : null}
          />
        </div>
      )}
    </div>
  );
};

export default AddressManager;
