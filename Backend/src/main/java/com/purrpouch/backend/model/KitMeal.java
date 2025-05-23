package com.purrpouch.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "kit_meals")
@Getter
@Setter
@NoArgsConstructor
public class KitMeal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "food_kit_id")
    private FoodKit foodKit;

    @Enumerated(EnumType.STRING)
    private MealType mealType;

    public enum MealType {
        BREAKFAST, LUNCH, DINNER
    }
}
