package com.purrpouch.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentNotificationService.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Send a payment status update via WebSocket
     * 
     * @param orderId The order ID
     * @param status  The payment status (PENDING, PAID, FAILED)
     */
    public void sendPaymentStatusUpdate(Long orderId, String status) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("orderId", orderId);
        payload.put("status", status);
        payload.put("timestamp", System.currentTimeMillis());

        logger.info("Sending payment update for order {}: {}", orderId, status);

        // Send to a topic specific to this order
        messagingTemplate.convertAndSend("/topic/payment/" + orderId, payload);

        // Also send to a general payment updates topic
        messagingTemplate.convertAndSend("/topic/payments", payload);
    }
}
