package com.purrpouch.backend.repository;

import com.purrpouch.backend.model.KitMeal;
import com.purrpouch.backend.model.FoodKit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KitMealRepository extends JpaRepository<KitMeal, Long> {
    List<KitMeal> findByFoodKit(FoodKit foodKit);

    List<KitMeal> findByFoodKitId(Long foodKitId);

    List<KitMeal> findByFoodKitAndMealType(FoodKit foodKit, KitMeal.MealType mealType);
}
