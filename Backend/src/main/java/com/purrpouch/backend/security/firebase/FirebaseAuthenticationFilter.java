package com.purrpouch.backend.security.firebase;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.purrpouch.backend.model.User;
import com.purrpouch.backend.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

@Component
public class FirebaseAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseAuthenticationFilter.class);

    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Skip if authentication is already set by JWT filter
        if (SecurityContextHolder.getContext().getAuthentication() != null
                && SecurityContextHolder.getContext().getAuthentication().isAuthenticated()
                && !"anonymousUser".equals(SecurityContextHolder.getContext().getAuthentication().getPrincipal())) {
            logger.debug("Authentication already set, skipping Firebase filter");
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String idToken = getIdTokenFromRequest(request);

            if (StringUtils.hasText(idToken)) {
                // Check if this looks like a Firebase ID token vs JWT token
                if (isFirebaseToken(idToken)) {
                    logger.debug("Found Firebase token in request, attempting to verify...");

                    FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
                    String uid = decodedToken.getUid();
                    String email = decodedToken.getEmail();

                    logger.debug("Firebase token verified for UID: {}, Email: {}", uid, email);

                    Optional<User> userOptional = userRepository.findByFirebaseUid(uid);

                    if (userOptional.isPresent()) {
                        User user = userOptional.get();
                        logger.debug("Found existing user in database: {}", user.getUsername());

                        // Update user information if needed
                        boolean needsUpdate = false;

                        if (decodedToken.getPicture() != null
                                && !decodedToken.getPicture().equals(user.getPhotoUrl())) {
                            user.setPhotoUrl(decodedToken.getPicture());
                            needsUpdate = true;
                        }

                        if (decodedToken.getName() != null && !decodedToken.getName().equals(user.getUsername())) {
                            user.setUsername(decodedToken.getName());
                            needsUpdate = true;
                        }

                        if (needsUpdate) {
                            user = userRepository.save(user);
                            logger.debug("Updated user information in database");
                        }

                        // Create authentication token with user authorities
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                user,
                                null, // Set credentials to null for security
                                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));

                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        logger.debug("User authenticated successfully: {}, Principal type: {}", user.getEmail(),
                                user.getClass().getName());
                    } else {
                        // Create a new user if not exists
                        logger.debug("User not found in database, creating new user for UID: {}", uid);

                        User newUser = new User();
                        newUser.setFirebaseUid(uid);
                        newUser.setEmail(decodedToken.getEmail());
                        newUser.setUsername(decodedToken.getName() != null ? decodedToken.getName()
                                : decodedToken.getEmail().split("@")[0]);
                        newUser.setPhotoUrl(decodedToken.getPicture());
                        newUser.setRole(User.Role.USER);
                        newUser.setEnabled(true);

                        newUser = userRepository.save(newUser);
                        logger.debug("Created new user in database: {}", newUser.getUsername());

                        // Create authentication token for new user
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                newUser,
                                null, // Set credentials to null for security
                                Collections
                                        .singletonList(new SimpleGrantedAuthority("ROLE_" + newUser.getRole().name())));

                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        logger.debug("New user authenticated successfully: {}", newUser.getEmail());
                    }
                }
            }
        } catch (FirebaseAuthException e) {
            logger.error("Firebase Authentication failed: {}", e.getMessage());
        } catch (Exception e) {
            logger.error("Unable to authenticate user with Firebase: {}", e.getMessage(), e);
        }

        filterChain.doFilter(request, response);
    }

    private String getIdTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");

        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        return null;
    }

    /**
     * Check if the token is a Firebase ID token vs a JWT token
     * Firebase tokens are typically longer and have different structure
     */
    private boolean isFirebaseToken(String token) {
        try {
            // Firebase tokens are typically much longer than our JWT tokens
            // and don't decode properly with our JWT parser
            if (token.length() < 100) {
                return false; // Our JWT tokens are shorter
            }

            // Try to decode with Firebase first - if it works, it's a Firebase token
            FirebaseAuth.getInstance().verifyIdToken(token);
            return true;
        } catch (Exception e) {
            // If Firebase verification fails, it's likely our JWT token
            logger.debug("Token is not a valid Firebase token, might be JWT: {}", e.getMessage());
            return false;
        }
    }
}