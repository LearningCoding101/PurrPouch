package com.purrpouch.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.purrpouch.backend.dto.AiMealKitDto;
import com.purrpouch.backend.model.*;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
public class AiMealGeneratorService {

    @Autowired
    private ChatModel chatModel;

    @Autowired
    private FoodService foodService;

    @Autowired
    private CatProfileService catProfileService;

    /**
     * Generate a meal kit using AI based on chat history and cat profile
     */
    public AiMealKitDto generateMealKit(Long catProfileId, List<String> chatHistory) {
        try {
            // Get cat profile
            CatProfile catProfile = catProfileService.getCatProfileById(catProfileId);

            // Get all available foods
            List<FoodSku> allFoods = foodService.getAllFoodSkus();

            // Filter to only include foods with available stock
            List<FoodSku> availableFoods = allFoods.stream()
                    .filter(food -> food.getAvailableStock() != null && food.getAvailableStock() > 0)
                    .toList();

            // Format the food data for the AI prompt
            String foodsData = formatFoodSkuData(availableFoods);

            // Format the cat profile data
            String catData = formatCatProfileData(catProfile);

            // Format the chat history
            String chatData = formatChatHistory(chatHistory);
            // Create system prompt with all the data
            String systemPrompt = "You are a cat food expert AI for PurrPouch. Your task is to create a personalized daily meal kit "
                    +
                    "for a cat based on their profile information, chat history with the owner, and the available food options in our inventory. "
                    +
                    "You must follow these strict meal rules:\n\n" +
                    "- BREAKFAST (Sáng): Exactly 1 WET food + 1 TOPPING\n" +
                    "- LUNCH (Trưa): Exactly 1 DRY food + 1 SNACK (treat)\n" +
                    "- DINNER (Tối): Exactly 1 WET food + 1 TOPPING\n\n" +
                    "IMPORTANT: You MUST select foods that match the exact types specified. Wet food must be type WET, dry food must be type DRY, etc.\n\n"
                    +
                    "Consider the cat's preferences, allergies, dietary requirements, and health needs in your selection.\n\n"
                    +
                    "Here is the cat's profile information:\n" + catData + "\n\n" +
                    "Here is the recent chat history with the owner:\n" + chatData + "\n\n" +
                    "Here are the available food options in our inventory:\n" + foodsData + "\n\n" +
                    "Generate a meal kit in JSON format with the following structure:\n" +
                    "{\n" +
                    "  \"kitName\": \"Name for the meal kit\",\n" +
                    "  \"meals\": [\n" +
                    "    {\n" +
                    "      \"mealType\": \"BREAKFAST\",\n" +
                    "      \"foodItems\": [\n" +
                    "        {\n" +
                    "          \"foodSkuId\": 123,\n" +
                    "          \"quantity\": 1.0\n" +
                    "        },\n" +
                    "        {\n" +
                    "          \"foodSkuId\": 456,\n" +
                    "          \"quantity\": 0.5\n" +
                    "        }\n" +
                    "      ]\n" +
                    "    },\n" +
                    "    // LUNCH and DINNER follow the same structure\n" +
                    "  ]\n" +
                    "}\n\n" +
                    "You must ONLY return valid JSON without any additional text, explanation, or markdown.";

            SystemMessage systemMessage = new SystemMessage(systemPrompt);
            UserMessage userMessage = new UserMessage(
                    "Generate a personalized meal kit for my cat based on our conversation and my cat's profile.");

            List<Message> messages = new ArrayList<>();
            messages.add(systemMessage);
            messages.add(userMessage);
            Prompt prompt = new Prompt(messages);

            // Get response from AI
            String jsonResponse = chatModel.call(prompt).getResult().getOutput().getContent().trim();

            // Clean the response to ensure it's valid JSON
            jsonResponse = cleanJsonResponse(jsonResponse);

            // Parse the JSON response
            return processAiResponse(jsonResponse, catProfileId);
        } catch (Exception e) {
            // In case of error, generate a fallback meal kit
            return generateFallbackMealKit(catProfileId);
        }
    }

    /**
     * Clean the JSON response from AI to ensure it's valid
     */
    private String cleanJsonResponse(String jsonResponse) {
        // Remove markdown code block indicators if present
        jsonResponse = jsonResponse.replaceAll("```json", "").replaceAll("```", "").trim();

        // Check if the response starts with a JSON object
        if (!jsonResponse.startsWith("{")) {
            // Try to find the start of a JSON object
            int start = jsonResponse.indexOf("{");
            if (start >= 0) {
                jsonResponse = jsonResponse.substring(start);
            }
        }

        // Check if the response ends with a JSON object
        if (!jsonResponse.endsWith("}")) {
            // Try to find the end of a JSON object
            int end = jsonResponse.lastIndexOf("}");
            if (end >= 0) {
                jsonResponse = jsonResponse.substring(0, end + 1);
            }
        }

        return jsonResponse;
    }

    /**
     * Process the AI response JSON and create a meal kit
     */
    private AiMealKitDto processAiResponse(String jsonResponse, Long catProfileId) {
        try {
            ObjectMapper mapper = new ObjectMapper();

            // Parse the AI response
            AiMealKitResponse aiResponse = mapper.readValue(jsonResponse, AiMealKitResponse.class);

            // Create a new food kit
            FoodKit foodKit = foodService.createFoodKit(catProfileId, aiResponse.getKitName());

            AiMealKitDto result = new AiMealKitDto();
            result.setKitId(foodKit.getId());
            result.setKitName(foodKit.getName());
            result.setCatProfileId(catProfileId);
            result.setMeals(new ArrayList<>());

            // Process each meal
            for (AiMealKitResponse.Meal meal : aiResponse.getMeals()) {
                // Determine meal type
                KitMeal.MealType mealType = KitMeal.MealType.valueOf(meal.getMealType());

                // Create meal
                KitMeal kitMeal = foodService.addMealToKit(foodKit.getId(), mealType);

                AiMealKitDto.MealDto mealDto = new AiMealKitDto.MealDto();
                mealDto.setMealId(kitMeal.getId());
                mealDto.setMealType(mealType);
                mealDto.setFoodItems(new ArrayList<>());
                // Process each food item
                for (AiMealKitResponse.FoodItem item : meal.getFoodItems()) {
                    // Get the food SKU
                    FoodSku foodSku = foodService.getFoodSkuById(item.getFoodSkuId());

                    // Add food item to meal
                    foodService.addFoodToMeal(
                            kitMeal.getId(),
                            item.getFoodSkuId(),
                            BigDecimal.valueOf(item.getQuantity()));

                    // Add to DTO
                    AiMealKitDto.FoodItemDto foodItemDto = new AiMealKitDto.FoodItemDto();
                    foodItemDto.setFoodSkuId(foodSku.getId());
                    foodItemDto.setName(foodSku.getName());
                    foodItemDto.setType(foodSku.getType().toString());
                    foodItemDto.setBrand(foodSku.getBrand());
                    foodItemDto.setQuantity(BigDecimal.valueOf(item.getQuantity()));
                    foodItemDto.setUnit(foodSku.getUnit());

                    mealDto.getFoodItems().add(foodItemDto);
                }

                result.getMeals().add(mealDto);
            }

            return result;
        } catch (JsonProcessingException e) {
            // Log the error
            System.err.println("Error parsing AI response: " + e.getMessage());
            System.err.println("AI response was: " + jsonResponse);

            // If parsing fails, generate a fallback
            return generateFallbackMealKit(catProfileId);
        } catch (Exception e) {
            // Log the error
            System.err.println("Unexpected error processing AI response: " + e.getMessage());
            e.printStackTrace();

            // If any other error occurs, generate a fallback
            return generateFallbackMealKit(catProfileId);
        }
    }

    /**
     * Generate a fallback meal kit if AI generation fails
     */
    private AiMealKitDto generateFallbackMealKit(Long catProfileId) {
        // Create a new food kit using the food service
        FoodKit foodKit = foodService.generateAiMealKit(catProfileId, Collections.emptyList());

        // Convert to DTO
        AiMealKitDto result = new AiMealKitDto();
        result.setKitId(foodKit.getId());
        result.setKitName(foodKit.getName());
        result.setCatProfileId(catProfileId);
        result.setMeals(new ArrayList<>());

        // Get all meals for this kit
        List<KitMeal> meals = foodService.getMealsByFoodKitId(foodKit.getId());

        for (KitMeal meal : meals) {
            AiMealKitDto.MealDto mealDto = new AiMealKitDto.MealDto();
            mealDto.setMealId(meal.getId());
            mealDto.setMealType(meal.getMealType());
            mealDto.setFoodItems(new ArrayList<>());

            // Get food items for this meal
            List<KitMealItem> items = foodService.getFoodItemsByKitMealId(meal.getId());

            for (KitMealItem item : items) {
                FoodSku foodSku = item.getFoodSku();

                AiMealKitDto.FoodItemDto foodItemDto = new AiMealKitDto.FoodItemDto();
                foodItemDto.setFoodSkuId(foodSku.getId());
                foodItemDto.setName(foodSku.getName());
                foodItemDto.setType(foodSku.getType().toString());
                foodItemDto.setBrand(foodSku.getBrand());
                foodItemDto.setQuantity(item.getQuantity());
                foodItemDto.setUnit(foodSku.getUnit());

                mealDto.getFoodItems().add(foodItemDto);
            }

            result.getMeals().add(mealDto);
        }

        return result;
    }

    /**
     * Format food SKU data for the AI prompt
     */
    private String formatFoodSkuData(List<FoodSku> foodSkus) {
        StringBuilder sb = new StringBuilder();

        for (FoodSku sku : foodSkus) {
            sb.append("ID: ").append(sku.getId())
                    .append(", Name: \"").append(sku.getName()).append("\"")
                    .append(", Type: ").append(sku.getType())
                    .append(", Brand: \"").append(sku.getBrand()).append("\"")
                    .append(", Unit: \"").append(sku.getUnit()).append("\"")
                    .append(", Price: ").append(sku.getPricePerUnit())
                    .append(", Stock: ").append(sku.getAvailableStock());

            if (sku.getDescription() != null && !sku.getDescription().trim().isEmpty()) {
                sb.append(", Description: \"").append(sku.getDescription()).append("\"");
            }

            sb.append("\n");
        }

        return sb.toString();
    }

    /**
     * Format cat profile data for the AI prompt
     */
    private String formatCatProfileData(CatProfile profile) {
        StringBuilder sb = new StringBuilder();

        sb.append("Name: ").append(profile.getName()).append("\n");

        if (profile.getBreed() != null) {
            sb.append("Breed: ").append(profile.getBreed()).append("\n");
        }

        if (profile.getAge() != null) {
            sb.append("Age: ").append(profile.getAge()).append(" years\n");
        }

        if (profile.getWeight() != null) {
            sb.append("Weight: ").append(profile.getWeight()).append(" kg\n");
        }

        if (profile.getProteinPreferences() != null && !profile.getProteinPreferences().isEmpty()) {
            sb.append("Protein Preferences: ");
            for (int i = 0; i < profile.getProteinPreferences().size(); i++) {
                if (i > 0)
                    sb.append(", ");
                sb.append(profile.getProteinPreferences().get(i).toString().replace("_", " "));
            }
            sb.append("\n");
        }

        if (profile.getDietaryRequirements() != null && !profile.getDietaryRequirements().isEmpty()) {
            sb.append("Dietary Requirements: ");
            for (int i = 0; i < profile.getDietaryRequirements().size(); i++) {
                if (i > 0)
                    sb.append(", ");
                sb.append(profile.getDietaryRequirements().get(i).toString().replace("_", " "));
            }
            sb.append("\n");
        }

        if (profile.getAllergies() != null && !profile.getAllergies().isEmpty()) {
            sb.append("Allergies: ");
            for (int i = 0; i < profile.getAllergies().size(); i++) {
                if (i > 0)
                    sb.append(", ");
                sb.append(profile.getAllergies().get(i).toString().replace("_", " "));
            }
            sb.append("\n");
        }

        if (profile.getNotes() != null && !profile.getNotes().trim().isEmpty()) {
            sb.append("Notes: ").append(profile.getNotes()).append("\n");
        }

        return sb.toString();
    }

    /**
     * Format chat history for the AI prompt
     */
    private String formatChatHistory(List<String> chatHistory) {
        if (chatHistory == null || chatHistory.isEmpty()) {
            return "No recent chat history available.";
        }

        StringBuilder sb = new StringBuilder();
        for (String message : chatHistory) {
            sb.append("- ").append(message).append("\n");
        }

        return sb.toString();
    }

    /**
     * Private inner classes for parsing AI response
     */
    private static class AiMealKitResponse {
        private String kitName;
        private List<Meal> meals;

        public String getKitName() {
            return kitName;
        }

        public void setKitName(String kitName) {
            this.kitName = kitName;
        }

        public List<Meal> getMeals() {
            return meals;
        }

        public void setMeals(List<Meal> meals) {
            this.meals = meals;
        }

        static class Meal {
            private String mealType;
            private List<FoodItem> foodItems;

            public String getMealType() {
                return mealType;
            }

            public void setMealType(String mealType) {
                this.mealType = mealType;
            }

            public List<FoodItem> getFoodItems() {
                return foodItems;
            }

            public void setFoodItems(List<FoodItem> foodItems) {
                this.foodItems = foodItems;
            }
        }

        static class FoodItem {
            private Long foodSkuId;
            private double quantity;

            public Long getFoodSkuId() {
                return foodSkuId;
            }

            public void setFoodSkuId(Long foodSkuId) {
                this.foodSkuId = foodSkuId;
            }

            public double getQuantity() {
                return quantity;
            }

            public void setQuantity(double quantity) {
                this.quantity = quantity;
            }
        }
    }
}
