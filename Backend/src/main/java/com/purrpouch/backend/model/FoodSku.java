package com.purrpouch.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "food_skus")
@Getter
@Setter
@NoArgsConstructor
public class FoodSku {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Enumerated(EnumType.STRING)
    private FoodType type;

    private String brand;

    private String unit;

    private BigDecimal pricePerUnit;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Integer availableStock;

    public enum FoodType {
        WET, DRY, TOPPING, SNACK
    }
}
