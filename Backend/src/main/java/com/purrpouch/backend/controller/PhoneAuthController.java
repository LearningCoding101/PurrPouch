package com.purrpouch.backend.controller;

import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.purrpouch.backend.model.User;
import com.purrpouch.backend.payload.request.auth.PhoneAuthRequest;
import com.purrpouch.backend.payload.request.auth.PhoneVerificationRequest;
import com.purrpouch.backend.payload.request.auth.ResetPasswordRequest;
import com.purrpouch.backend.payload.response.MessageResponse;
import com.purrpouch.backend.payload.response.auth.JwtResponse;
import com.purrpouch.backend.service.AuthService;
import com.purrpouch.backend.service.FirebasePhoneAuthService;
import com.purrpouch.backend.service.OtpService;
import com.purrpouch.backend.util.JwtUtils;

import jakarta.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth/phone")
public class PhoneAuthController {

    private static final Logger logger = LoggerFactory.getLogger(PhoneAuthController.class);

    @Autowired
    private AuthService authService;

    @Autowired
    private OtpService otpService;

    @Autowired
    private FirebasePhoneAuthService firebasePhoneAuthService;

    @Autowired
    private JwtUtils jwtUtils;

    /**
     * Send OTP verification code to phone number
     */
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendPhoneVerificationOtp(@Valid @RequestBody PhoneVerificationRequest request) {
        try {
            boolean sent = otpService.generateAndSendPhoneVerificationOtp(request.getPhoneNumber());

            if (sent) {
                return ResponseEntity.ok(new MessageResponse("Verification code sent successfully"));
            } else {
                return ResponseEntity.badRequest().body(new MessageResponse("Failed to send verification code"));
            }
        } catch (Exception e) {
            logger.error("Error sending OTP: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    /**
     * Verify phone number with OTP code
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyPhoneOtp(@Valid @RequestBody PhoneAuthRequest request) {
        try {
            boolean verified = otpService.verifyPhoneOtp(
                    request.getPhoneNumber(),
                    request.getVerificationCode());

            if (verified) {
                return ResponseEntity.ok(new MessageResponse("Phone number verified successfully"));
            } else {
                return ResponseEntity.badRequest().body(new MessageResponse("Invalid or expired verification code"));
            }
        } catch (Exception e) {
            logger.error("Error verifying OTP: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    /**
     * Authenticate with Firebase phone authentication token
     */
    @PostMapping("/firebase-auth")
    public ResponseEntity<?> authenticateWithFirebasePhone(@RequestBody Map<String, String> request) {
        try {
            String idToken = request.get("idToken");

            if (idToken == null || idToken.isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("No ID token provided"));
            } // Verify the Firebase ID token
            FirebaseToken decodedToken = firebasePhoneAuthService.verifyPhoneAuthToken(idToken);
            String uid = decodedToken.getUid();
            String phoneNumber = firebasePhoneAuthService.getPhoneNumberFromToken(decodedToken);

            if (phoneNumber == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("No phone number in token"));
            }

            // Register or update user
            User user = firebasePhoneAuthService.registerOrUpdatePhoneUser(uid, phoneNumber);

            // Create authentication with authorities
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    user, null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));

            // Set authentication in context
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Generate JWT
            String jwt = jwtUtils.generateJwtToken(authentication);

            return ResponseEntity.ok(new JwtResponse(
                    jwt,
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getRole().name()));

        } catch (FirebaseAuthException e) {
            logger.error("Firebase authentication error: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Firebase authentication error: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Error during phone authentication: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    /**
     * Send password reset OTP to phone number
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> sendPasswordResetOtp(@RequestBody Map<String, String> request) {
        String phoneNumber = request.get("phoneNumber");

        if (phoneNumber == null || phoneNumber.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Phone number is required"));
        }

        // Check if user exists with this phone number
        if (!authService.existsByPhoneNumber(phoneNumber)) {
            return ResponseEntity.badRequest().body(new MessageResponse("No account found with this phone number"));
        }

        boolean sent = otpService.generateAndSendPasswordResetOtpPhone(phoneNumber);

        if (sent) {
            return ResponseEntity.ok(new MessageResponse("Password reset code sent successfully"));
        } else {
            return ResponseEntity.badRequest().body(new MessageResponse("Failed to send password reset code"));
        }
    }

    /**
     * Reset password with OTP verification
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        // Verify OTP first
        boolean verified = otpService.verifyPasswordResetOtpPhone(
                request.getPhoneNumber(),
                request.getVerificationCode());

        if (!verified) {
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid or expired verification code"));
        }

        try {
            authService.resetPasswordByPhoneNumber(request.getPhoneNumber(), request.getNewPassword());
            return ResponseEntity.ok(new MessageResponse("Password reset successfully"));
        } catch (Exception e) {
            logger.error("Error resetting password: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    /**
     * Update user profile after phone authentication
     */
    @PostMapping("/update-profile")
    public ResponseEntity<?> updateUserProfile(@RequestBody Map<String, String> request) {
        try {
            User currentUser = authService.getCurrentUser();
            String email = request.get("email");
            String username = request.get("username");

            // Update the user profile
            firebasePhoneAuthService.updateUserProfileAfterPhoneAuth(currentUser, email, username);

            return ResponseEntity.ok(new MessageResponse("Profile updated successfully"));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Error updating profile: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    /**
     * Check if phone number is available
     */
    @GetMapping("/check-phone")
    public ResponseEntity<?> checkPhoneAvailability(@RequestParam String phoneNumber) {
        boolean exists = authService.existsByPhoneNumber(phoneNumber);

        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);

        return ResponseEntity.ok(response);
    }
}
