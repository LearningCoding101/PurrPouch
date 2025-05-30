package com.purrpouch.backend.controller;

import com.purrpouch.backend.service.WebhookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/webhook")
public class WebhookController {

    @Autowired
    private WebhookService webhookService;

    /**
     * Webhook endpoint to receive VietQR payment notifications
     * Also supports Pay2S webhook format
     * 
     * Security: This endpoint is completely open - no authentication required,
     * CSRF is disabled, and CORS allows all origins.
     * Configured in WebSecurityConfig.java
     */
    @PostMapping("/vietqr")
    public ResponseEntity<?> handleVietQRWebhook(@RequestBody Map<String, Object> payload) {
        try {
            webhookService.processVietQRPayment(payload);
            return ResponseEntity.ok().body(Map.of("status", "success", "message", "Payment processed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", e.getMessage()));
        }
    }

    /**
     * Alias endpoint for Pay2S webhook (same implementation as VietQR)
     * Pay2S uses the same transaction format as VietQR
     */
    @PostMapping("/pay2s")
    public ResponseEntity<?> handlePay2SWebhook(@RequestBody Map<String, Object> payload) {
        return handleVietQRWebhook(payload);
    }

    /**
     * Webhook endpoint for MBBank payment notifications (new format)
     * Handles single transaction objects with 'description' field
     * Expected format: {
     * "id": 1865379,
     * "transaction_date": "2025-05-30 23:36:08",
     * "transaction_id": "FT25150549035680",
     * "account_number": "0379604656",
     * "bank": "MBB",
     * "amount": 20000,
     * "description": "PAY 182bc1b92c77424cba1192f51a6fba1e Ma giao dich Trace024439
     * Trace 024439",
     * "type": "IN",
     * "checksum": "29f02404dd734b0ba070f771e83fe544"
     * }
     */
    @PostMapping("/mbbank")
    public ResponseEntity<?> handleMBBankWebhook(@RequestBody Map<String, Object> payload) {
        try {
            webhookService.processVietQRPayment(payload);
            return ResponseEntity.ok().body(Map.of("status", "success", "message", "Payment processed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", e.getMessage()));
        }
    }
}
