package com.purrpouch.backend.service;

import com.purrpouch.backend.model.CatProfile;
import com.purrpouch.backend.model.User;
import com.purrpouch.backend.repository.CatProfileRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class CatProfileService {

    @Autowired
    private CatProfileRepository catProfileRepository;

    @Autowired
    private AuthService authService;

    /**
     * Get all active cat profiles for the current user
     */
    public List<CatProfile> getCurrentUserCatProfiles() {
        User currentUser = authService.getCurrentUser();
        return catProfileRepository.findByUser(currentUser);
    }

    /**
     * Get a specific cat profile by ID for the current user
     */
    public CatProfile getCatProfileById(Long catProfileId) {
        User currentUser = authService.getCurrentUser();
        return catProfileRepository.findByIdAndUser(catProfileId, currentUser)
                .orElseThrow(
                        () -> new EntityNotFoundException("Cat profile not found or doesn't belong to current user"));
    }

    /**
     * Create a new cat profile for the current user
     */
    public CatProfile createCatProfile(CatProfile catProfile) {
        User currentUser = authService.getCurrentUser();

        // Check if the user already has a cat with the same name
        if (catProfileRepository.existsByNameIgnoreCaseAndOwnerAndDeletedAtIsNull(
                catProfile.getName(), currentUser)) {
            throw new IllegalArgumentException("You already have a cat with this name");
        }

        catProfile.setOwner(currentUser);
        catProfile.setCreatedAt(LocalDateTime.now());

        return catProfileRepository.save(catProfile);
    }

    /**
     * Update an existing cat profile
     */
    public CatProfile updateCatProfile(Long catProfileId, CatProfile updatedProfile) {
        CatProfile existingProfile = getCatProfileById(catProfileId);

        // Check if name is being changed and if the new name is already in use
        if (!existingProfile.getName().equalsIgnoreCase(updatedProfile.getName())) {
            if (catProfileRepository.existsByNameIgnoreCaseAndOwnerAndDeletedAtIsNull(
                    updatedProfile.getName(), existingProfile.getOwner())) {
                throw new IllegalArgumentException("You already have a cat with this name");
            }
        }

        // Update basic fields
        existingProfile.setName(updatedProfile.getName());
        existingProfile.setWeight(updatedProfile.getWeight());
        existingProfile.setBirthDate(updatedProfile.getBirthDate());

        // Update new fields
        existingProfile.setBreed(updatedProfile.getBreed());
        existingProfile.setAge(updatedProfile.getAge());
        existingProfile.setProteinPreferences(updatedProfile.getProteinPreferences());
        existingProfile.setDietaryRequirements(updatedProfile.getDietaryRequirements());
        existingProfile.setAllergies(updatedProfile.getAllergies());
        existingProfile.setNotes(updatedProfile.getNotes());
        // Add this line to update the photo URL
        existingProfile.setPhotoUrl(updatedProfile.getPhotoUrl());

        return catProfileRepository.save(existingProfile);
    }

    /**
     * Soft delete a cat profile
     */
    public void softDeleteCatProfile(Long catProfileId) {
        CatProfile catProfile = getCatProfileById(catProfileId);
        catProfile.softDelete();
        catProfileRepository.save(catProfile);
    }

    /**
     * Restore a soft-deleted cat profile (for admin functionality)
     */
    @PreAuthorize("hasRole('ADMIN')")
    public CatProfile restoreCatProfile(Long catProfileId) {
        User currentUser = authService.getCurrentUser();

        // Admins can access deleted cat profiles
        CatProfile catProfile = catProfileRepository.findById(catProfileId)
                .orElseThrow(() -> new EntityNotFoundException("Cat profile not found"));

        catProfile.restore();
        return catProfileRepository.save(catProfile);
    }
}