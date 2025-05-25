package com.purrpouch.backend.repository;

import com.purrpouch.backend.model.KitMealItem;
import com.purrpouch.backend.model.KitMeal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KitMealItemRepository extends JpaRepository<KitMealItem, Long> {
    List<KitMealItem> findByKitMeal(KitMeal kitMeal);

    List<KitMealItem> findByKitMealId(Long kitMealId);
}
