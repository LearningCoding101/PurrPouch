package com.purrpouch.backend.config;

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI purrPouchOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Purr Pouch API")
                        .description("Backend API for Purr Pouch Application")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("Purr Pouch")
                                .url("https://www.purrpouch.com")
                                .email("info@purrpouch.com"))
                        .license(new License()
                                .name("Apache License, Version 2.0")
                                .url("http://www.apache.org/licenses/LICENSE-2.0")))
                .externalDocs(new ExternalDocumentation()
                        .description("Purr Pouch Documentation")
                        .url("https://www.purrpouch.com/docs"))
                .components(new Components()
                        .addSecuritySchemes("bearer-jwt", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .in(SecurityScheme.In.HEADER)
                                .name("Authorization")))
                .addSecurityItem(new SecurityRequirement().addList("bearer-jwt"));
    }
}
