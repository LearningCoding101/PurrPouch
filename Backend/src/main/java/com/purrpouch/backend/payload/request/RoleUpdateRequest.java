package com.purrpouch.backend.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RoleUpdateRequest {
    private Long userId;
    private String role;
}