import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCartItems,
  removeItemFromCart,
  updateCartItemQuantity,
  clearCart,
  createOrder,
  getUserInfo,
} from "../services/api";
import PageWrapper from "../component/global/PageWrapper";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const navigate = useNavigate();

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

      // Create order
      await createOrder(user.id, kitItems, totalPrice);

      // Clear cart after successful order
      clearCart();
      loadCartItems();
      setOrderSuccess(true);
    } catch (error) {
      console.error("Error creating order:", error);
      setError("Failed to create order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinueShopping = () => {
    navigate("/meal-plans");
  };

  const handleViewOrders = () => {
    navigate("/orders");
  };

  // Calculate total price
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  return (
    <PageWrapper>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
          }}
        >
          <svg
            style={{ marginRight: "0.5rem" }}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="m1 1 4 4 13 2 1 8H7"></path>
          </svg>
          Shopping Cart
        </h1>

        {error && (
          <div
            style={{
              backgroundColor: "#ffebee",
              color: "#c62828",
              padding: "1rem",
              borderRadius: "4px",
              marginBottom: "1.5rem",
              border: "1px solid #ffcdd2",
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
                borderRadius: "4px",
                marginBottom: "1.5rem",
                border: "1px solid #c8e6c9",
              }}
            >
              Your order has been placed successfully!
            </div>
            <div style={{ marginTop: "1.5rem" }}>
              <button
                onClick={handleViewOrders}
                style={{
                  backgroundColor: "#1976d2",
                  color: "white",
                  border: "none",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "4px",
                  fontSize: "1rem",
                  cursor: "pointer",
                  marginRight: "1rem",
                }}
              >
                View Orders
              </button>
              <button
                onClick={handleContinueShopping}
                style={{
                  backgroundColor: "transparent",
                  color: "#1976d2",
                  border: "2px solid #1976d2",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "4px",
                  fontSize: "1rem",
                  cursor: "pointer",
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
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <h3 style={{ color: "#666", marginBottom: "1rem" }}>
                  Your cart is empty
                </h3>
                <button
                  onClick={handleContinueShopping}
                  style={{
                    backgroundColor: "#1976d2",
                    color: "white",
                    border: "none",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "4px",
                    fontSize: "1rem",
                    cursor: "pointer",
                    marginTop: "1rem",
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
                <div
                  style={{
                    backgroundColor: "white",
                    padding: "1rem",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  {cartItems.map((item) => (
                    <div
                      key={item.kitId}
                      style={{
                        marginBottom: "1rem",
                        padding: "1rem",
                        border: "1px solid #eee",
                        borderRadius: "4px",
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "3fr 1fr 2fr 1fr",
                          gap: "1rem",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <h4
                            style={{
                              margin: "0 0 0.25rem 0",
                              fontWeight: "bold",
                            }}
                          >
                            {item.name}
                          </h4>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "0.875rem",
                              color: "#666",
                            }}
                          >
                            Kit ID: {item.kitId}
                          </p>
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: "1rem" }}>
                            Rp {item.price.toLocaleString()}
                          </p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                item.kitId,
                                item.quantity - 1
                              )
                            }
                            style={{
                              background: "none",
                              border: "1px solid #ccc",
                              borderRadius: "4px",
                              width: "32px",
                              height: "32px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
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
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                          </button>
                          <input
                            type="text"
                            value={item.quantity}
                            readOnly
                            style={{
                              width: "50px",
                              textAlign: "center",
                              margin: "0 0.5rem",
                              padding: "0.25rem",
                              border: "1px solid #ccc",
                              borderRadius: "4px",
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
                              background: "none",
                              border: "1px solid #ccc",
                              borderRadius: "4px",
                              width: "32px",
                              height: "32px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
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
                          </button>
                        </div>
                        <div>
                          <button
                            onClick={() => handleRemoveItem(item.kitId)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#f44336",
                              cursor: "pointer",
                              padding: "0.5rem",
                              borderRadius: "4px",
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
                              <polyline points="3,6 5,6 21,6" />
                              <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2" />
                              <line x1="10" y1="11" x2="10" y2="17" />
                              <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    backgroundColor: "white",
                    padding: "1.5rem",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    height: "fit-content",
                  }}
                >
                  <h3 style={{ marginBottom: "1rem" }}>Order Summary</h3>
                  <div style={{ marginBottom: "1rem" }}>
                    {cartItems.map((item) => (
                      <div
                        key={item.kitId}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "0.5rem",
                          fontSize: "0.875rem",
                        }}
                      >
                        <span>
                          {item.name} x {item.quantity}
                        </span>
                        <span>
                          Rp {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                  <hr
                    style={{
                      border: "none",
                      borderTop: "1px solid #e0e0e0",
                      margin: "1rem 0",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "1rem",
                      fontSize: "1.125rem",
                      fontWeight: "bold",
                    }}
                  >
                    <span>Total</span>
                    <span>Rp {totalPrice.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={loading || cartItems.length === 0}
                    style={{
                      backgroundColor:
                        loading || cartItems.length === 0 ? "#ccc" : "#1976d2",
                      color: "white",
                      border: "none",
                      padding: "0.75rem",
                      borderRadius: "4px",
                      fontSize: "1rem",
                      cursor:
                        loading || cartItems.length === 0
                          ? "not-allowed"
                          : "pointer",
                      width: "100%",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {loading ? "Processing..." : "Checkout"}
                  </button>
                  <button
                    onClick={handleContinueShopping}
                    style={{
                      backgroundColor: "transparent",
                      color: "#1976d2",
                      border: "2px solid #1976d2",
                      padding: "0.75rem",
                      borderRadius: "4px",
                      fontSize: "1rem",
                      cursor: "pointer",
                      width: "100%",
                    }}
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PageWrapper>
  );
};

export default Cart;
