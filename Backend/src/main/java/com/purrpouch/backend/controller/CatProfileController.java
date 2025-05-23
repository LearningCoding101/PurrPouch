package com.purrpouch.backend.controller;

import com.purrpouch.backend.model.CatProfile;
import com.purrpouch.backend.payload.request.CatProfileRequest;
import com.purrpouch.backend.payload.response.CatProfileResponse;
import com.purrpouch.backend.payload.response.MessageResponse;
import com.purrpouch.backend.service.CatProfileService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cat-profiles")
public class CatProfileController {

    @Autowired
    private CatProfileService catProfileService;
    
    @GetMapping
    public ResponseEntity<List<CatProfileResponse>> getAllCatProfiles() {
        List<CatProfileResponse> catProfiles = catProfileService.getCurrentUserCatProfiles()
                .stream()
                .map(CatProfileResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(catProfiles);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getCatProfileById(@PathVariable Long id) {
        try {
            CatProfile catProfile = catProfileService.getCatProfileById(id);
            return ResponseEntity.ok(CatProfileResponse.fromEntity(catProfile));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse(e.getMessage()));
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createCatProfile(@Valid @RequestBody CatProfileRequest request) {
        try {
            CatProfile catProfile = new CatProfile();
            catProfile.setName(request.getName());
            catProfile.setBreed(request.getBreed());
            catProfile.setWeight(request.getWeight());
            catProfile.setAge(request.getAge());
            catProfile.setProteinPreferences(request.getProteinPreferences());
            catProfile.setDietaryRequirements(request.getDietaryRequirements());
            catProfile.setAllergies(request.getAllergies());
            catProfile.setNotes(request.getNotes());
            catProfile.setBirthDate(request.getBirthDate());
            
            CatProfile createdProfile = catProfileService.createCatProfile(catProfile);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(CatProfileResponse.fromEntity(createdProfile));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCatProfile(
            @PathVariable Long id,
            @Valid @RequestBody CatProfileRequest request) {
        try {
            CatProfile catProfile = new CatProfile();
            catProfile.setName(request.getName());
            catProfile.setBreed(request.getBreed());
            catProfile.setWeight(request.getWeight());
            catProfile.setAge(request.getAge());
            catProfile.setProteinPreferences(request.getProteinPreferences());
            catProfile.setDietaryRequirements(request.getDietaryRequirements());
            catProfile.setAllergies(request.getAllergies());
            catProfile.setNotes(request.getNotes());
            catProfile.setBirthDate(request.getBirthDate());
            
            CatProfile updatedProfile = catProfileService.updateCatProfile(id, catProfile);
            return ResponseEntity.ok(CatProfileResponse.fromEntity(updatedProfile));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCatProfile(@PathVariable Long id) {
        try {
            catProfileService.softDeleteCatProfile(id);
            return ResponseEntity.ok(new MessageResponse("Cat profile deleted successfully"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse(e.getMessage()));
        }
    }
    
    @PostMapping("/{id}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> restoreCatProfile(@PathVariable Long id) {
        try {
            CatProfile restoredProfile = catProfileService.restoreCatProfile(id);
            return ResponseEntity.ok(CatProfileResponse.fromEntity(restoredProfile));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse(e.getMessage()));
        }
    }
}