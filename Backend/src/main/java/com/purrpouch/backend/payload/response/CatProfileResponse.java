package com.purrpouch.backend.payload.response;

import com.purrpouch.backend.model.CatProfile;
import com.purrpouch.backend.model.CatProfile.ProteinType;
import com.purrpouch.backend.model.CatProfile.DietaryRequirement;
import com.purrpouch.backend.model.CatProfile.Allergy;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
@Getter
@Setter
public class CatProfileResponse {
    // Existing fields
    private Long id;
    private String name;
    private String breed;
    private Float weight;
    private Integer age;
    private List<ProteinType> proteinPreferences;
    private List<DietaryRequirement> dietaryRequirements;
    private List<Allergy> allergies;
    private String notes;
    // Add this field
    private String photoUrl;
    private LocalDate birthDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static CatProfileResponse fromEntity(CatProfile catProfile) {
        CatProfileResponse response = new CatProfileResponse();
        response.setId(catProfile.getId());
        response.setName(catProfile.getName());
        response.setBreed(catProfile.getBreed());
        response.setWeight(catProfile.getWeight());
        response.setAge(catProfile.getAge());
        response.setProteinPreferences(catProfile.getProteinPreferences());
        response.setDietaryRequirements(catProfile.getDietaryRequirements());
        response.setAllergies(catProfile.getAllergies());
        response.setNotes(catProfile.getNotes());
        // Set the photo URL
        response.setPhotoUrl(catProfile.getPhotoUrl());
        response.setBirthDate(catProfile.getBirthDate());
        response.setCreatedAt(catProfile.getCreatedAt());
        response.setUpdatedAt(catProfile.getUpdatedAt());
        return response;
    }
}