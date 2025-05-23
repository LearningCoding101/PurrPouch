package com.purrpouch.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "cat_profiles")
@Getter
@Setter
@NoArgsConstructor
public class CatProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User owner;

    @Column(nullable = false)
    private String name;

    private String breed;

    private Float weight;

    private Integer age;

    @ElementCollection
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "cat_protein_preferences", joinColumns = @JoinColumn(name = "cat_id"))
    @Column(name = "protein")
    private List<ProteinType> proteinPreferences;

    @ElementCollection
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "cat_dietary_requirements", joinColumns = @JoinColumn(name = "cat_id"))
    @Column(name = "requirement")
    private List<DietaryRequirement> dietaryRequirements;

    @ElementCollection
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "cat_allergies", joinColumns = @JoinColumn(name = "cat_id"))
    @Column(name = "allergy")
    private List<Allergy> allergies;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private LocalDate birthDate;

    private LocalDateTime createdAt = LocalDateTime.now();
    
    private LocalDateTime updatedAt;
    
    private LocalDateTime deletedAt;
    
    // Helper method to check if this cat profile is deleted
    @Transient
    public boolean isDeleted() {
        return deletedAt != null;
    }
    
    // Soft delete method
    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
    }
    
    // Restore method
    public void restore() {
        this.deletedAt = null;
    }
    
    // Update timestamp on any change
    @PreUpdate
    private void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum ProteinType {
        CHICKEN,
        TURKEY,
        SALMON,
        BEEF,
        TUNA,
        DUCK,
        WHITEFISH,
        PLANT_BASED
    }

    public enum DietaryRequirement {
        SENIOR_CAT_FORMULA,
        SENSITIVE_STOMACH,
        KITTEN_GROWTH_FORMULA,
        KIDNEY_SUPPORT,
        URINARY_TRACT_HEALTH,
        WEIGHT_CONTROL,
        HAIRBALL_CONTROL
    }

    public enum Allergy {
        NO_CHICKEN,
        NO_BEEF,
        NO_EGG,
        NO_SEAFOOD,
        GRAIN_FREE,
        DAIRY_FREE,
        NO_ARTIFICIAL_PRESERVATIVES
    }
}