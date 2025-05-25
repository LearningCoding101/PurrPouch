package com.purrpouch.backend.service;

import com.purrpouch.backend.model.*;
import com.purrpouch.backend.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;

@Service
@Transactional
public class FoodService {

    @Autowired
    private FoodSkuRepository foodSkuRepository;

    @Autowired
    private FoodKitRepository foodKitRepository;

    @Autowired
    private KitMealRepository kitMealRepository;

    @Autowired
    private KitMealItemRepository kitMealItemRepository;

    @Autowired
    private CatProfileService catProfileService;

    /**
     * Get all food SKUs
     */
    public List<FoodSku> getAllFoodSkus() {
        return foodSkuRepository.findAll();
    }

    /**
     * Get food SKUs by type
     */
    public List<FoodSku> getFoodSkusByType(FoodSku.FoodType type) {
        return foodSkuRepository.findByType(type);
    }

    /**
     * Get food SKUs by type with available stock
     */
    public List<FoodSku> getAvailableFoodSkusByType(FoodSku.FoodType type) {
        return foodSkuRepository.findByTypeAndAvailableStockGreaterThan(type, 0);
    }

    /**
     * Get a food SKU by ID
     */
    public FoodSku getFoodSkuById(Long id) {
        return foodSkuRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Food SKU not found with id: " + id));
    }

    /**
     * Create a new food kit for a cat
     */
    public FoodKit createFoodKit(Long catProfileId, String kitName) {
        CatProfile catProfile = catProfileService.getCatProfileById(catProfileId);

        FoodKit foodKit = new FoodKit();
        foodKit.setCatProfile(catProfile);
        foodKit.setName(kitName);
        foodKit.setCreatedAt(LocalDateTime.now());

        return foodKitRepository.save(foodKit);
    }

    /**
     * Get a food kit by ID
     */
    public FoodKit getFoodKitById(Long id) {
        return foodKitRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Food kit not found with id: " + id));
    }

    /**
     * Get all food kits for a cat
     */
    public List<FoodKit> getFoodKitsByCatProfileId(Long catProfileId) {
        return foodKitRepository.findByCatProfileId(catProfileId);
    }

    /**
     * Add a meal to a food kit
     */
    public KitMeal addMealToKit(Long foodKitId, KitMeal.MealType mealType) {
        FoodKit foodKit = getFoodKitById(foodKitId);

        KitMeal kitMeal = new KitMeal();
        kitMeal.setFoodKit(foodKit);
        kitMeal.setMealType(mealType);

        return kitMealRepository.save(kitMeal);
    }

    /**
     * Add a food item to a meal
     */
    public KitMealItem addFoodToMeal(Long kitMealId, Long foodSkuId, BigDecimal quantity) {
        KitMeal kitMeal = kitMealRepository.findById(kitMealId)
                .orElseThrow(() -> new EntityNotFoundException("Kit meal not found with id: " + kitMealId));

        FoodSku foodSku = getFoodSkuById(foodSkuId);

        KitMealItem kitMealItem = new KitMealItem();
        kitMealItem.setKitMeal(kitMeal);
        kitMealItem.setFoodSku(foodSku);
        kitMealItem.setQuantity(quantity);

        return kitMealItemRepository.save(kitMealItem);
    }

    /**
     * Get all meals for a food kit
     */
    public List<KitMeal> getMealsByFoodKitId(Long foodKitId) {
        return kitMealRepository.findByFoodKitId(foodKitId);
    }

    /**
     * Get all food items for a meal
     */
    public List<KitMealItem> getFoodItemsByKitMealId(Long kitMealId) {
        return kitMealItemRepository.findByKitMealId(kitMealId);
    }

    /**
     * Generate AI-based meal kit recommendations for a cat
     * This method creates a complete food kit with meals and food items
     */
    public FoodKit generateAiMealKit(Long catProfileId, List<String> chatHistory) {
        // Get the cat profile
        CatProfile catProfile = catProfileService.getCatProfileById(catProfileId);

        // Create a new food kit
        FoodKit foodKit = new FoodKit();
        foodKit.setCatProfile(catProfile);
        foodKit.setName("AI Generated Meal Kit - " + LocalDateTime.now());
        foodKit.setCreatedAt(LocalDateTime.now());
        foodKit = foodKitRepository.save(foodKit);

        // Get available foods by type
        List<FoodSku> wetFoods = getAvailableFoodSkusByType(FoodSku.FoodType.WET);
        List<FoodSku> dryFoods = getAvailableFoodSkusByType(FoodSku.FoodType.DRY);
        List<FoodSku> toppings = getAvailableFoodSkusByType(FoodSku.FoodType.TOPPING);
        List<FoodSku> treats = getAvailableFoodSkusByType(FoodSku.FoodType.SNACK);

        // Create breakfast meal (wet food + topping)
        KitMeal breakfast = new KitMeal();
        breakfast.setFoodKit(foodKit);
        breakfast.setMealType(KitMeal.MealType.BREAKFAST);
        breakfast = kitMealRepository.save(breakfast);

        // Create lunch meal (dry food + treat)
        KitMeal lunch = new KitMeal();
        lunch.setFoodKit(foodKit);
        lunch.setMealType(KitMeal.MealType.LUNCH);
        lunch = kitMealRepository.save(lunch);

        // Create dinner meal (wet food + topping)
        KitMeal dinner = new KitMeal();
        dinner.setFoodKit(foodKit);
        dinner.setMealType(KitMeal.MealType.DINNER);
        dinner = kitMealRepository.save(dinner);

        // Placeholder logic - in reality, this would be determined by AI
        // For now, just select the first available item of each type
        if (!wetFoods.isEmpty()) {
            // Add wet food to breakfast
            KitMealItem breakfastMain = new KitMealItem();
            breakfastMain.setKitMeal(breakfast);
            breakfastMain.setFoodSku(wetFoods.get(0));
            breakfastMain.setQuantity(new BigDecimal("1.0"));
            kitMealItemRepository.save(breakfastMain);

            // Add wet food to dinner
            KitMealItem dinnerMain = new KitMealItem();
            dinnerMain.setKitMeal(dinner);
            dinnerMain.setFoodSku(wetFoods.size() > 1 ? wetFoods.get(1) : wetFoods.get(0));
            dinnerMain.setQuantity(new BigDecimal("1.0"));
            kitMealItemRepository.save(dinnerMain);
        }

        if (!toppings.isEmpty()) {
            // Add topping to breakfast
            KitMealItem breakfastTopping = new KitMealItem();
            breakfastTopping.setKitMeal(breakfast);
            breakfastTopping.setFoodSku(toppings.get(0));
            breakfastTopping.setQuantity(new BigDecimal("0.5"));
            kitMealItemRepository.save(breakfastTopping);

            // Add topping to dinner
            KitMealItem dinnerTopping = new KitMealItem();
            dinnerTopping.setKitMeal(dinner);
            dinnerTopping.setFoodSku(toppings.size() > 1 ? toppings.get(1) : toppings.get(0));
            dinnerTopping.setQuantity(new BigDecimal("0.5"));
            kitMealItemRepository.save(dinnerTopping);
        }

        if (!dryFoods.isEmpty()) {
            // Add dry food to lunch
            KitMealItem lunchMain = new KitMealItem();
            lunchMain.setKitMeal(lunch);
            lunchMain.setFoodSku(dryFoods.get(0));
            lunchMain.setQuantity(new BigDecimal("1.0"));
            kitMealItemRepository.save(lunchMain);
        }

        if (!treats.isEmpty()) {
            // Add treat to lunch
            KitMealItem lunchTreat = new KitMealItem();
            lunchTreat.setKitMeal(lunch);
            lunchTreat.setFoodSku(treats.get(0));
            lunchTreat.setQuantity(new BigDecimal("0.5"));
            kitMealItemRepository.save(lunchTreat);
        }

        return foodKit;
    }
}
