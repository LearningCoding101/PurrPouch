package com.purrpouch.backend.security.jwt;

import com.purrpouch.backend.model.User;
import com.purrpouch.backend.repository.UserRepository;
import com.purrpouch.backend.util.JwtUtils;

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
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = parseJwt(request);
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                String email = jwtUtils.getEmailFromJwtToken(jwt);
                logger.debug("JWT validated for email: {}", email);

                // Load our custom User entity instead of UserDetails
                Optional<User> userOptional = userRepository.findByEmail(email);
                if (userOptional.isPresent()) {
                    User user = userOptional.get();

                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            user, // Use our custom User object as principal
                            null,
                            Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    logger.debug("JWT authentication successful for user: {}, Principal type: {}",
                            user.getEmail(), user.getClass().getName());
                } else {
                    logger.warn("User not found for email: {}", email);
                }
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }

        return null;
    }
}