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

        try {
            String idToken = getIdTokenFromRequest(request);

            if (StringUtils.hasText(idToken)) {
                FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
                String uid = decodedToken.getUid();

                Optional<User> userOptional = userRepository.findByFirebaseUid(uid);

                if (userOptional.isPresent()) {
                    User user = userOptional.get();

                    // Create authentication token with user authorities
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            user,
                            decodedToken,
                            Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } else {
                    // Create a new user if not exists
                    User newUser = new User();
                    newUser.setFirebaseUid(uid);
                    newUser.setEmail(decodedToken.getEmail());
                    newUser.setUsername(decodedToken.getName() != null ? decodedToken.getName()
                            : decodedToken.getEmail().split("@")[0]);
                    newUser.setPhotoUrl(decodedToken.getPicture());
                    newUser.setRole(User.Role.USER);
                    newUser.setEnabled(true);

                    newUser = userRepository.save(newUser);

                    // Create authentication token for new user
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            newUser,
                            decodedToken,
                            Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + newUser.getRole().name())));

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } catch (FirebaseAuthException e) {
            logger.error("Firebase Authentication failed: {}", e.getMessage());
        } catch (Exception e) {
            logger.error("Unable to authenticate user with Firebase: {}", e.getMessage());
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
}