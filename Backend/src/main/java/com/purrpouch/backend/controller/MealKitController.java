package com.purrpouch.backend.controller;

import com.purrpouch.backend.dto.AiMealKitDto;
import com.purrpouch.backend.model.FoodKit;
import com.purrpouch.backend.service.ChatService;
import com.purrpouch.backend.service.FoodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/meal-kits")
@CrossOrigin(origins = "*", maxAge = 3600)
public class MealKitController {

    @Autowired
    private FoodService foodService;

    @Autowired
    private ChatService chatService;

    /**
     * Get all meal kits for a cat
     */
    @GetMapping("/cat/{catProfileId}")
    public ResponseEntity<?> getMealKitsByCatProfile(@PathVariable Long catProfileId) {
        List<FoodKit> kits = foodService.getFoodKitsByCatProfileId(catProfileId);
        return ResponseEntity.ok(kits);
    }

    /**
     * Get a specific meal kit
     */
    @GetMapping("/{kitId}")
    public ResponseEntity<?> getMealKit(@PathVariable Long kitId) {
        FoodKit kit = foodService.getFoodKitById(kitId);
        return ResponseEntity.ok(kit);
    }

    /**
     * Generate a meal kit using AI
     */
    @PostMapping("/generate")
    public ResponseEntity<?> generateMealKit(@RequestBody Map<String, Object> request) {
        try {
            if (!request.containsKey("catId")) {
                return ResponseEntity.badRequest().body("Missing catId in request");
            }

            String catId = request.get("catId").toString();

            // Extract chat history if provided
            List<String> chatHistory = new ArrayList<>();
            if (request.containsKey("chatHistory") && request.get("chatHistory") instanceof List) {
                @SuppressWarnings("unchecked")
                List<Object> history = (List<Object>) request.get("chatHistory");

                for (Object msg : history) {
                    if (msg instanceof String) {
                        chatHistory.add((String) msg);
                    } else if (msg instanceof Map) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> msgMap = (Map<String, Object>) msg;
                        if (msgMap.containsKey("message") && msgMap.get("message") instanceof String) {
                            chatHistory.add(msgMap.get("message").toString());
                        } else if (msgMap.containsKey("content") && msgMap.get("content") instanceof String) {
                            chatHistory.add(msgMap.get("content").toString());
                        }
                    }
                }
            }

            AiMealKitDto mealKit = chatService.generateAiMealKit(catId, chatHistory);

            if (mealKit != null) {
                return ResponseEntity.ok(mealKit);
            } else {
                return ResponseEntity.badRequest().body("Failed to generate meal kit");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error generating meal kit: " + e.getMessage());
        }
    }
}
