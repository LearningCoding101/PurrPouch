package com.purrpouch.backend.controller;

import com.purrpouch.backend.model.User;
import com.purrpouch.backend.model.Order.OrderStatus;
import com.purrpouch.backend.model.Delivery.DeliveryStatus;
import com.purrpouch.backend.payload.request.auth.CreateAdminRequest;
import com.purrpouch.backend.payload.response.MessageResponse;
import com.purrpouch.backend.service.AdminService;
import com.purrpouch.backend.service.OrderService;
import com.purrpouch.backend.service.DeliveryService;
import com.purrpouch.backend.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private DeliveryService deliveryService;

    @Autowired
    private UserRepository userRepository;

    // Create default admin account (this endpoint doesn't require authentication)
    @PostMapping("/create-default-admin")
    @PreAuthorize("permitAll()")
    public ResponseEntity<?> createDefaultAdmin(@Valid @RequestBody CreateAdminRequest request) {
        try {
            adminService.createDefaultAdmin(
                    request.getEmail(),
                    request.getPassword(),
                    request.getUsername());
            return ResponseEntity.ok(new MessageResponse("Default admin account created successfully!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error creating admin: " + e.getMessage()));
        }
    }

    // Get all orders
    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<?> orders = orderService.getAllOrdersForAdmin(pageable, status);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error fetching orders: " + e.getMessage()));
        }
    }

    // Get order details
    @GetMapping("/orders/{orderId}")
    public ResponseEntity<?> getOrderDetails(@PathVariable Long orderId) {
        try {
            var orderDetails = orderService.getOrderDetailsForAdmin(orderId);
            return ResponseEntity.ok(orderDetails);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error fetching order details: " + e.getMessage()));
        }
    } // Update order status

    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            OrderStatus orderStatus = OrderStatus.valueOf(status);
            orderService.updateOrderStatusByAdmin(orderId, orderStatus);
            return ResponseEntity.ok(new MessageResponse("Order status updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error updating order status: " + e.getMessage()));
        }
    }

    // Get all users
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
            Page<User> users = userRepository.findAll(pageable);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error fetching users: " + e.getMessage()));
        }
    }

    // Get user details
    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUserDetails(@PathVariable Long userId) {
        try {
            Optional<User> userOptional = userRepository.findById(userId);
            if (userOptional.isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("User not found"));
            }

            User user = userOptional.get();
            Map<String, Object> userDetails = new HashMap<>();
            userDetails.put("id", user.getId());
            userDetails.put("username", user.getUsername());
            userDetails.put("email", user.getEmail());
            userDetails.put("role", user.getRole());
            userDetails.put("enabled", user.isEnabled());
            userDetails.put("photoUrl", user.getPhotoUrl());
            // Add order count and other details as needed

            return ResponseEntity.ok(userDetails);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error fetching user details: " + e.getMessage()));
        }
    }

    // Update user role
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request) {
        try {
            String role = request.get("role");
            adminService.updateUserRole(userId, role);
            return ResponseEntity.ok(new MessageResponse("User role updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error updating user role: " + e.getMessage()));
        }
    }

    // Get all deliveries
    @GetMapping("/deliveries")
    public ResponseEntity<?> getAllDeliveries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<?> deliveries = deliveryService.getAllDeliveriesForAdmin(pageable, status);
            return ResponseEntity.ok(deliveries);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error fetching deliveries: " + e.getMessage()));
        }
    } // Update delivery status

    @PutMapping("/deliveries/{deliveryId}/status")
    public ResponseEntity<?> updateDeliveryStatus(
            @PathVariable Long deliveryId,
            @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            DeliveryStatus deliveryStatus = DeliveryStatus.valueOf(status);
            deliveryService.updateDeliveryStatusByAdmin(deliveryId, deliveryStatus);
            return ResponseEntity.ok(new MessageResponse("Delivery status updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error updating delivery status: " + e.getMessage()));
        }
    }

    // Analytics endpoints
    @GetMapping("/analytics/orders")
    public ResponseEntity<?> getOrderAnalytics(@RequestParam(defaultValue = "week") String timeFrame) {
        try {
            Map<String, Object> analytics = adminService.getOrderAnalytics(timeFrame);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error fetching order analytics: " + e.getMessage()));
        }
    }

    @GetMapping("/analytics/revenue")
    public ResponseEntity<?> getRevenueAnalytics(@RequestParam(defaultValue = "week") String timeFrame) {
        try {
            Map<String, Object> analytics = adminService.getRevenueAnalytics(timeFrame);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error fetching revenue analytics: " + e.getMessage()));
        }
    }

    @GetMapping("/analytics/customers")
    public ResponseEntity<?> getCustomerAnalytics(@RequestParam(defaultValue = "week") String timeFrame) {
        try {
            Map<String, Object> analytics = adminService.getCustomerAnalytics(timeFrame);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error fetching customer analytics: " + e.getMessage()));
        }
    }
}
