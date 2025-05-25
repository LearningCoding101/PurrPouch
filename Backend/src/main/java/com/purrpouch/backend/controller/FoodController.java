package com.purrpouch.backend.controller;

import com.purrpouch.backend.model.FoodSku;
import com.purrpouch.backend.service.FoodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/food")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FoodController {

    @Autowired
    private FoodService foodService;

    /**
     * Get all food SKUs
     */
    @GetMapping("/skus")
    public ResponseEntity<?> getAllFoodSkus() {
        List<FoodSku> foodSkus = foodService.getAllFoodSkus();
        return ResponseEntity.ok(foodSkus);
    }

    /**
     * Get food SKUs by type
     */
    @GetMapping("/skus/type/{type}")
    public ResponseEntity<?> getFoodSkusByType(@PathVariable String type) {
        try {
            FoodSku.FoodType foodType = FoodSku.FoodType.valueOf(type.toUpperCase());
            List<FoodSku> foodSkus = foodService.getFoodSkusByType(foodType);
            return ResponseEntity.ok(foodSkus);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid food type: " + type);
        }
    }

    /**
     * Get food SKU by ID
     */
    @GetMapping("/skus/{id}")
    public ResponseEntity<?> getFoodSkuById(@PathVariable Long id) {
        try {
            FoodSku foodSku = foodService.getFoodSkuById(id);
            return ResponseEntity.ok(foodSku);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
