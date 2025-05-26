package com.purrpouch.backend.model;

import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
public class Address {
    private String streetAddress;
    private String city;
    private String district;
    private String postalCode;
    private String additionalInfo;
}
