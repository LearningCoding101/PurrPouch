package com.purrpouch.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.Map;

@Service
public class SmsService {

    private static final Logger logger = LoggerFactory.getLogger(SmsService.class);

    @Value("${app.sms.enabled:false}")
    private boolean smsEnabled;

    @Value("${app.sms.provider:mock}")
    private String smsProvider;

    @Value("${app.sms.twilio.accountSid:}")
    private String twilioAccountSid;

    @Value("${app.sms.twilio.authToken:}")
    private String twilioAuthToken;

    @Value("${app.sms.twilio.fromNumber:}")
    private String twilioFromNumber;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public SmsService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Send SMS message to phone number
     * 
     * @param phoneNumber The recipient phone number (with country code)
     * @param message     The message content
     * @return true if sent successfully, false otherwise
     */
    public boolean sendSms(String phoneNumber, String message) {
        if (!smsEnabled) {
            logger.info("SMS is disabled. Would send to {}: {}", phoneNumber, message);
            return true; // Return true for testing purposes
        }

        try {
            switch (smsProvider.toLowerCase()) {
                case "twilio":
                    return sendViaTwilio(phoneNumber, message);
                case "mock":
                default:
                    return sendViaMock(phoneNumber, message);
            }
        } catch (Exception e) {
            logger.error("Failed to send SMS to {}: {}", phoneNumber, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Send OTP code via SMS
     * 
     * @param phoneNumber The recipient phone number
     * @param otpCode     The OTP code
     * @return true if sent successfully
     */
    public boolean sendOtpSms(String phoneNumber, String otpCode) {
        String message = String.format("Your PurrPOUCH verification code is: %s. This code will expire in 5 minutes.",
                otpCode);
        return sendSms(phoneNumber, message);
    }

    /**
     * Send password reset OTP via SMS
     * 
     * @param phoneNumber The recipient phone number
     * @param otpCode     The OTP code
     * @return true if sent successfully
     */
    public boolean sendPasswordResetSms(String phoneNumber, String otpCode) {
        String message = String
                .format("Your PurrPOUCH password reset code is: %s. This code will expire in 10 minutes.", otpCode);
        return sendSms(phoneNumber, message);
    }

    private boolean sendViaTwilio(String phoneNumber, String message) {
        try {
            String url = String.format("https://api.twilio.com/2010-04-01/Accounts/%s/Messages.json", twilioAccountSid);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.setBasicAuth(twilioAccountSid, twilioAuthToken);

            Map<String, String> body = new HashMap<>();
            body.put("From", twilioFromNumber);
            body.put("To", phoneNumber);
            body.put("Body", message);

            // Convert to form data
            StringBuilder formData = new StringBuilder();
            for (Map.Entry<String, String> entry : body.entrySet()) {
                if (formData.length() > 0) {
                    formData.append("&");
                }
                formData.append(entry.getKey()).append("=").append(entry.getValue());
            }

            HttpEntity<String> request = new HttpEntity<>(formData.toString(), headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);

            logger.info("Twilio SMS sent successfully to {}", phoneNumber);
            return response.getStatusCode().is2xxSuccessful();

        } catch (Exception e) {
            logger.error("Failed to send SMS via Twilio: {}", e.getMessage(), e);
            return false;
        }
    }

    private boolean sendViaMock(String phoneNumber, String message) {
        // Mock implementation for development
        logger.info("MOCK SMS to {}: {}", phoneNumber, message);

        // Simulate some processing time
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        return true;
    }

    /**
     * Validate phone number format
     * 
     * @param phoneNumber The phone number to validate
     * @return true if valid format
     */
    public boolean isValidPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            return false;
        }

        // Remove all non-digit characters except +
        String cleaned = phoneNumber.replaceAll("[^+0-9]", "");

        // Should start with + or be 10-15 digits
        if (cleaned.startsWith("+")) {
            return cleaned.length() >= 10 && cleaned.length() <= 16;
        } else {
            return cleaned.length() >= 10 && cleaned.length() <= 15;
        }
    }

    /**
     * Normalize phone number to international format
     * 
     * @param phoneNumber The phone number to normalize
     * @return Normalized phone number or null if invalid
     */
    public String normalizePhoneNumber(String phoneNumber) {
        if (!isValidPhoneNumber(phoneNumber)) {
            return null;
        }

        String cleaned = phoneNumber.replaceAll("[^+0-9]", "");

        // If already international format, return as is
        if (cleaned.startsWith("+")) {
            return cleaned;
        }

        // If starts with 0 (Vietnam format), convert to +84
        if (cleaned.startsWith("0")) {
            return "+84" + cleaned.substring(1);
        }

        // If 9 digits, assume Vietnam mobile without leading 0
        if (cleaned.length() == 9) {
            return "+84" + cleaned;
        }

        // If 10 digits and starts with common Vietnam prefixes, assume Vietnam
        if (cleaned.length() == 10 && (cleaned.startsWith("03") || cleaned.startsWith("05") ||
                cleaned.startsWith("07") || cleaned.startsWith("08") ||
                cleaned.startsWith("09"))) {
            return "+84" + cleaned.substring(1);
        }

        // Default: assume it's already a valid international number without +
        return "+" + cleaned;
    }
}
