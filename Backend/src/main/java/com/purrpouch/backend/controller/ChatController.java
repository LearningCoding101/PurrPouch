
package com.purrpouch.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.purrpouch.backend.model.ChatMessage;
import com.purrpouch.backend.model.ChatResponse;
import com.purrpouch.backend.service.ChatService;
import com.purrpouch.backend.dto.AiMealKitDto;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;
import java.util.ArrayList;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*", maxAge = 3600)
@Tag(name = "Chat API", description = "Endpoints for chat and AI meal generation")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Operation(summary = "Send a chat message", description = "Send a chat message and receive an AI-generated response")
    @ApiResponse(responseCode = "200", description = "Message processed successfully")
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody ChatMessage chatMessage) {
        ChatResponse response = chatService.processMessage(chatMessage);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get food recommendations for a cat", description = "Retrieve AI-generated food recommendations for a specific cat")
    @ApiResponse(responseCode = "200", description = "Recommendations retrieved successfully")
    @GetMapping("/recommendations/{catId}")
    public ResponseEntity<?> getCatRecommendations(
            @Parameter(description = "ID of the cat to get recommendations for") @PathVariable String catId) {
        ChatResponse response = chatService.getCatFoodRecommendations(catId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Generate an AI meal kit", description = "Create a customized meal kit for a cat based on chat history")
    @ApiResponse(responseCode = "200", description = "Meal kit generated successfully", content = @Content(schema = @Schema(implementation = AiMealKitDto.class)))
    @ApiResponse(responseCode = "400", description = "Failed to generate meal kit")
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
