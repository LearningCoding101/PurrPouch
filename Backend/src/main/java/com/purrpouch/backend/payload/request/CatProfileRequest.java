package com.purrpouch.backend.payload.request;

import com.purrpouch.backend.model.CatProfile.ProteinType;
import com.purrpouch.backend.model.CatProfile.DietaryRequirement;
import com.purrpouch.backend.model.CatProfile.Allergy;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
@Getter
@Setter
public class CatProfileRequest {
    // Existing fields
    @NotBlank(message = "Cat name is required")
    private String name;
    
    private String breed;
    
    @Positive(message = "Weight must be positive")
    private Float weight;
    
    private Integer age;
    
    private List<ProteinType> proteinPreferences;
    
    private List<DietaryRequirement> dietaryRequirements;
    
    private List<Allergy> allergies;
    
    private String notes;
    
    // Add this field
    private String photoUrl;
    
    @Past(message = "Birth date must be in the past")
    private LocalDate birthDate;
}