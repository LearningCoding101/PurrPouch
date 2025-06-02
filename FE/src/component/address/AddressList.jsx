import React from "react";

const AddressList = ({
  addresses,
  selectedAddressId,
  onSelect,
  onEdit,
  isEditable = true,
}) => {
  // Format phone number for display
  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return "";

    // Format Vietnamese numbers: (+84) 123 456 789
    let formatted = phoneNumber;
    if (phoneNumber.startsWith("+84")) {
      const digits = phoneNumber.substring(3);

      // Format as groups of 3-3-4
      if (digits.length === 9) {
        formatted = `(+84) ${digits.substring(0, 3)} ${digits.substring(
          3,
          6
        )} ${digits.substring(6)}`;
      } else if (digits.length === 10) {
        formatted = `(+84) ${digits.substring(0, 3)} ${digits.substring(
          3,
          6
        )} ${digits.substring(6)}`;
      } else {
        formatted = `(+84) ${digits}`;
      }
    }

    return formatted;
  };

  if (!addresses || addresses.length === 0) {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          borderRadius: "8px",
          backgroundColor: "#f8f9fa",
          marginBottom: "20px",
        }}
      >
        <p style={{ margin: "0", color: "#6c757d" }}>
          No saved addresses. Please add a new address.
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: "20px" }}>
      {addresses.map((address, index) => (
        <div
          key={address.id || index}
          style={{
            padding: "15px",
            borderBottom:
              index < addresses.length - 1 ? "1px solid #eee" : "none",
            display: "flex",
            alignItems: "flex-start",
          }}
        >
          {/* Radio Selection */}
          <div style={{ marginRight: "15px", paddingTop: "5px" }}>
            <input
              type="radio"
              name="selectedAddress"
              checked={selectedAddressId === address.id}
              onChange={() => onSelect(address.id)}
              style={{
                cursor: "pointer",
                width: "18px",
                height: "18px",
              }}
            />
          </div>

          {/* Address Content */}
          <div style={{ flex: 1 }}>
            {/* Contact Details */}
            <div style={{ marginBottom: "5px" }}>
              <span
                style={{
                  color: "#DC3545",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  marginRight: "10px",
                }}
              >
                {address.fullName}
              </span>
              <span
                style={{
                  color: "#DC3545",
                  fontWeight: "bold",
                }}
              >
                {formatPhoneNumber(address.phoneNumber)}
              </span>
            </div>

            {/* Address */}
            <div
              style={{
                marginBottom: "5px",
                color: "#333",
                fontSize: "14px",
                lineHeight: "1.4",
              }}
            >
              {address.streetAddress}, {address.ward}, {address.district},{" "}
              {address.province}
            </div>

            {/* Tags */}
            <div style={{ display: "flex", gap: "10px" }}>
              {address.isDefault && (
                <span
                  style={{
                    backgroundColor: "#E7F1FF",
                    color: "#007BFF",
                    border: "1px solid #007BFF",
                    borderRadius: "12px",
                    padding: "2px 8px",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  Default
                </span>
              )}
              <span
                style={{
                  backgroundColor: "#f8f9fa",
                  color: "#6c757d",
                  border: "1px solid #dee2e6",
                  borderRadius: "12px",
                  padding: "2px 8px",
                  fontSize: "12px",
                }}
              >
                {address.type === "HOME"
                  ? "Home"
                  : address.type === "OFFICE"
                  ? "Office"
                  : "Other"}
              </span>
            </div>
          </div>

          {/* Edit Link */}
          {isEditable && (
            <div>
              <button
                onClick={() => onEdit(address)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#007BFF",
                  fontSize: "14px",
                  cursor: "pointer",
                  padding: "5px",
                }}
              >
                Edit
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AddressList;
