package com.purrpouch.backend.repository;

import com.purrpouch.backend.model.FoodSku;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodSkuRepository extends JpaRepository<FoodSku, Long> {
    List<FoodSku> findByType(FoodSku.FoodType type);

    List<FoodSku> findByBrand(String brand);

    List<FoodSku> findByTypeAndAvailableStockGreaterThan(FoodSku.FoodType type, Integer minStock);
}
