package com.purrpouch.backend.security;

import com.purrpouch.backend.security.firebase.FirebaseAuthenticationFilter;
import com.purrpouch.backend.security.jwt.AuthEntryPointJwt;
import com.purrpouch.backend.security.jwt.JwtAuthenticationFilter;
import com.purrpouch.backend.security.services.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class WebSecurityConfig {

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;

    @Autowired
    private FirebaseAuthenticationFilter firebaseAuthenticationFilter;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();

        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());

        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        // General configuration for API endpoints
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:3000")); // Specify
                                                                                                          // exact
                                                                                                          // origins
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true); // Now we can use credentials with specific origins

        // Configuration for webhook endpoints - no credentials needed
        CorsConfiguration webhookConfiguration = new CorsConfiguration();
        webhookConfiguration.setAllowedOrigins(Arrays.asList("*"));
        webhookConfiguration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        webhookConfiguration.setAllowedHeaders(Arrays.asList("*"));
        webhookConfiguration.setAllowCredentials(false); // No credentials for webhooks

        // Special configuration for WebSocket endpoints
        CorsConfiguration wsConfiguration = new CorsConfiguration();
        wsConfiguration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:3000"));
        wsConfiguration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        wsConfiguration.setAllowedHeaders(Arrays.asList("*"));
        wsConfiguration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Register WebSocket config first (more specific)
        source.registerCorsConfiguration("/ws/**", wsConfiguration);
        source.registerCorsConfiguration("/api/webhook/**", webhookConfiguration);

        // Register general config last (less specific)
        source.registerCorsConfiguration("/api/**", configuration);

        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .authorizeHttpRequests(auth -> auth
                        // Webhook endpoints - completely open, no authentication required
                        .requestMatchers("/api/webhook/**").permitAll()
                        .requestMatchers("/ws/**").permitAll()
                        // Authentication endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        // Test endpoints
                        .requestMatchers("/api/test/**").permitAll()
                        // WebSocket endpoints - allow for initial connection
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers("/api/admin/create-default-admin").permitAll()
                        // Swagger UI endpoints
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        // All other requests require authentication
                        .anyRequest().authenticated())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()));

        http.authenticationProvider(authenticationProvider());

        // Add JWT filter first - it handles our app's JWT tokens
        http.addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        // Add Firebase authentication filter after JWT filter - it handles direct
        // Firebase ID tokens
        http.addFilterAfter(firebaseAuthenticationFilter, JwtAuthenticationFilter.class);

        return http.build();
    }
}