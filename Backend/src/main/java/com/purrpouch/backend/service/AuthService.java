package com.purrpouch.backend.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.purrpouch.backend.model.User;
import com.purrpouch.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Log authentication details for debugging
        if (authentication != null) {
            logger.debug("Authentication found - Name: {}, Principal type: {}, IsAuthenticated: {}",
                    authentication.getName(),
                    authentication.getPrincipal() != null ? authentication.getPrincipal().getClass().getName() : "null",
                    authentication.isAuthenticated());
        } else {
            logger.debug("No authentication found in SecurityContext");
        }

        // Check if authentication exists and is authenticated
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("No authenticated user found");
        }

        Object principal = authentication.getPrincipal();

        // Check for anonymousUser in all possible forms
        if (principal instanceof String && "anonymousUser".equals(principal)) {
            throw new IllegalStateException("No authenticated user found - anonymousUser detected");
        }

        if (principal instanceof User) {
            logger.debug("Returning User principal: {}", ((User) principal).getEmail());
            return (User) principal;
        } else if (principal instanceof String) {
            // Handle the case when principal is a String (email)
            String email = (String) principal;
            logger.debug("Principal is String (email): {}, looking up user", email);
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalStateException("User not found with email: " + email));
        } else if (principal instanceof org.springframework.security.core.userdetails.User) {
            // Handle Spring Security User - this shouldn't happen anymore with our updated
            // filters
            String email = ((org.springframework.security.core.userdetails.User) principal).getUsername();
            logger.debug("Principal is Spring Security UserDetails: {}, looking up user", email);
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalStateException("User not found with email: " + email));
        }

        throw new IllegalStateException(
                "Unknown principal type: " + (principal != null ? principal.getClass().getName() : "null"));
    }

    public Authentication authenticate(String email, String password) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        return authentication;
    }

    public User registerUser(String username, String email, String password) throws FirebaseAuthException {
        // Check if username is already in use
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Error: Username is already taken!");
        }

        // Check if email is already in use
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Error: Email is already in use!");
        }

        // Create Firebase user
        UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                .setEmail(email)
                .setPassword(password)
                .setDisplayName(username)
                .setEmailVerified(false);

        UserRecord userRecord = FirebaseAuth.getInstance().createUser(request);

        // Create local user with hashed password
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password)); // Hash the password
        user.setFirebaseUid(userRecord.getUid());
        user.setRole(User.Role.USER);
        user.setEnabled(true);

        return userRepository.save(user);
    }

    public User updateUserRole(Long userId, String role) {
        Optional<User> userOptional = userRepository.findById(userId);

        if (userOptional.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }

        User user = userOptional.get();

        switch (role.toLowerCase()) {
            case "admin":
                user.setRole(User.Role.ADMIN);
                break;
            case "staff":
                user.setRole(User.Role.STAFF);
                break;
            default:
                user.setRole(User.Role.USER);
                break;
        }

        return userRepository.save(user);
    }

    public User registerGoogleUser(String firebaseUid, String email, String displayName, String photoUrl) {
        Optional<User> userOptional = userRepository.findByFirebaseUid(firebaseUid);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            // Update any changed information
            user.setEmail(email);
            user.setUsername(displayName != null ? displayName : email.split("@")[0]);
            user.setPhotoUrl(photoUrl);
            return userRepository.save(user);
        }

        // Create new user
        User newUser = new User();
        newUser.setFirebaseUid(firebaseUid);
        newUser.setEmail(email);
        newUser.setUsername(displayName != null ? displayName : email.split("@")[0]);
        newUser.setPhotoUrl(photoUrl);
        newUser.setRole(User.Role.USER);
        newUser.setEnabled(true);

        return userRepository.save(newUser);
    }
}