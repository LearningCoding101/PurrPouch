package com.purrpouch.backend.controller;

import com.purrpouch.backend.model.Order;
import com.purrpouch.backend.model.OrderKit;
import com.purrpouch.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

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
}
