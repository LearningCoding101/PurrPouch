package com.purrpouch.backend.controller;

import com.purrpouch.backend.model.Delivery;
import com.purrpouch.backend.service.DeliveryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deliveries")
public class DeliveryController {

    @Autowired
    private DeliveryService deliveryService;

    /**
     * Get all deliveries for a user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserDeliveries(@PathVariable Long userId) {
        List<Delivery> deliveries = deliveryService.getUserDeliveries(userId);
        return ResponseEntity.ok(deliveries);
    }

    /**
     * Get all deliveries for an order
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getOrderDeliveries(@PathVariable Long orderId) {
        List<Delivery> deliveries = deliveryService.getOrderDeliveries(orderId);
        return ResponseEntity.ok(deliveries);
    }

    /**
     * Update delivery status
     */
    @PutMapping("/{deliveryId}/status")
    public ResponseEntity<?> updateDeliveryStatus(
            @PathVariable Long deliveryId,
            @RequestBody UpdateDeliveryStatusRequest request) {
        Delivery delivery = deliveryService.updateDeliveryStatus(deliveryId, request.getStatus());
        return ResponseEntity.ok(delivery);
    }

    public static class UpdateDeliveryStatusRequest {
        private Delivery.DeliveryStatus status;

        public Delivery.DeliveryStatus getStatus() {
            return status;
        }

        public void setStatus(Delivery.DeliveryStatus status) {
            this.status = status;
        }
    }
}
