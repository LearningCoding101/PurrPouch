package com.purrpouch.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "food_kits")
@Getter
@Setter
@NoArgsConstructor
public class FoodKit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cat_profile_id")
    private CatProfile catProfile;

    private String name;

    private Integer quantity = 1;

    private LocalDateTime createdAt = LocalDateTime.now();
}
