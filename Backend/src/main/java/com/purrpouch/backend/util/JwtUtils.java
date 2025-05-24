package com.purrpouch.backend.util;

import com.purrpouch.backend.model.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${jwt.secret:defaultsecretkey123456789012345678901234567890}")
    private String jwtSecret;

    @Value("${jwt.expirationMs:86400000}")
    private int jwtExpirationMs;

    public String generateJwtToken(Authentication authentication) {

        User userPrincipal = (User) authentication.getPrincipal();

        return generateTokenFromEmail(userPrincipal.getEmail());

    }

    public String generateTokenFromEmail(String email) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);
        logger.debug("Generating token for email: {}, expires at: {}", email, expiryDate);

        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Key key() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String getEmailFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key())
                    .build()
                    .parseClaimsJws(authToken)
                    .getBody();

            // Log token information
            Date issuedAt = claims.getIssuedAt();
            Date expiration = claims.getExpiration();
            Date now = new Date();

            logger.debug("JWT Token validation - Subject: {}, IssuedAt: {}, Expiration: {}, Current time: {}",
                    claims.getSubject(), issuedAt, expiration, now);

            if (expiration != null && expiration.before(now)) {
                logger.warn("JWT Token is expired! Expiration: {}, Current time: {}", expiration, now);
                return false;
            }

            return true;
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error during JWT validation: {}", e.getMessage(), e);
        }

        return false;
    }
}