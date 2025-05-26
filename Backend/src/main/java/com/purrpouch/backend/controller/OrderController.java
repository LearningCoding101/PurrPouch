package com.purrpouch.backend.controller;

import com.purrpouch.backend.model.Address;
import com.purrpouch.backend.model.Delivery;
import com.purrpouch.backend.model.Order;
import com.purrpouch.backend.model.OrderKit;
import com.purrpouch.backend.service.DeliveryService;
import com.purrpouch.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    @Autowired
    private OrderService orderService;

    @Autowired
    private DeliveryService deliveryService;

    /**
     * Create a new order
     */
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest request) {
        Order order = orderService.createOrder(
                request.getUserId(),
                request.getKitItems(),
                request.getTotalPrice());
        return ResponseEntity.ok(order);
    }

    /**
     * Get all orders for a user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserOrders(@PathVariable Long userId) {
        List<Order> orders = orderService.getUserOrders(userId);
        return ResponseEntity.ok(orders);
    }

    /**
     * Get an order by ID
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrder(@PathVariable Long orderId) {
        Order order = orderService.getOrderById(orderId);
        return ResponseEntity.ok(order);
    }

    /**
     * Get all kits in an order
     */
    @GetMapping("/{orderId}/kits")
    public ResponseEntity<?> getOrderKits(@PathVariable Long orderId) {
        List<OrderKit> kits = orderService.getOrderKits(orderId);
        return ResponseEntity.ok(kits);
    }

    /**
     * Update order status
     */
    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody UpdateOrderStatusRequest request) {
        Order order = orderService.updateOrderStatus(orderId, request.getStatus());
        return ResponseEntity.ok(order);
    }

    /**
     * Create a new order with delivery options
     */
    @PostMapping("/with-delivery")
    public ResponseEntity<?> createOrderWithDelivery(@RequestBody CreateOrderWithDeliveryRequest request) {
        Order order = orderService.createOrder(
                request.getUserId(),
                request.getKitItems(),
                request.getTotalPrice(),
                request.isRecurring(),
                request.getRecurringFrequency(),
                request.getPreferredDeliveryTime(),
                request.getDeliveryAddress());
        return ResponseEntity.ok(order);
    }

    /**
     * Get all deliveries for a user
     */
    @GetMapping("/user/{userId}/deliveries")
    public ResponseEntity<?> getUserDeliveries(@PathVariable Long userId) {
        List<Delivery> deliveries = deliveryService.getUserDeliveries(userId);
        return ResponseEntity.ok(deliveries);
    }

    // Request/Response classes
    public static class CreateOrderRequest {
        private Long userId;
        private Map<Long, Integer> kitItems = new HashMap<>();
        private BigDecimal totalPrice;

        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public Map<Long, Integer> getKitItems() {
            return kitItems;
        }

        public void setKitItems(Map<Long, Integer> kitItems) {
            this.kitItems = kitItems;
        }

        public BigDecimal getTotalPrice() {
            return totalPrice;
        }

        public void setTotalPrice(BigDecimal totalPrice) {
            this.totalPrice = totalPrice;
        }
    }

    public static class UpdateOrderStatusRequest {
        private Order.OrderStatus status;

        public Order.OrderStatus getStatus() {
            return status;
        }

        public void setStatus(Order.OrderStatus status) {
            this.status = status;
        }
    }

    public static class CreateOrderWithDeliveryRequest extends CreateOrderRequest {
        private boolean isRecurring;
        private Order.RecurringFrequency recurringFrequency;
        private LocalTime preferredDeliveryTime;
        private Address deliveryAddress;

        // Getters and setters
        public boolean isRecurring() {
            return isRecurring;
        }

        public void setRecurring(boolean recurring) {
            isRecurring = recurring;
        }

        public Order.RecurringFrequency getRecurringFrequency() {
            return recurringFrequency;
        }

        public void setRecurringFrequency(Order.RecurringFrequency recurringFrequency) {
            this.recurringFrequency = recurringFrequency;
        }

        public LocalTime getPreferredDeliveryTime() {
            return preferredDeliveryTime;
        }

        public void setPreferredDeliveryTime(LocalTime preferredDeliveryTime) {
            this.preferredDeliveryTime = preferredDeliveryTime;
        }

        public Address getDeliveryAddress() {
            return deliveryAddress;
        }

        public void setDeliveryAddress(Address deliveryAddress) {
            this.deliveryAddress = deliveryAddress;
        }
    }
}
