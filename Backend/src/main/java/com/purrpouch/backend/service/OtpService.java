package com.purrpouch.backend.service;

import com.purrpouch.backend.model.OtpVerification;
import com.purrpouch.backend.repository.OtpVerificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Transactional
public class OtpService {

    private static final Logger logger = LoggerFactory.getLogger(OtpService.class);
    private static final int OTP_LENGTH = 6;
    private static final int PHONE_VERIFICATION_EXPIRY_MINUTES = 5;
    private static final int PASSWORD_RESET_EXPIRY_MINUTES = 10;

    @Autowired
    private OtpVerificationRepository otpRepository;

    @Autowired
    private SmsService smsService;

    @Autowired
    private EmailService emailService;

    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Generate and send OTP for phone verification
     * 
     * @param phoneNumber The phone number to send OTP to
     * @return true if OTP was generated and sent successfully
     */
    public boolean generateAndSendPhoneVerificationOtp(String phoneNumber) {
        try {
            // Normalize phone number
            String normalizedPhoneNumber = smsService.normalizePhoneNumber(phoneNumber);
            if (normalizedPhoneNumber == null) {
                logger.error("Invalid phone number format: {}", phoneNumber);
                return false;
            }

            // Generate OTP code
            String otpCode = generateOtpCode();

            // Save OTP to database
            OtpVerification otp = new OtpVerification(
                    normalizedPhoneNumber,
                    null, // no email for phone verification
                    otpCode,
                    OtpVerification.OtpType.PHONE_VERIFICATION,
                    PHONE_VERIFICATION_EXPIRY_MINUTES);

            otpRepository.save(otp);

            // Send SMS
            boolean sent = smsService.sendOtpSms(normalizedPhoneNumber, otpCode);

            if (sent) {
                logger.info("Phone verification OTP sent to: {}", normalizedPhoneNumber);
                return true;
            } else {
                logger.error("Failed to send OTP SMS to: {}", normalizedPhoneNumber);
                return false;
            }

        } catch (Exception e) {
            logger.error("Error generating phone verification OTP for {}: {}", phoneNumber, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Generate and send OTP for password reset via phone
     * 
     * @param phoneNumber The phone number to send OTP to
     * @return true if OTP was generated and sent successfully
     */
    public boolean generateAndSendPasswordResetOtpPhone(String phoneNumber) {
        try {
            String normalizedPhoneNumber = smsService.normalizePhoneNumber(phoneNumber);
            if (normalizedPhoneNumber == null) {
                logger.error("Invalid phone number format: {}", phoneNumber);
                return false;
            }

            String otpCode = generateOtpCode();

            OtpVerification otp = new OtpVerification(
                    normalizedPhoneNumber,
                    null,
                    otpCode,
                    OtpVerification.OtpType.PASSWORD_RESET_PHONE,
                    PASSWORD_RESET_EXPIRY_MINUTES);

            otpRepository.save(otp);

            boolean sent = smsService.sendPasswordResetSms(normalizedPhoneNumber, otpCode);

            if (sent) {
                logger.info("Password reset OTP sent to phone: {}", normalizedPhoneNumber);
                return true;
            } else {
                logger.error("Failed to send password reset OTP SMS to: {}", normalizedPhoneNumber);
                return false;
            }

        } catch (Exception e) {
            logger.error("Error generating password reset OTP for phone {}: {}", phoneNumber, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Generate and send OTP for password reset via email
     * 
     * @param email The email address to send OTP to
     * @return true if OTP was generated and sent successfully
     */
    public boolean generateAndSendPasswordResetOtpEmail(String email) {
        try {
            String otpCode = generateOtpCode();

            OtpVerification otp = new OtpVerification(
                    null, // no phone for email verification
                    email,
                    otpCode,
                    OtpVerification.OtpType.PASSWORD_RESET_EMAIL,
                    PASSWORD_RESET_EXPIRY_MINUTES);

            otpRepository.save(otp);

            boolean sent = emailService.sendPasswordResetOtp(email, otpCode);

            if (sent) {
                logger.info("Password reset OTP sent to email: {}", email);
                return true;
            } else {
                logger.error("Failed to send password reset OTP email to: {}", email);
                return false;
            }

        } catch (Exception e) {
            logger.error("Error generating password reset OTP for email {}: {}", email, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Verify OTP code for phone verification
     * 
     * @param phoneNumber The phone number
     * @param otpCode     The OTP code to verify
     * @return true if OTP is valid and verified
     */
    public boolean verifyPhoneOtp(String phoneNumber, String otpCode) {
        try {
            String normalizedPhoneNumber = smsService.normalizePhoneNumber(phoneNumber);
            if (normalizedPhoneNumber == null) {
                return false;
            }

            Optional<OtpVerification> otpOpt = otpRepository.findByPhoneNumberAndCodeAndTypeAndUsedFalse(
                    normalizedPhoneNumber, otpCode, OtpVerification.OtpType.PHONE_VERIFICATION);

            if (otpOpt.isEmpty()) {
                logger.warn("Invalid or used OTP for phone verification: {}", normalizedPhoneNumber);
                return false;
            }

            OtpVerification otp = otpOpt.get();

            if (otp.isExpired()) {
                logger.warn("Expired OTP for phone verification: {}", normalizedPhoneNumber);
                return false;
            }

            // Mark as verified and used
            otp.setVerified(true);
            otp.setUsed(true);
            otpRepository.save(otp);

            // Mark all other OTPs for this phone number and type as used
            otpRepository.markAllAsUsedByPhoneNumberAndType(normalizedPhoneNumber,
                    OtpVerification.OtpType.PHONE_VERIFICATION);

            logger.info("Phone verification OTP verified successfully for: {}", normalizedPhoneNumber);
            return true;

        } catch (Exception e) {
            logger.error("Error verifying phone OTP for {}: {}", phoneNumber, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Verify OTP code for password reset via phone
     * 
     * @param phoneNumber The phone number
     * @param otpCode     The OTP code to verify
     * @return true if OTP is valid and verified
     */
    public boolean verifyPasswordResetOtpPhone(String phoneNumber, String otpCode) {
        try {
            String normalizedPhoneNumber = smsService.normalizePhoneNumber(phoneNumber);
            if (normalizedPhoneNumber == null) {
                return false;
            }

            Optional<OtpVerification> otpOpt = otpRepository.findByPhoneNumberAndCodeAndTypeAndUsedFalse(
                    normalizedPhoneNumber, otpCode, OtpVerification.OtpType.PASSWORD_RESET_PHONE);

            if (otpOpt.isEmpty()) {
                logger.warn("Invalid or used password reset OTP for phone: {}", normalizedPhoneNumber);
                return false;
            }

            OtpVerification otp = otpOpt.get();

            if (otp.isExpired()) {
                logger.warn("Expired password reset OTP for phone: {}", normalizedPhoneNumber);
                return false;
            }

            // Mark as verified and used
            otp.setVerified(true);
            otp.setUsed(true);
            otpRepository.save(otp);

            logger.info("Password reset OTP verified successfully for phone: {}", normalizedPhoneNumber);
            return true;

        } catch (Exception e) {
            logger.error("Error verifying password reset OTP for phone {}: {}", phoneNumber, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Verify OTP code for password reset via email
     * 
     * @param email   The email address
     * @param otpCode The OTP code to verify
     * @return true if OTP is valid and verified
     */
    public boolean verifyPasswordResetOtpEmail(String email, String otpCode) {
        try {
            Optional<OtpVerification> otpOpt = otpRepository.findByEmailAndCodeAndTypeAndUsedFalse(
                    email, otpCode, OtpVerification.OtpType.PASSWORD_RESET_EMAIL);

            if (otpOpt.isEmpty()) {
                logger.warn("Invalid or used password reset OTP for email: {}", email);
                return false;
            }

            OtpVerification otp = otpOpt.get();

            if (otp.isExpired()) {
                logger.warn("Expired password reset OTP for email: {}", email);
                return false;
            }

            // Mark as verified and used
            otp.setVerified(true);
            otp.setUsed(true);
            otpRepository.save(otp);

            logger.info("Password reset OTP verified successfully for email: {}", email);
            return true;

        } catch (Exception e) {
            logger.error("Error verifying password reset OTP for email {}: {}", email, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Generate a random OTP code
     * 
     * @return OTP code string
     */
    private String generateOtpCode() {
        StringBuilder otpCode = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            otpCode.append(secureRandom.nextInt(10));
        }
        return otpCode.toString();
    }

    /**
     * Clean up expired OTPs from database
     */
    @Transactional
    public void cleanupExpiredOtps() {
        try {
            otpRepository.deleteExpiredOtps(LocalDateTime.now());
            logger.info("Cleaned up expired OTPs");
        } catch (Exception e) {
            logger.error("Error cleaning up expired OTPs: {}", e.getMessage(), e);
        }
    }

    /**
     * Check if phone number has a valid unexpired OTP
     * 
     * @param phoneNumber The phone number to check
     * @param type        The OTP type
     * @return true if valid OTP exists
     */
    public boolean hasValidOtp(String phoneNumber, OtpVerification.OtpType type) {
        try {
            String normalizedPhoneNumber = smsService.normalizePhoneNumber(phoneNumber);
            if (normalizedPhoneNumber == null) {
                return false;
            }

            Optional<OtpVerification> otpOpt = otpRepository.findLatestByPhoneNumberAndType(normalizedPhoneNumber,
                    type);

            if (otpOpt.isEmpty()) {
                return false;
            }

            OtpVerification otp = otpOpt.get();
            return otp.isValid();

        } catch (Exception e) {
            logger.error("Error checking valid OTP for phone {}: {}", phoneNumber, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Check if email has a valid unexpired OTP
     * 
     * @param email The email to check
     * @param type  The OTP type
     * @return true if valid OTP exists
     */
    public boolean hasValidOtpEmail(String email, OtpVerification.OtpType type) {
        try {
            Optional<OtpVerification> otpOpt = otpRepository.findLatestByEmailAndType(email, type);

            if (otpOpt.isEmpty()) {
                return false;
            }

            OtpVerification otp = otpOpt.get();
            return otp.isValid();

        } catch (Exception e) {
            logger.error("Error checking valid OTP for email {}: {}", email, e.getMessage(), e);
            return false;
        }
    }
}
