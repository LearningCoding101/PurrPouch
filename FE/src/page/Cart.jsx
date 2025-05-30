import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCartItems,
  removeItemFromCart,
  updateCartItemQuantity,
  clearCart,
  createOrder,
  getUserInfo,
  setPaymentUuid,
  getOrderById,
} from "../services/api";
import PageWrapper from "../component/global/PageWrapper";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [showVietQR, setShowVietQR] = useState(false);
  const [orderCreated, setOrderCreated] = useState(null);
  const [paymentUuid, setPaymentUuidState] = useState(null);
  const [paymentPolling, setPaymentPolling] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("pending"); // 'pending', 'checking', 'completed', 'timeout'
  const [paymentTimeout, setPaymentTimeout] = useState(null);
  const navigate = useNavigate();
  // Generate UUID for payment reference (without dashes for VietQR compatibility)
  const generateUUID = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
      .replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      })
      .replace(/-/g, ""); // Remove dashes for database storage and VietQR compatibility
  }; // Generate VietQR payment URL with Pay2S compatible format
  const generateVietQRUrl = (amount) => {
    if (!paymentUuid) {
      const uuid = generateUUID();
      setPaymentUuidState(uuid);
      // Use format that Pay2S can recognize: "PAY [UUID]"
      return `https://img.vietqr.io/image/MB-0379604656-compac.png?amount=${amount}&addInfo=PAY ${uuid}`;
    }
    return `https://img.vietqr.io/image/MB-0379604656-compac.png?amount=${amount}&addInfo=PAY ${paymentUuid}`;
  };

  // Load cart items on component mount
  useEffect(() => {
    loadCartItems();
    loadUserInfo();
  }, []);

  const loadCartItems = () => {
    const items = getCartItems();
    setCartItems(items);
  };

  const loadUserInfo = async () => {
    try {
      const response = await getUserInfo();
      setUser(response.data);
    } catch (error) {
      console.error("Error loading user info:", error);
      setError("Please login to complete your order");
    }
  };

  const handleRemoveItem = (kitId) => {
    removeItemFromCart(kitId);
    loadCartItems();
  };

  const handleUpdateQuantity = (kitId, newQuantity) => {
    if (newQuantity < 1) return;
    updateCartItemQuantity(kitId, newQuantity);
    loadCartItems();
  };
  const handleCheckout = async () => {
    if (!user) {
      setError("Please login to complete your order");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare kit items for order
      const kitItems = {};
      cartItems.forEach((item) => {
        kitItems[item.kitId] = item.quantity;
      });

      // Calculate total price
      const totalPrice = cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      // Create order with PENDING status
      const orderResponse = await createOrder(user.id, kitItems, totalPrice);
      setOrderCreated(orderResponse.data);

      // Show VietQR and start payment polling
      setShowVietQR(true);

      // Generate UUID and start polling when QR is displayed
      // This will be triggered when the QR code is generated
    } catch (error) {
      console.error("Error creating order:", error);
      setError("Failed to create order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = () => {
    // Clear cart after payment
    clearCart();
    loadCartItems();
    setOrderSuccess(true);
    setShowVietQR(false);
  };
  const handleBackToCart = () => {
    stopPaymentPolling();
    setShowVietQR(false);
    setOrderCreated(null);
    setPaymentUuidState(null);
  };

  const handleContinueShopping = () => {
    navigate("/meal-plans");
  };

  const handleViewOrders = () => {
    navigate("/orders");
  };

  // Start payment polling
  const startPaymentPolling = async (orderId, uuid) => {
    try {
      // Set payment UUID for the order
      await setPaymentUuid(orderId, uuid);

      setPaymentPolling(true);
      setPaymentStatus("checking");

      // Set timeout for 10 minutes
      const timeoutId = setTimeout(() => {
        setPaymentStatus("timeout");
        setPaymentPolling(false);
      }, 10 * 60 * 1000); // 10 minutes

      setPaymentTimeout(timeoutId);

      // Poll every 5 seconds
      const pollInterval = setInterval(async () => {
        try {
          const response = await getOrderById(orderId);
          const order = response.data;

          if (order.status === "PAID") {
            clearInterval(pollInterval);
            clearTimeout(timeoutId);
            setPaymentStatus("completed");
            setPaymentPolling(false);
            handlePaymentComplete();
          }
        } catch (error) {
          console.error("Error checking payment status:", error);
        }
      }, 5000); // Check every 5 seconds

      // Clean up on unmount
      return () => {
        clearInterval(pollInterval);
        clearTimeout(timeoutId);
      };
    } catch (error) {
      console.error("Error starting payment polling:", error);
      setPaymentPolling(false);
      setError("Failed to initialize payment tracking");
    }
  };

  // Stop payment polling
  const stopPaymentPolling = () => {
    setPaymentPolling(false);
    setPaymentStatus("pending");
    if (paymentTimeout) {
      clearTimeout(paymentTimeout);
      setPaymentTimeout(null);
    }
  };

  // Clean up polling on component unmount
  useEffect(() => {
    return () => {
      if (paymentTimeout) {
        clearTimeout(paymentTimeout);
      }
      stopPaymentPolling();
    };
  }, []);

  // Auto-start payment polling when order and UUID are ready
  useEffect(() => {
    if (
      orderCreated &&
      paymentUuid &&
      showVietQR &&
      paymentStatus === "pending"
    ) {
      startPaymentPolling(orderCreated.id, paymentUuid);
    }
  }, [orderCreated, paymentUuid, showVietQR]);

  // Calculate total price
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  return (
    <PageWrapper>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div
        style={{
          backgroundColor: "#F8F9FA",
          minHeight: "100vh",
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
          {error && (
            <div
              style={{
                backgroundColor: "#ffebee",
                color: "#c62828",
                padding: "1rem",
                borderRadius: "8px",
                marginBottom: "1.5rem",
                border: "1px solid #ffcdd2",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              {error}
            </div>
          )}

          {orderSuccess ? (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <div
                style={{
                  backgroundColor: "#e8f5e8",
                  color: "#2e7d32",
                  padding: "1rem",
                  borderRadius: "8px",
                  marginBottom: "1.5rem",
                  border: "1px solid #c8e6c9",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                }}
              >
                Your order has been placed successfully!
              </div>
              <div style={{ marginTop: "1.5rem" }}>
                <button
                  onClick={handleViewOrders}
                  style={{
                    backgroundColor: "#007BFF",
                    color: "white",
                    border: "none",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    cursor: "pointer",
                    marginRight: "1rem",
                    fontWeight: "600",
                  }}
                >
                  View Orders
                </button>
                <button
                  onClick={handleContinueShopping}
                  style={{
                    backgroundColor: "transparent",
                    color: "#007BFF",
                    border: "2px solid #007BFF",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            <>
              {cartItems.length === 0 ? (
                <div
                  style={{
                    backgroundColor: "white",
                    padding: "2rem",
                    textAlign: "center",
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  }}
                >
                  <h3 style={{ color: "#666", marginBottom: "1rem" }}>
                    Your cart is empty
                  </h3>
                  <button
                    onClick={handleContinueShopping}
                    style={{
                      backgroundColor: "#007BFF",
                      color: "white",
                      border: "none",
                      padding: "0.75rem 1.5rem",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      cursor: "pointer",
                      marginTop: "1rem",
                      fontWeight: "600",
                    }}
                  >
                    Browse Meal Plans
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr",
                    gap: "1.5rem",
                  }}
                >
                  {/* Left Column */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    {/* Delivery Information Section */}
                    <div
                      style={{
                        backgroundColor: "white",
                        padding: "16px 20px",
                        borderRadius: "8px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          cursor: "pointer",
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
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#6C757D"
                          strokeWidth="2"
                        >
                          <polyline points="6,9 12,15 18,9" />
                        </svg>
                      </div>
                    </div>

                    {/* Apply Coupons Section */}
                    <div
                      style={{
                        backgroundColor: "white",
                        padding: "16px 20px",
                        borderRadius: "8px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          cursor: "pointer",
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
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                            <line x1="7" y1="7" x2="7.01" y2="7" />
                          </svg>
                          <span
                            style={{
                              fontSize: "16px",
                              fontWeight: "600",
                              color: "#333333",
                            }}
                          >
                            Apply Coupons
                          </span>
                        </div>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#6C757D"
                          strokeWidth="2"
                        >
                          <polyline points="6,9 12,15 18,9" />
                        </svg>
                      </div>
                    </div>

                    {/* My Cart Section */}
                    <div
                      style={{
                        backgroundColor: "white",
                        padding: "20px",
                        borderRadius: "8px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "20px",
                        }}
                      >
                        <div>
                          <h2
                            style={{
                              fontSize: "24px",
                              fontWeight: "700",
                              color: "#212529",
                              margin: "0 0 4px 0",
                            }}
                          >
                            My cart
                          </h2>
                          <span
                            style={{
                              fontSize: "14px",
                              color: "#6C757D",
                              fontWeight: "400",
                            }}
                          >
                            {cartItems.length} items
                          </span>
                        </div>
                        <button
                          style={{
                            background: "none",
                            border: "none",
                            color: "#007BFF",
                            fontSize: "14px",
                            cursor: "pointer",
                            fontWeight: "500",
                          }}
                        >
                          Edit
                        </button>
                      </div>

                      {/* Cart Items */}
                      {cartItems.map((item, index) => (
                        <div
                          key={item.kitId}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            paddingBottom:
                              index === cartItems.length - 1 ? "0" : "15px",
                            marginBottom:
                              index === cartItems.length - 1 ? "0" : "15px",
                            borderBottom:
                              index === cartItems.length - 1
                                ? "none"
                                : "1px solid #EEEEEE",
                          }}
                        >
                          {/* Image Placeholder */}
                          <div
                            style={{
                              width: "60px",
                              height: "60px",
                              backgroundColor: "#FADADD",
                              borderRadius: "8px",
                              marginRight: "15px",
                              flexShrink: 0,
                            }}
                          />

                          {/* Item Details */}
                          <div style={{ flex: 1, marginRight: "15px" }}>
                            <h4
                              style={{
                                margin: "0",
                                fontSize: "15px",
                                fontWeight: "600",
                                color: "#333333",
                                lineHeight: "1.4",
                              }}
                            >
                              {item.name}
                            </h4>
                          </div>

                          {/* Quantity Controls */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginRight: "20px",
                            }}
                          >
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.kitId,
                                  item.quantity - 1
                                )
                              }
                              disabled={item.quantity <= 1}
                              style={{
                                width: "30px",
                                height: "30px",
                                backgroundColor: "#E9ECEF",
                                border: "1px solid #CED4DA",
                                borderRadius: "4px 0 0 4px",
                                color: "#495057",
                                fontSize: "16px",
                                cursor:
                                  item.quantity <= 1
                                    ? "not-allowed"
                                    : "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              -
                            </button>
                            <input
                              type="text"
                              value={item.quantity}
                              readOnly
                              style={{
                                width: "32px",
                                height: "30px",
                                textAlign: "center",
                                border: "1px solid #CED4DA",
                                borderLeft: "none",
                                borderRight: "none",
                                backgroundColor: "white",
                                fontSize: "14px",
                                color: "#495057",
                                margin: "0",
                              }}
                            />
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.kitId,
                                  item.quantity + 1
                                )
                              }
                              style={{
                                width: "30px",
                                height: "30px",
                                backgroundColor: "#E9ECEF",
                                border: "1px solid #CED4DA",
                                borderRadius: "0 4px 4px 0",
                                color: "#495057",
                                fontSize: "16px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              +
                            </button>
                          </div>

                          {/* Item Subtotal */}
                          <div style={{ minWidth: "80px", textAlign: "right" }}>
                            <span
                              style={{
                                fontSize: "16px",
                                fontWeight: "600",
                                color: "#333333",
                              }}
                            >
                              {(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Usage Instruction Button */}
                    <button
                      style={{
                        backgroundColor: "#007BFF",
                        color: "white",
                        border: "none",
                        padding: "15px 20px",
                        borderRadius: "8px",
                        fontSize: "16px",
                        fontWeight: "600",
                        cursor: "pointer",
                        width: "100%",
                        textAlign: "center",
                      }}
                    >
                      Usage Instruction
                    </button>
                  </div>

                  {/* Right Column */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    {showVietQR && orderCreated ? (
                      // VietQR Payment Section
                      <div
                        style={{
                          backgroundColor: "white",
                          padding: "20px",
                          borderRadius: "8px",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                        }}
                      >
                        <h3 style={{ marginBottom: "1rem", color: "#333" }}>
                          Complete Payment
                        </h3>
                        <div
                          style={{
                            backgroundColor: "#f8f9fa",
                            padding: "1rem",
                            borderRadius: "8px",
                            border: "1px solid #e0e0e0",
                            textAlign: "center",
                            marginBottom: "1rem",
                          }}
                        >
                          {" "}
                          <h4 style={{ margin: "0 0 1rem 0", color: "#333" }}>
                            VietQR Payment
                          </h4>
                          <p
                            style={{
                              margin: "0 0 1rem 0",
                              color: "#666",
                              fontSize: "0.875rem",
                            }}
                          >
                            Order #{orderCreated.id} - Rp{" "}
                            {totalPrice.toLocaleString()}
                          </p>
                          {paymentStatus === "pending" && (
                            <p
                              style={{
                                margin: "0 0 1rem 0",
                                color: "#666",
                                fontSize: "0.875rem",
                              }}
                            >
                              Scan the QR code below to complete your payment
                            </p>
                          )}
                          {paymentStatus === "checking" && (
                            <p
                              style={{
                                margin: "0 0 1rem 0",
                                color: "#2196F3",
                                fontSize: "0.875rem",
                                fontWeight: "600",
                              }}
                            >
                              ⏳ Waiting for payment confirmation...
                            </p>
                          )}
                          {paymentStatus === "completed" && (
                            <p
                              style={{
                                margin: "0 0 1rem 0",
                                color: "#4CAF50",
                                fontSize: "0.875rem",
                                fontWeight: "600",
                              }}
                            >
                              ✅ Payment confirmed successfully!
                            </p>
                          )}
                          {paymentStatus === "timeout" && (
                            <p
                              style={{
                                margin: "0 0 1rem 0",
                                color: "#FF5722",
                                fontSize: "0.875rem",
                                fontWeight: "600",
                              }}
                            >
                              ⚠️ Payment timeout. Please try again.
                            </p>
                          )}
                          <img
                            src={generateVietQRUrl(totalPrice)}
                            alt="VietQR Payment Code"
                            style={{
                              maxWidth: "250px",
                              width: "100%",
                              height: "auto",
                              border: "1px solid #ddd",
                              borderRadius: "4px",
                              marginBottom: "1rem",
                              opacity: paymentStatus === "completed" ? 0.5 : 1,
                            }}
                            onLoad={(e) => {
                              // Start payment polling when QR code is loaded and we have both UUID and order
                              if (
                                paymentUuid &&
                                orderCreated &&
                                paymentStatus === "pending"
                              ) {
                                startPaymentPolling(
                                  orderCreated.id,
                                  paymentUuid
                                );
                              }
                            }}
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextElementSibling.style.display =
                                "block";
                            }}
                          />
                          <div
                            style={{
                              display: "none",
                              padding: "1rem",
                              backgroundColor: "#ffebee",
                              color: "#c62828",
                              borderRadius: "4px",
                              margin: "1rem 0",
                            }}
                          >
                            Unable to load QR code. Please try again later.
                          </div>{" "}
                          <p
                            style={{
                              margin: "0",
                              fontSize: "0.75rem",
                              color: "#999",
                            }}
                          >
                            {paymentStatus === "checking"
                              ? "Payment will be confirmed automatically"
                              : paymentStatus === "completed"
                              ? "Payment has been processed successfully"
                              : paymentStatus === "timeout"
                              ? "Payment confirmation timed out"
                              : "Payment will be processed automatically after scanning"}
                          </p>
                        </div>

                        {/* Payment Status Actions */}
                        {paymentStatus === "completed" ? (
                          <button
                            onClick={handlePaymentComplete}
                            style={{
                              backgroundColor: "#4caf50",
                              color: "white",
                              border: "none",
                              padding: "15px 20px",
                              borderRadius: "8px",
                              fontSize: "16px",
                              fontWeight: "700",
                              cursor: "pointer",
                              width: "100%",
                              marginBottom: "0.5rem",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polyline points="20,6 9,17 4,12" />
                            </svg>
                            Continue Shopping
                          </button>
                        ) : paymentStatus === "timeout" ? (
                          <button
                            onClick={() => {
                              setPaymentStatus("pending");
                              const newUuid = generateUUID();
                              setPaymentUuidState(newUuid);
                              startPaymentPolling(orderCreated.id, newUuid);
                            }}
                            style={{
                              backgroundColor: "#FF5722",
                              color: "white",
                              border: "none",
                              padding: "15px 20px",
                              borderRadius: "8px",
                              fontSize: "16px",
                              fontWeight: "700",
                              cursor: "pointer",
                              width: "100%",
                              marginBottom: "0.5rem",
                            }}
                          >
                            Retry Payment
                          </button>
                        ) : (
                          <button
                            onClick={handlePaymentComplete}
                            disabled={paymentStatus === "checking"}
                            style={{
                              backgroundColor:
                                paymentStatus === "checking"
                                  ? "#ccc"
                                  : "#4caf50",
                              color: "white",
                              border: "none",
                              padding: "15px 20px",
                              borderRadius: "8px",
                              fontSize: "16px",
                              fontWeight: "700",
                              cursor:
                                paymentStatus === "checking"
                                  ? "not-allowed"
                                  : "pointer",
                              width: "100%",
                              marginBottom: "0.5rem",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.5rem",
                            }}
                          >
                            {paymentStatus === "checking" ? (
                              <>
                                <div
                                  style={{
                                    width: "16px",
                                    height: "16px",
                                    border: "2px solid #fff",
                                    borderTop: "2px solid transparent",
                                    borderRadius: "50%",
                                    animation: "spin 1s linear infinite",
                                  }}
                                />
                                Checking Payment...
                              </>
                            ) : (
                              <>
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <polyline points="20,6 9,17 4,12" />
                                </svg>
                                Mark as Paid (Manual)
                              </>
                            )}
                          </button>
                        )}
                        <button
                          onClick={handleBackToCart}
                          style={{
                            backgroundColor: "transparent",
                            color: "#666",
                            border: "2px solid #ccc",
                            padding: "15px 20px",
                            borderRadius: "8px",
                            fontSize: "16px",
                            cursor: "pointer",
                            width: "100%",
                          }}
                        >
                          Back to Cart
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Payment Method Section */}
                        <div
                          style={{
                            backgroundColor: "white",
                            padding: "20px",
                            borderRadius: "8px",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                          }}
                        >
                          <h3
                            style={{
                              fontSize: "16px",
                              fontWeight: "600",
                              color: "#333333",
                              marginBottom: "20px",
                            }}
                          >
                            Choose Payment method
                          </h3>
                          <div style={{ marginBottom: "12px" }}>
                            <label
                              style={{
                                display: "flex",
                                alignItems: "center",
                                cursor: "pointer",
                                marginBottom: "10px",
                              }}
                            >
                              <input
                                type="radio"
                                name="payment"
                                value="vietqr"
                                defaultChecked
                                style={{ marginRight: "8px" }}
                              />
                              <span
                                style={{
                                  fontSize: "14px",
                                  color: "#333333",
                                }}
                              >
                                VietQR
                              </span>
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
                                name="payment"
                                value="cod"
                                style={{ marginRight: "8px" }}
                              />
                              <span
                                style={{
                                  fontSize: "14px",
                                  color: "#333333",
                                }}
                              >
                                Ship COD
                              </span>
                            </label>
                          </div>
                          <a
                            href="#"
                            style={{
                              fontSize: "13px",
                              color: "#007BFF",
                              textDecoration: "none",
                              display: "block",
                              marginTop: "10px",
                            }}
                          >
                            Payment management
                          </a>
                        </div>

                        {/* Order Summary Section */}
                        <div
                          style={{
                            backgroundColor: "#E7F1FF",
                            padding: "20px",
                            borderRadius: "8px",
                          }}
                        >
                          <h3
                            style={{
                              fontSize: "16px",
                              fontWeight: "600",
                              color: "#333333",
                              marginBottom: "15px",
                            }}
                          >
                            Total ({cartItems.length} items)
                          </h3>

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "8px",
                            }}
                          >
                            <span
                              style={{ fontSize: "14px", color: "#495057" }}
                            >
                              Total product
                            </span>
                            <span
                              style={{ fontSize: "14px", color: "#495057" }}
                            >
                              {totalPrice.toLocaleString()}
                            </span>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "8px",
                            }}
                          >
                            <span
                              style={{ fontSize: "14px", color: "#495057" }}
                            >
                              Total shipping fee
                            </span>
                            <span
                              style={{ fontSize: "14px", color: "#495057" }}
                            >
                              0
                            </span>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "12px",
                            }}
                          >
                            <span
                              style={{ fontSize: "14px", color: "#495057" }}
                            >
                              Total Discount
                            </span>
                            <span
                              style={{ fontSize: "14px", color: "#DC3545" }}
                            >
                              -15,000
                            </span>
                          </div>

                          <hr
                            style={{
                              border: "none",
                              borderTop: "1px solid #BDD7FF",
                              margin: "12px 0",
                            }}
                          />

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "16px",
                                fontWeight: "700",
                                color: "#333333",
                              }}
                            >
                              Total Pay
                            </span>
                            <span
                              style={{
                                fontSize: "16px",
                                fontWeight: "700",
                                color: "#333333",
                              }}
                            >
                              {(totalPrice - 15000).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Total Pay Display */}
                        <div style={{ textAlign: "right", marginTop: "15px" }}>
                          <div
                            style={{
                              fontSize: "22px",
                              fontWeight: "800",
                              color: "#DC3545",
                            }}
                          >
                            Total Pay {(totalPrice - 15000).toLocaleString()}{" "}
                            VND
                          </div>
                          <div
                            style={{
                              fontSize: "13px",
                              color: "#6C757D",
                              marginTop: "6px",
                            }}
                          >
                            Saved 15,000 VND
                          </div>
                        </div>

                        {/* Confirm Order Button */}
                        <button
                          onClick={handleCheckout}
                          disabled={loading || cartItems.length === 0}
                          style={{
                            backgroundColor:
                              loading || cartItems.length === 0
                                ? "#ccc"
                                : "#007BFF",
                            color: "white",
                            border: "none",
                            padding: "15px 20px",
                            borderRadius: "8px",
                            fontSize: "18px",
                            fontWeight: "700",
                            cursor:
                              loading || cartItems.length === 0
                                ? "not-allowed"
                                : "pointer",
                            width: "100%",
                            marginTop: "20px",
                            textAlign: "center",
                          }}
                        >
                          {loading ? "Processing..." : "Confirm Order"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default Cart;
