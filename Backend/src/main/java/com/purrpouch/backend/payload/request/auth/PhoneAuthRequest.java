package com.purrpouch.backend.payload.request.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PhoneAuthRequest {
    @NotBlank
    private String phoneNumber;

    @NotBlank
    private String verificationCode;
}
