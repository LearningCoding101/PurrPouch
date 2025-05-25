import React, { useState } from "react";

const QuantityPriceDisplay = ({
  initialQuantity = 1,
  pricePerUnit = 150000,
  onQuantityChange,
}) => {
  const [quantity, setQuantity] = useState(initialQuantity);

  const handleDecrement = () => {
    const newQuantity = Math.max(1, quantity - 1); // Prevent quantity from going below 1
    setQuantity(newQuantity);
    if (onQuantityChange) onQuantityChange(newQuantity);
  };

  const handleIncrement = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    if (onQuantityChange) onQuantityChange(newQuantity);
  };

  const totalPrice = quantity * pricePerUnit;

  // Styles
  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    fontFamily: '"Spline Sans", Arial, sans-serif',
    gap: "16px",
    padding: "16px",
    backgroundColor: "#FFFFFF",
    borderRadius: "8px",
    width: "100%",
  };

  const quantityContainerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  };

  const quantityLabelStyle = {
    backgroundColor: "#E9ECEF",
    padding: "10px 16px",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "500",
    color: "#2C3E50",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "44px",
    boxSizing: "border-box",
    fontFamily: '"Spline Sans", Arial, sans-serif',
  };

  const stepperContainerStyle = {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: "8px",
    padding: "4px",
    height: "44px",
    boxSizing: "border-box",
  };

  const buttonStyle = {
    background: "transparent",
    border: "none",
    color: "#2C3E50",
    fontSize: "24px",
    fontWeight: "bold",
    cursor: "pointer",
    padding: "0 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    borderRadius: "6px",
    fontFamily: '"Spline Sans", Arial, sans-serif',
  };

  const quantityTextStyle = {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#2C3E50",
    padding: "0 16px",
    minWidth: "30px",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    fontFamily: '"Spline Sans", Arial, sans-serif',
  };

  const priceStyle = {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#2C3E50",
    padding: "10px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end", // Align to the right
    height: "44px",
    boxSizing: "border-box",
    fontFamily: '"Spline Sans", Arial, sans-serif',
    backgroundColor: "#F0F2F5", // Light background to highlight the price
    borderRadius: "8px",
  };

  return (
    <div style={containerStyle}>
      <div style={quantityContainerStyle}>
        <div style={quantityLabelStyle}>Quantity</div>
        <div style={stepperContainerStyle}>
          <button
            style={buttonStyle}
            onClick={handleDecrement}
            aria-label="Decrease quantity"
          >
            -
          </button>
          <div style={quantityTextStyle} aria-live="polite">
            {quantity}
          </div>
          <button
            style={buttonStyle}
            onClick={handleIncrement}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>
      <div style={priceStyle}>{totalPrice.toLocaleString()}</div>
    </div>
  );
};

export default QuantityPriceDisplay;
