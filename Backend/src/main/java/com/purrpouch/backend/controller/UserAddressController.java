package com.purrpouch.backend.controller;

import com.purrpouch.backend.model.UserAddress;
import com.purrpouch.backend.service.UserAddressService;
import com.purrpouch.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/user-addresses")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserAddressController {

    @Autowired
    private UserAddressService userAddressService;

    @Autowired
    private AuthService authService;

    /**
     * Get all addresses for the current user
     */
    @GetMapping
    public ResponseEntity<?> getUserAddresses() {
        Long userId = authService.getCurrentUser().getId();
        List<UserAddress> addresses = userAddressService.getUserAddresses(userId);
        return ResponseEntity.ok(addresses);
    }

    /**
     * Get addresses for a specific user (admin endpoint)
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getAddressesForUser(@PathVariable Long userId) {
        List<UserAddress> addresses = userAddressService.getUserAddresses(userId);
        return ResponseEntity.ok(addresses);
    }

    /**
     * Get default address for current user
     */
    @GetMapping("/default")
    public ResponseEntity<?> getDefaultAddress() {
        Long userId = authService.getCurrentUser().getId();
        Optional<UserAddress> defaultAddress = userAddressService.getDefaultAddress(userId);
        if (defaultAddress.isPresent()) {
            return ResponseEntity.ok(defaultAddress.get());
        } else {
            return ResponseEntity.noContent().build();
        }
    }

    /**
     * Create a new address for current user
     */
    @PostMapping
    public ResponseEntity<?> createAddress(@RequestBody CreateAddressRequest request) {
        Long userId = authService.getCurrentUser().getId();

        UserAddress addressData = new UserAddress();
        addressData.setLabel(request.getLabel());
        addressData.setFullName(request.getFullName());
        addressData.setPhoneNumber(request.getPhoneNumber());
        addressData.setStreetAddress(request.getStreetAddress());
        addressData.setProvince(request.getProvince());
        addressData.setDistrict(request.getDistrict());
        addressData.setWard(request.getWard());
        addressData.setAdditionalInfo(request.getAdditionalInfo());
        addressData.setLatitude(request.getLatitude());
        addressData.setLongitude(request.getLongitude());
        addressData.setType(request.getType() != null ? request.getType() : UserAddress.AddressType.HOME);
        addressData.setDefault(request.isDefault());

        UserAddress savedAddress = userAddressService.createAddress(userId, addressData);
        return ResponseEntity.ok(savedAddress);
    }

    /**
     * Update an existing address
     */
    @PutMapping("/{addressId}")
    public ResponseEntity<?> updateAddress(@PathVariable Long addressId, @RequestBody CreateAddressRequest request) {
        Long userId = authService.getCurrentUser().getId();

        UserAddress addressData = new UserAddress();
        addressData.setLabel(request.getLabel());
        addressData.setFullName(request.getFullName());
        addressData.setPhoneNumber(request.getPhoneNumber());
        addressData.setStreetAddress(request.getStreetAddress());
        addressData.setProvince(request.getProvince());
        addressData.setDistrict(request.getDistrict());
        addressData.setWard(request.getWard());
        addressData.setAdditionalInfo(request.getAdditionalInfo());
        addressData.setLatitude(request.getLatitude());
        addressData.setLongitude(request.getLongitude());
        addressData.setType(request.getType() != null ? request.getType() : UserAddress.AddressType.HOME);
        addressData.setDefault(request.isDefault());
        addressData.setDefault(request.isDefault());

        UserAddress updatedAddress = userAddressService.updateAddress(userId, addressId, addressData);
        return ResponseEntity.ok(updatedAddress);
    }

    /**
     * Delete an address
     */
    @DeleteMapping("/{addressId}")
    public ResponseEntity<?> deleteAddress(@PathVariable Long addressId) {
        Long userId = authService.getCurrentUser().getId();
        userAddressService.deleteAddress(userId, addressId);
        return ResponseEntity.ok().build();
    }

    /**
     * Set an address as default
     */
    @PutMapping("/{addressId}/default")
    public ResponseEntity<?> setDefaultAddress(@PathVariable Long addressId) {
        Long userId = authService.getCurrentUser().getId();
        UserAddress defaultAddress = userAddressService.setDefaultAddress(userId, addressId);
        return ResponseEntity.ok(defaultAddress);
    }

    /**
     * Get specific address by ID
     */
    @GetMapping("/{addressId}")
    public ResponseEntity<?> getAddress(@PathVariable Long addressId) {
        Long userId = authService.getCurrentUser().getId();
        UserAddress address = userAddressService.getAddressById(userId, addressId);
        return ResponseEntity.ok(address);
    } // Request/Response classes

    public static class CreateAddressRequest {
        private String label;
        private String fullName;
        private String phoneNumber;
        private String streetAddress;
        private String province;
        private String district;
        private String ward;
        private String additionalInfo;
        private Double latitude;
        private Double longitude;
        private UserAddress.AddressType type;
        private boolean isDefault;

        // Getters and setters
        public String getLabel() {
            return label;
        }

        public void setLabel(String label) {
            this.label = label;
        }

        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }

        public String getPhoneNumber() {
            return phoneNumber;
        }

        public void setPhoneNumber(String phoneNumber) {
            this.phoneNumber = phoneNumber;
        }

        public String getStreetAddress() {
            return streetAddress;
        }

        public void setStreetAddress(String streetAddress) {
            this.streetAddress = streetAddress;
        }

        public String getProvince() {
            return province;
        }

        public void setProvince(String province) {
            this.province = province;
        }

        public String getDistrict() {
            return district;
        }

        public void setDistrict(String district) {
            this.district = district;
        }

        public String getWard() {
            return ward;
        }

        public void setWard(String ward) {
            this.ward = ward;
        }

        public String getAdditionalInfo() {
            return additionalInfo;
        }

        public void setAdditionalInfo(String additionalInfo) {
            this.additionalInfo = additionalInfo;
        }

        public Double getLatitude() {
            return latitude;
        }

        public void setLatitude(Double latitude) {
            this.latitude = latitude;
        }

        public Double getLongitude() {
            return longitude;
        }

        public void setLongitude(Double longitude) {
            this.longitude = longitude;
        }

        public UserAddress.AddressType getType() {
            return type;
        }

        public void setType(UserAddress.AddressType type) {
            this.type = type;
        }

        public boolean isDefault() {
            return isDefault;
        }

        public void setDefault(boolean isDefault) {
            this.isDefault = isDefault;
        }
    }
}
