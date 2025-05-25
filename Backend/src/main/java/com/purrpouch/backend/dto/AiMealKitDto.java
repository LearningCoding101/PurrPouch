package com.purrpouch.backend.dto;

import com.purrpouch.backend.model.KitMeal;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class AiMealKitDto {
    private Long kitId;
    private String kitName;
    private Long catProfileId;

    private List<MealDto> meals;

    @Data
    public static class MealDto {
        private Long mealId;
        private KitMeal.MealType mealType;
        private List<FoodItemDto> foodItems;
    }

    @Data
    public static class FoodItemDto {
        private Long foodSkuId;
        private String name;
        private String type;
        private String brand;
        private BigDecimal quantity;
        private String unit;
    }
}
