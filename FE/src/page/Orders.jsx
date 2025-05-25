import React, { useState, useEffect } from "react";
import { getUserOrders, getOrderKits, getUserInfo } from "../services/api";
import PageWrapper from "../component/global/PageWrapper";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [expandedOrderKits, setExpandedOrderKits] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserAndOrders();
  }, []);

  const loadUserAndOrders = async () => {
    try {
      setLoading(true);
      // Get user info
      const userResponse = await getUserInfo();
      setUser(userResponse.data);

      // Get user orders
      const ordersResponse = await getUserOrders(userResponse.data.id);
      setOrders(ordersResponse.data);

      // Pre-fetch order kits for each order
      const orderKitsPromises = ordersResponse.data.map(async (order) => {
        try {
          const kitsResponse = await getOrderKits(order.id);
          return { orderId: order.id, kits: kitsResponse.data };
        } catch (error) {
          console.error(`Error loading kits for order ${order.id}:`, error);
          return { orderId: order.id, kits: [] };
        }
      });

      const orderKitsResults = await Promise.all(orderKitsPromises);

      // Create a map of order ID to kits
      const expandedOrders = {};
      orderKitsResults.forEach((result) => {
        expandedOrders[result.orderId] = result.kits;
      });

      setExpandedOrderKits(expandedOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "#ff9800"; // orange
      case "PAID":
        return "#4caf50"; // green
      case "FAILED":
        return "#f44336"; // red
      case "CANCELLED":
        return "#9e9e9e"; // gray
      default:
        return "#9e9e9e"; // gray
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  if (loading) {
    return (
      <PageWrapper>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem", textAlign: "center" }}>
          <div style={{ display: "inline-block", width: "40px", height: "40px", border: "4px solid #f3f3f3", borderTop: "4px solid #3498db", borderRadius: "50%", animation: "spin 1s linear infinite" }}>
          </div>
          <p style={{ marginTop: "1rem", fontSize: "16px" }}>Loading your orders...</p>
        </div>
      </PageWrapper>
    );
  }
  return (
    <PageWrapper>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .accordion {
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            margin-top: 1rem;
          }
          .accordion-header {
            background-color: #f5f5f5;
            padding: 1rem;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #e0e0e0;
          }
          .accordion-header:hover {
            background-color: #eeeeee;
          }
          .accordion-content {
            padding: 1rem;
            display: none;
          }
          .accordion-content.expanded {
            display: block;
          }
          .expand-icon {
            transition: transform 0.3s ease;
          }
          .expand-icon.expanded {
            transform: rotate(180deg);
          }
        `}
      </style>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              marginRight: "0.5rem",
              padding: "0.5rem",
              borderRadius: "4px",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m12 19-7-7 7-7"/>
              <path d="M19 12H5"/>
            </svg>
          </button>
          <h1 style={{ margin: 0, fontSize: "2rem", display: "flex", alignItems: "center" }}>
            <svg style={{ marginRight: "0.5rem" }} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            My Orders
          </h1>
        </div>

        {error && (
          <div style={{
            backgroundColor: "#ffebee",
            color: "#c62828",
            padding: "1rem",
            borderRadius: "4px",
            marginBottom: "1.5rem",
            border: "1px solid #ffcdd2"
          }}>
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div style={{
            backgroundColor: "white",
            padding: "2rem",
            textAlign: "center",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ color: "#666", margin: 0 }}>You don't have any orders yet</h3>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1.5rem" }}>
            {orders.map((order) => (
              <div key={order.id} style={{
                backgroundColor: "white",
                padding: "1.5rem",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem"
                }}>
                  <h3 style={{ margin: 0, fontSize: "1.25rem" }}>Order #{order.id}</h3>
                  <span style={{
                    backgroundColor: getStatusColor(order.status),
                    color: "white",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "16px",
                    fontSize: "0.875rem",
                    fontWeight: "bold"
                  }}>
                    {order.status}
                  </span>
                </div>

                <p style={{
                  color: "#666",
                  fontSize: "0.875rem",
                  margin: "0 0 1rem 0"
                }}>
                  Placed on: {formatDate(order.createdAt)}
                </p>

                <p style={{
                  margin: "1rem 0",
                  fontSize: "1.125rem",
                  fontWeight: "bold"
                }}>
                  Total: Rp {order.totalPrice?.toLocaleString()}
                </p>

                <hr style={{ border: "none", borderTop: "1px solid #e0e0e0", margin: "1rem 0" }} />

                <div className="accordion">
                  <div 
                    className="accordion-header"
                    onClick={() => {
                      const content = document.getElementById(`accordion-${order.id}`);
                      const icon = document.getElementById(`icon-${order.id}`);
                      content.classList.toggle('expanded');
                      icon.classList.toggle('expanded');
                    }}
                  >
                    <span>Order Items ({expandedOrderKits[order.id]?.length || 0})</span>
                    <svg 
                      id={`icon-${order.id}`}
                      className="expand-icon"
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                    >
                      <polyline points="6,9 12,15 18,9"/>
                    </svg>
                  </div>
                  <div id={`accordion-${order.id}`} className="accordion-content">
                    {expandedOrderKits[order.id]?.length > 0 ? (
                      expandedOrderKits[order.id].map((kitItem) => (
                        <div
                          key={kitItem.id}
                          style={{
                            backgroundColor: "#f9f9f9",
                            padding: "1rem",
                            marginBottom: "1rem",
                            borderRadius: "4px",
                            border: "1px solid #e0e0e0"
                          }}
                        >
                          <h4 style={{ margin: "0 0 0.5rem 0" }}>
                            {kitItem.foodKit.name}
                          </h4>
                          <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "0.875rem",
                            color: "#666"
                          }}>
                            <span>Quantity: {kitItem.kitQuantity}</span>
                            <span>Cat ID: {kitItem.foodKit.catProfile.id}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: "#666", fontSize: "0.875rem" }}>
                        No items available for this order
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Orders;
