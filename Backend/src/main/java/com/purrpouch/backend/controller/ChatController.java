
package com.purrpouch.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.purrpouch.backend.model.ChatMessage;
import com.purrpouch.backend.model.ChatResponse;
import com.purrpouch.backend.service.ChatService;
import com.purrpouch.backend.dto.AiMealKitDto;

import java.util.List;
import java.util.ArrayList;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody ChatMessage chatMessage) {
        ChatResponse response = chatService.processMessage(chatMessage);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/recommendations/{catId}")
    public ResponseEntity<?> getCatRecommendations(@PathVariable String catId) {
        ChatResponse response = chatService.getCatFoodRecommendations(catId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/generate-meal-kit")
    public ResponseEntity<?> generateMealKit(@RequestBody Map<String, Object> request) {
        String catId = request.get("catId").toString();

        // Extract chat history
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
    }
}
