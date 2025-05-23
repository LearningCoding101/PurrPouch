package com.purrpouch.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "kit_meal_items")
@Getter
@Setter
@NoArgsConstructor
public class KitMealItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "kit_meal_id")
    private KitMeal kitMeal;

    @ManyToOne(optional = false)
    @JoinColumn(name = "food_sku_id")
    private FoodSku foodSku;

    private BigDecimal quantity;
}
