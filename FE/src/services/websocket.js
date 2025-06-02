// Polyfill for global which is required by sockjs-client
if (typeof global === "undefined") {
  window.global = window;
}

import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

// Base URL for WebSocket connection
const WS_BASE_URL = "http://localhost:8080/ws";

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.isConnected = false;
    this.subscriptions = {};
    this.connectionPromise = null;
    this.reconnectTimeoutId = null;
    this.reconnectDelay = 5000; // 5 seconds
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem("token");
    return token && token.length > 0;
  }
  // Connect to WebSocket server
  connect() {
    // Don't connect if not authenticated
    if (!this.isAuthenticated()) {
      console.log("WebSocket: User not authenticated, skipping connection");
      return Promise.reject(new Error("User not authenticated"));
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        // Get auth token from localStorage
        const token = localStorage.getItem("token");

        // Prepare headers for authentication
        const connectHeaders = {};
        if (token) {
          connectHeaders["Authorization"] = `Bearer ${token}`;
          // Also try setting as custom header for WebSocket compatibility
          connectHeaders["token"] = token;
        }

        console.log(
          "Connecting to WebSocket with auth token:",
          token ? `Token present (${token.substring(0, 10)}...)` : "No token"
        );

        // Create STOMP client with SockJS
        this.stompClient = new Client({
          webSocketFactory: () => new SockJS(WS_BASE_URL),
          connectHeaders: connectHeaders,
          debug:
            process.env.NODE_ENV !== "production" ? console.log : undefined,
          reconnectDelay: this.reconnectDelay,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          onConnect: () => {
            console.log("WebSocket connected successfully with authentication");
            this.isConnected = true;
            this.clearReconnectTimeout();
            resolve();
          },
          onStompError: (frame) => {
            console.error("WebSocket STOMP error:", frame);
            console.error(
              "WebSocket connection failed. Status:",
              frame.headers?.message || "Unknown"
            );

            if (
              frame.headers?.message?.includes("401") ||
              frame.headers?.message?.includes("Unauthorized")
            ) {
              console.error(
                "WebSocket authentication failed. Please ensure you're logged in."
              );
            }

            this.isConnected = false;
            this.connectionPromise = null;
            this.scheduleReconnect();
            reject(
              new Error(frame.headers?.message || "STOMP connection failed")
            );
          },
          onWebSocketError: (event) => {
            console.error("WebSocket error:", event);
            this.isConnected = false;
            this.connectionPromise = null;
            this.scheduleReconnect();
            reject(new Error("WebSocket connection failed"));
          },
        });

        // Activate the client
        this.stompClient.activate();
      } catch (error) {
        console.error("Failed to establish WebSocket connection:", error);
        this.connectionPromise = null;
        this.scheduleReconnect();
        reject(error);
      }
    });

    return this.connectionPromise;
  } // Schedule reconnection
  scheduleReconnect() {
    // Don't reconnect if not authenticated
    if (!this.isAuthenticated()) {
      console.log("WebSocket: Not authenticated, cancelling reconnection");
      return;
    }

    this.clearReconnectTimeout();
    this.reconnectTimeoutId = setTimeout(() => {
      console.log("Attempting to reconnect WebSocket...");
      this.connectionPromise = null; // Reset the connection promise
      this.connect();
    }, this.reconnectDelay);
  }

  // Force reconnect when user logs in
  forceReconnect() {
    this.disconnect();
    this.connectionPromise = null;
    if (this.isAuthenticated()) {
      return this.connect();
    }
    return Promise.reject(new Error("User not authenticated"));
  }

  // Clear reconnection timeout
  clearReconnectTimeout() {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
  }
  // Disconnect from WebSocket server
  disconnect() {
    this.clearReconnectTimeout();

    if (this.stompClient && this.isConnected) {
      this.stompClient.deactivate();
      console.log("WebSocket disconnected");
      this.isConnected = false;
      this.connectionPromise = null;
      this.subscriptions = {};
    }
  } // Subscribe to a topic
  subscribe(topic, callback) {
    // Check authentication before subscribing
    if (!this.isAuthenticated()) {
      console.error("Cannot subscribe to WebSocket: User not authenticated");
      return Promise.reject(new Error("User not authenticated"));
    }

    return this.connect()
      .then(() => {
        if (!this.subscriptions[topic]) {
          try {
            const subscription = this.stompClient.subscribe(
              topic,
              (message) => {
                try {
                  const parsedBody = JSON.parse(message.body);
                  callback(parsedBody);
                } catch (error) {
                  console.error("Error parsing WebSocket message:", error);
                  // Still try to use the message even if JSON parsing fails
                  callback(message.body);
                }
              }
            );
            this.subscriptions[topic] = subscription;
            console.log(`Successfully subscribed to ${topic}`);
          } catch (error) {
            console.error(`Error during subscription to ${topic}:`, error);
            // Attempt to reconnect on subscription error
            this.isConnected = false;
            this.connectionPromise = null;
            this.scheduleReconnect();
            throw error;
          }
        } else {
          console.log(`Already subscribed to ${topic}`);
        }
      })
      .catch((error) => {
        console.error(`Failed to subscribe to ${topic}:`, error);

        // Only retry if user is still authenticated
        if (this.isAuthenticated()) {
          // Try to reconnect after a short delay
          setTimeout(() => {
            if (!this.isConnected && this.isAuthenticated()) {
              this.connectionPromise = null;
              this.connect()
                .then(() => this.subscribe(topic, callback))
                .catch(console.error);
            }
          }, 2000);
        }

        throw error;
      });
  }

  // Unsubscribe from a topic
  unsubscribe(topic) {
    if (this.subscriptions[topic]) {
      this.subscriptions[topic].unsubscribe();
      delete this.subscriptions[topic];
    }
  }
  // Send a message to a destination
  send(destination, body) {
    if (!this.isAuthenticated()) {
      console.error("Cannot send WebSocket message: User not authenticated");
      return Promise.reject(new Error("User not authenticated"));
    }

    return this.connect()
      .then(() => {
        this.stompClient.send(destination, {}, JSON.stringify(body));
      })
      .catch((error) => {
        console.error(`Failed to send message to ${destination}:`, error);
        throw error;
      });
  }

  // Subscribe to payment updates for a specific order
  subscribeToOrderPayment(orderId, callback) {
    return this.subscribe(`/topic/payment/${orderId}`, callback);
  }

  // Subscribe to all payment updates
  subscribeToAllPayments(callback) {
    return this.subscribe("/topic/payments", callback);
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;
