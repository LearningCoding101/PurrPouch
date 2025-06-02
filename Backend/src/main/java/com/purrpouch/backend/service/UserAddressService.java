package com.purrpouch.backend.service;

import com.purrpouch.backend.model.User;
import com.purrpouch.backend.model.UserAddress;
import com.purrpouch.backend.repository.UserAddressRepository;
import com.purrpouch.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserAddressService {

    @Autowired
    private UserAddressRepository userAddressRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get all addresses for a user
     */
    public List<UserAddress> getUserAddresses(Long userId) {
        return userAddressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId);
    }

    /**
     * Get user's default address
     */
    public Optional<UserAddress> getDefaultAddress(Long userId) {
        return userAddressRepository.findByUserIdAndIsDefaultTrue(userId);
    }

    /**
     * Create a new address for a user
     */
    @Transactional
    public UserAddress createAddress(Long userId, UserAddress addressData) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // If this is marked as default, unset other default addresses
        if (addressData.isDefault()) {
            unsetOtherDefaultAddresses(userId);
        } else if (getUserAddresses(userId).isEmpty()) {
            // If this is the first address, make it default
            addressData.setDefault(true);
        }

        addressData.setUser(user);
        return userAddressRepository.save(addressData);
    }

    /**
     * Update an existing address
     */
    @Transactional
    public UserAddress updateAddress(Long userId, Long addressId, UserAddress addressData) {
        UserAddress existingAddress = userAddressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        // If this is being set as default, unset other default addresses
        if (addressData.isDefault() && !existingAddress.isDefault()) {
            unsetOtherDefaultAddresses(userId);
        }
        existingAddress.setLabel(addressData.getLabel());
        existingAddress.setFullName(addressData.getFullName());
        existingAddress.setPhoneNumber(addressData.getPhoneNumber());
        existingAddress.setStreetAddress(addressData.getStreetAddress());
        existingAddress.setProvince(addressData.getProvince());
        existingAddress.setDistrict(addressData.getDistrict());
        existingAddress.setWard(addressData.getWard());
        existingAddress.setAdditionalInfo(addressData.getAdditionalInfo());
        existingAddress.setLatitude(addressData.getLatitude());
        existingAddress.setLongitude(addressData.getLongitude());
        existingAddress.setType(addressData.getType());
        existingAddress.setDefault(addressData.isDefault());

        return userAddressRepository.save(existingAddress);
    }

    /**
     * Delete an address
     */
    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        UserAddress address = userAddressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        boolean wasDefault = address.isDefault();
        userAddressRepository.delete(address);

        // If the deleted address was default, set the first remaining address as
        // default
        if (wasDefault) {
            List<UserAddress> remainingAddresses = getUserAddresses(userId);
            if (!remainingAddresses.isEmpty()) {
                UserAddress newDefault = remainingAddresses.get(0);
                newDefault.setDefault(true);
                userAddressRepository.save(newDefault);
            }
        }
    }

    /**
     * Set an address as default
     */
    @Transactional
    public UserAddress setDefaultAddress(Long userId, Long addressId) {
        UserAddress address = userAddressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        // Unset other default addresses
        unsetOtherDefaultAddresses(userId);

        // Set this address as default
        address.setDefault(true);
        return userAddressRepository.save(address);
    }

    /**
     * Get a specific address by ID
     */
    public UserAddress getAddressById(Long userId, Long addressId) {
        if (userId == null || addressId == null) {
            throw new RuntimeException("Both userId and addressId must be provided");
        }

        return userAddressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(
                        () -> new RuntimeException("Address not found: ID=" + addressId + " for user ID=" + userId));
    }

    /**
     * Helper method to unset all default addresses for a user
     */
    private void unsetOtherDefaultAddresses(Long userId) {
        List<UserAddress> addresses = userAddressRepository.findByUserId(userId);
        addresses.forEach(addr -> {
            if (addr.isDefault()) {
                addr.setDefault(false);
                userAddressRepository.save(addr);
            }
        });
    }
}
