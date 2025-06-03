package com.purrpouch.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.beans.factory.annotation.Autowired;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.email.enabled:false}")
    private boolean emailEnabled;

    @Value("${app.email.from:noreply@purrpouch.com}")
    private String fromEmail;

    /**
     * Send password reset OTP via email
     * 
     * @param email   The recipient email address
     * @param otpCode The OTP code
     * @return true if sent successfully
     */
    public boolean sendPasswordResetOtp(String email, String otpCode) {
        if (!emailEnabled || mailSender == null) {
            logger.info("Email is disabled or not configured. Would send password reset OTP to {}: {}", email, otpCode);
            return true; // Return true for testing purposes
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("PurrPOUCH Password Reset Code");
            helper.setText(String.format(
                    "Your PurrPOUCH password reset code is: %s\n\n" +
                            "This code will expire in 10 minutes.\n\n" +
                            "If you didn't request this password reset, please ignore this email.\n\n" +
                            "Best regards,\n" +
                            "The PurrPOUCH Team",
                    otpCode), false);

            mailSender.send(mimeMessage);
            logger.info("Password reset OTP email sent successfully to: {}", email);
            return true;

        } catch (Exception e) {
            logger.error("Failed to send password reset OTP email to {}: {}", email, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Send welcome email to new user
     * 
     * @param email    The recipient email address
     * @param username The user's name
     * @return true if sent successfully
     */
    public boolean sendWelcomeEmail(String email, String username) {
        if (!emailEnabled || mailSender == null) {
            logger.info("Email is disabled or not configured. Would send welcome email to {}", email);
            return true;
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("Welcome to PurrPOUCH!");
            helper.setText(String.format(
                    "Dear %s,\n\n" +
                            "Welcome to PurrPOUCH! We're excited to help you provide the best nutrition for your feline friends.\n\n"
                            +
                            "You can now:\n" +
                            "- Create cat profiles\n" +
                            "- Browse our meal plans\n" +
                            "- Schedule deliveries\n" +
                            "- Get personalized nutrition advice\n\n" +
                            "Start exploring at: https://purrpouch.com\n\n" +
                            "Best regards,\n" +
                            "The PurrPOUCH Team",
                    username), false);

            mailSender.send(mimeMessage);
            logger.info("Welcome email sent successfully to: {}", email);
            return true;

        } catch (Exception e) {
            logger.error("Failed to send welcome email to {}: {}", email, e.getMessage(), e);
            return false;
        }
    }
}
