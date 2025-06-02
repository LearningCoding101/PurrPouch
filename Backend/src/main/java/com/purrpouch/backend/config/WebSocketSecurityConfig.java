package com.purrpouch.backend.config;

import com.purrpouch.backend.util.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;

@Configuration
public class WebSocketSecurityConfig implements ChannelInterceptor {

    @Autowired
    private JwtUtils jwtUtils;

    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(this);
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authToken = null;

            // Try to get token from Authorization header
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
                authToken = authHeader.substring(7);
            }

            // If no token in header, try to get from query parameters
            if (authToken == null) {
                // Get token from query parameter if present
                String tokenParam = accessor.getFirstNativeHeader("token");
                if (StringUtils.hasText(tokenParam)) {
                    authToken = tokenParam;
                }
            }
            if (authToken != null && jwtUtils.validateJwtToken(authToken)) {
                String username = jwtUtils.getEmailFromJwtToken(authToken);
                Authentication authentication = new UsernamePasswordAuthenticationToken(
                        username, null, null);
                SecurityContextHolder.getContext().setAuthentication(authentication);
                accessor.setUser(authentication);
            }
        }

        return message;
    }
}
