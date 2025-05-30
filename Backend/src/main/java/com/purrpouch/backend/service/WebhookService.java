package com.purrpouch.backend.service;

import com.purrpouch.backend.model.Order;
import com.purrpouch.backend.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class WebhookService {

    private static final Logger logger = LoggerFactory.getLogger(WebhookService.class);

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderService orderService;

    /**
     * Process VietQR payment webhook notification
     * Also handles Pay2S webhook format (same structure)
     * Expected format: {"transactions":[{"id":"1","gateway":"NH TMCP A
     * Chau","transactionDate":"2024-08-19",
     * "transactionNumber":"PAY2S001","accountNumber":"107880993336","content":"Thanh
     * toán đơn hàng #123",
     * "transferType":"invoice","transferAmount":10000.00}]}
     */
    @Transactional
    public void processVietQRPayment(Map<String, Object> payload) {
        logger.info("Processing VietQR webhook payment with payload: {}", payload);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> transactions = (List<Map<String, Object>>) payload.get("transactions");

        if (transactions == null || transactions.isEmpty()) {
            logger.warn("No transactions found in webhook payload");
            throw new RuntimeException("No transactions found in webhook payload");
        }

        logger.info("Processing {} transactions", transactions.size());
        for (Map<String, Object> transaction : transactions) {
            String content = (String) transaction.get("content");
            // Double transferAmount = (Double) transaction.get("transferAmount");

            // logger.info("Processing transaction - content: '{}', amount: {}", content,
            // transferAmount);

            // Extract UUID from transaction content using regex
            String uuid = extractUuidFromContent(content);
            logger.info("UUID extraction result: '{}' from content: '{}'", uuid, content);

            if (uuid != null) {
                logger.info("Found payment UUID: {} in transaction content: {}", uuid, content);

                // Find order by payment UUID
                Order order = orderRepository.findByPaymentUuid(uuid);
                logger.info("Order lookup result for UUID '{}': {}", uuid,
                        order != null ? "Order ID " + order.getId() + " (Status: " + order.getStatus() + ")"
                                : "Not found");

                if (order != null && order.getStatus() == Order.OrderStatus.PENDING) {
                    orderService.updateOrderStatus(order.getId(), Order.OrderStatus.PAID);
                    // // Verify payment amount matches order total
                    // if (order.getTotalPrice().doubleValue()) {
                    // // Update order status to PAID
                    // orderService.updateOrderStatus(order.getId(), Order.OrderStatus.PAID);

                    // } else {
                    // logger.error("Payment amount mismatch for order ID: {}. Expected: {},
                    // Received: {}",
                    // order.getId(), order.getTotalPrice(), transferAmount);
                    // }
                } else if (order == null) {
                    logger.error("Order not found for payment UUID: {}", uuid);
                } else {
                    logger.error("Order {} is not in PENDING status: {}", order.getId(), order.getStatus());
                }
            } else {
                logger.warn("No UUID found in transaction content: {}", content);
            }
        }
    }

    /**
     * Extract UUID from transaction content
     * Looks for UUID pattern in the content string
     * Handles formats like "PAY uuid", "uuid", or content containing UUID
     * Special handling for format: "PAY e8aad83dfc704db7853a5c75c706c745 Ma giao
     * dich..."
     * Returns UUID without dashes to match database storage format
     */
    private String extractUuidFromContent(String content) {
        if (content == null)
            return null;

        // First try to extract UUID from "PAY <uuid> Ma giao dich" format
        if (content.toUpperCase().startsWith("PAY ")) {
            String afterPay = content.substring(4); // Remove "PAY "
            int maGiaoDichIndex = afterPay.toLowerCase().indexOf("ma giao dich");

            if (maGiaoDichIndex > 0) {
                // Extract the part between "PAY " and " Ma giao dich" and trim whitespace
                String uuidCandidate = afterPay.substring(0, maGiaoDichIndex).trim();

                // Validate if it's a proper UUID format (32 hex chars without dashes)
                if (uuidCandidate.matches("[0-9a-fA-F]{32}")) {
                    return uuidCandidate;
                }
            }
        }

        // Fallback: Look for standard UUID pattern (8-4-4-4-12 hex digits) and remove
        // dashes
        Pattern uuidPattern = Pattern
                .compile("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}");
        Matcher matcher = uuidPattern.matcher(content);

        if (matcher.find()) {
            return matcher.group().replace("-", ""); // Remove dashes to match database format
        }

        // Also check for 32-character hex string (UUID without dashes)
        Pattern uuidNoDashPattern = Pattern.compile("[0-9a-fA-F]{32}");
        Matcher noDashMatcher = uuidNoDashPattern.matcher(content);

        if (noDashMatcher.find()) {
            return noDashMatcher.group();
        }

        return null;
    }
}
