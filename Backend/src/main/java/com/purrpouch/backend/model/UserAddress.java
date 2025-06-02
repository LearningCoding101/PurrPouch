package com.purrpouch.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_addresses")
@Getter
@Setter
@NoArgsConstructor
public class UserAddress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;
    private String label; // e.g., "Home", "Office", "Mom's house"

    // Personal information
    private String fullName;
    private String phoneNumber;

    // Address components
    private String province; // Province/City
    private String district;
    private String ward;
    private String streetAddress; // Street name, Block, Number
    private String additionalInfo;

    // Coordinates for map integration
    private Double latitude;
    private Double longitude;

    @Enumerated(EnumType.STRING)
    private AddressType type = AddressType.HOME;

    private boolean isDefault = false;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum AddressType {
        HOME, OFFICE, OTHER
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    } // Convert to Address for order processing

    public Address toAddress() {
        Address address = new Address();
        address.setStreetAddress(this.streetAddress);
        address.setCity(this.province); // Use province as city
        address.setDistrict(this.district);
        address.setWard(this.ward);
        address.setAdditionalInfo(this.additionalInfo);
        return address;
    }
}
