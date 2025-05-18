package com.purrpouch.backend.controller;

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
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

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
                user.getRole().name()
        ));
    }
    
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signupRequest) {
        try {
            User user = authService.registerUser(
                    signupRequest.getUsername(),
                    signupRequest.getEmail(),
                    signupRequest.getPassword()
            );
            
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
    public ResponseEntity<?> authenticateWithGoogle(@RequestHeader("Authorization") String idToken) {
        // This endpoint is just a placeholder as authentication is handled by FirebaseAuthenticationFilter
        // Just return current user info
        return getUserInfo();
    }
}