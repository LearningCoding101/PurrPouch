package com.purrpouch.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.firebase.auth.FirebaseAuthException;
import com.purrpouch.backend.model.User;
import com.purrpouch.backend.payload.request.RoleUpdateRequest;
import com.purrpouch.backend.payload.request.auth.LoginRequest;
import com.purrpouch.backend.payload.request.auth.SignupRequest;
import com.purrpouch.backend.payload.response.MessageResponse;
import com.purrpouch.backend.payload.response.auth.JwtResponse;
import com.purrpouch.backend.service.AuthService;
import com.purrpouch.backend.util.JwtUtils;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtils jwtUtils;

    @GetMapping("/user-info")
    public ResponseEntity<?> getUserInfo() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(user);
    }

    @GetMapping("/debug-token")
    public ResponseEntity<?> debugToken(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        Map<String, Object> response = new HashMap<>();

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.put("error", "No valid Authorization header found");
            return ResponseEntity.badRequest().body(response);
        }

        String token = authHeader.substring(7);
        response.put("token_received", token.substring(0, Math.min(10, token.length())) + "...");

        try {
            boolean isValid = jwtUtils.validateJwtToken(token);
            response.put("is_valid", isValid);

            if (isValid) {
                try {
                    String email = jwtUtils.getEmailFromJwtToken(token);
                    response.put("email", email);
                } catch (Exception e) {
                    response.put("email_extraction_error", e.getMessage());
                }

                Authentication currentAuth = SecurityContextHolder.getContext().getAuthentication();
                response.put("current_auth", currentAuth != null ? currentAuth.getName() : "none");
            }
        } catch (Exception e) {
            response.put("validation_error", e.getMessage());
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authService.authenticate(loginRequest.getEmail(), loginRequest.getPassword());

        String jwt = jwtUtils.generateJwtToken(authentication);
        User user = (User) authentication.getPrincipal();

        return ResponseEntity.ok(new JwtResponse(
                jwt,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name()));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signupRequest) {
        try {
            User user = authService.registerUser(
                    signupRequest.getUsername(),
                    signupRequest.getEmail(),
                    signupRequest.getPassword());

            return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        } catch (FirebaseAuthException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Firebase error: " + e.getMessage()));
        }
    }

    @PostMapping("/update-role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserRole(@RequestBody RoleUpdateRequest roleUpdateRequest) {
        try {
            User user = authService.updateUserRole(roleUpdateRequest.getUserId(), roleUpdateRequest.getRole());
            return ResponseEntity.ok(new MessageResponse("User role updated successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/google-auth")
    public ResponseEntity<?> authenticateWithGoogle(@RequestBody Map<String, String> request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Get the idToken directly from the request body
            String idToken = request.get("idToken");

            // If not in request body, try to get from Authorization header
            if ((idToken == null || idToken.isEmpty()) && authHeader != null && authHeader.startsWith("Bearer ")) {
                idToken = authHeader.substring(7);
            }

            if (idToken == null || idToken.isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("No ID token provided"));
            }

            // Verify the Firebase ID token directly
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String uid = decodedToken.getUid();
            String email = decodedToken.getEmail();
            String name = decodedToken.getName();
            String picture = decodedToken.getPicture();

            // Register or update the user in our system
            User user = authService.registerGoogleUser(uid, email, name, picture);

            // Create authentication with authorities - use the user object directly as
            // principal
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    user, null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));

            // Set authentication in context
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Generate JWT for our system
            String jwt = jwtUtils.generateJwtToken(authentication);

            return ResponseEntity.ok(new JwtResponse(
                    jwt,
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getRole().name()));
        } catch (FirebaseAuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Invalid ID token: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error during authentication: " + e.getMessage()));
        }
    }
}