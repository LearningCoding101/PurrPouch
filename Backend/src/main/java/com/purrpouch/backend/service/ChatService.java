package com.purrpouch.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ai.chat.model.ChatModel;
// Using fully-qualified Spring AI ChatResponse to avoid import collision with model.ChatResponse
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;

import com.purrpouch.backend.model.ChatMessage;
import com.purrpouch.backend.model.ChatResponse;
import com.purrpouch.backend.model.CatProfile;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class ChatService {

    @Autowired
    private ChatModel chatModel;

    @Autowired
    private CatProfileService catProfileService;

    @Autowired
    private AiMealGeneratorService aiMealGeneratorService;

    public ChatResponse processMessage(ChatMessage chatMessage) {
        try {
            // Get cat profile information if catId is provided
            String catContext = "";
            if (chatMessage.getCatId() != null && !chatMessage.getCatId().isEmpty()) {
                try {
                    CatProfile catProfile = catProfileService
                            .getCatProfileById(Long.parseLong(chatMessage.getCatId()));
                    catContext = buildCatProfileContext(catProfile);
                } catch (Exception e) {
                    // If profile can't be retrieved, continue without it
                    catContext = "No specific cat profile information available.";
                }
            }

            // Create the system message with cat context
            String systemPrompt = "You are a cat nutrition expert assistant for PurrPouch, a cat food delivery service. "
                    +
                    "Your job is to provide helpful, accurate advice about cat nutrition, food recommendations, "
                    +
                    "and dietary information. Keep responses concise and focused on cat nutrition. "
                    +
                    "Here is information about the cat you're providing recommendations for: "
                    + catContext;

            SystemMessage systemMessage = new SystemMessage(systemPrompt);
            UserMessage userMessage = new UserMessage(chatMessage.getMessage()); // Create prompt with both
                                                                                 // messages
            List<Message> messages = new ArrayList<>();
            messages.add(systemMessage);
            messages.add(userMessage);
            Prompt prompt = new Prompt(messages); // Get response from ChatGPT using ChatModel
            org.springframework.ai.chat.model.ChatResponse aiResponse = chatModel.call(prompt);
            String responseText = aiResponse.getResult().getOutput().getContent();

            // Extract product recommendations from the response
            List<String> recommendations = extractRecommendations(responseText);

            return new ChatResponse(responseText, recommendations, true);

        } catch (Exception e) {
            // Fallback to a simple response in case of API failure
            return new ChatResponse(
                    "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later.",
                    Arrays.asList("Royal Canin Kitten Food", "Hill's Science Diet"),
                    false);
        }
    }

    /**
     * Builds context information from a cat profile to include in the AI prompt
     */
    private String buildCatProfileContext(CatProfile catProfile) {
        StringBuilder context = new StringBuilder();

        if (catProfile != null) {
            context.append("Cat Name: ")
                    .append(catProfile.getName() != null ? catProfile.getName() : "Unknown")
                    .append(". ");
            context.append("Age: ").append(catProfile.getAge() != null ? catProfile.getAge() + " years old"
                    : "Unknown age").append(". ");
            context.append("Weight: ")
                    .append(catProfile.getWeight() != null ? catProfile.getWeight() + " kg"
                            : "Unknown weight")
                    .append(". ");
            context.append("Breed: ")
                    .append(catProfile.getBreed() != null ? catProfile.getBreed() : "Mixed breed")
                    .append(". ");

            if (catProfile.getProteinPreferences() != null
                    && !catProfile.getProteinPreferences().isEmpty()) {
                context.append("Protein Preferences: ");
                for (int i = 0; i < catProfile.getProteinPreferences().size(); i++) {
                    if (i > 0)
                        context.append(", ");
                    context.append(catProfile.getProteinPreferences().get(i).toString()
                            .toLowerCase().replace("_", " "));
                }
                context.append(". ");
            }

            if (catProfile.getDietaryRequirements() != null
                    && !catProfile.getDietaryRequirements().isEmpty()) {
                context.append("Dietary Requirements: ");
                for (int i = 0; i < catProfile.getDietaryRequirements().size(); i++) {
                    if (i > 0)
                        context.append(", ");
                    context.append(catProfile.getDietaryRequirements().get(i).toString()
                            .toLowerCase().replace("_", " "));
                }
                context.append(". ");
            }

            if (catProfile.getAllergies() != null && !catProfile.getAllergies().isEmpty()) {
                context.append("Allergies: ");
                for (int i = 0; i < catProfile.getAllergies().size(); i++) {
                    if (i > 0)
                        context.append(", ");
                    context.append(catProfile.getAllergies().get(i).toString().toLowerCase()
                            .replace("_", " "));
                }
                context.append(". ");
            }

            if (catProfile.getNotes() != null && !catProfile.getNotes().trim().isEmpty()) {
                context.append("Additional Notes: ").append(catProfile.getNotes()).append(". ");
            }
        } else {
            context.append("No specific cat profile information available.");
        }

        return context.toString();
    }

    /**
     * Extracts product recommendations from the AI response text
     */
    private List<String> extractRecommendations(String responseText) {
        List<String> recommendations = new ArrayList<>();

        if (responseText == null || responseText.trim().isEmpty()) {
            return recommendations;
        }

        // Look for common patterns that indicate product recommendations
        String[] lines = responseText.split("\n");

        for (String line : lines) {
            line = line.trim();

            // Skip empty lines
            if (line.isEmpty()) {
                continue;
            }

            // Look for lines that start with common recommendation indicators
            if (line.matches("^\\d+\\..*") || // Numbered lists (1. 2. 3.)
                    line.startsWith("•") || // Bullet points
                    line.startsWith("-") || // Dashes
                    line.startsWith("*") || // Asterisks
                    line.toLowerCase().contains("recommend") ||
                    line.toLowerCase().contains("suggest") ||
                    (line.toLowerCase().contains("food") && line.length() > 20)) { // Lines
                                                                                   // mentioning
                                                                                   // food with
                                                                                   // reasonable
                                                                                   // length

                // Clean up the line by removing list indicators
                String cleanLine = line.replaceAll("^\\d+\\.", "")
                        .replaceAll("^[•\\-*]", "")
                        .trim();

                if (!cleanLine.isEmpty() && cleanLine.length() > 10) {
                    recommendations.add(cleanLine);
                }
            }
        }

        // If no recommendations found using patterns, try to extract sentences
        // mentioning specific brands
        if (recommendations.isEmpty()) {
            String[] sentences = responseText.split("[.!?]");
            for (String sentence : sentences) {
                sentence = sentence.trim();
                if (sentence.toLowerCase().contains("royal canin") ||
                        sentence.toLowerCase().contains("hill's") ||
                        sentence.toLowerCase().contains("purina") ||
                        sentence.toLowerCase().contains("blue buffalo") ||
                        sentence.toLowerCase().contains("wellness") ||
                        sentence.toLowerCase().contains("farmina")) {
                    recommendations.add(sentence);
                }
            }
        }

        // Limit to maximum 5 recommendations
        return recommendations.size() > 5 ? recommendations.subList(0, 5) : recommendations;
    }

    public ChatResponse getCatFoodRecommendations(String catId) {
        // In a real implementation, this would look up the cat's profile and use it to
        // make recommendations
        // For now, we'll return a default set of recommendations

        List<String> recommendations = Arrays.asList(
                "Royal Canin Kitten Instinctive Wet Pouch - High in protein and nutrients essential for growing kittens",
                "Farmina N&D Prime Chicken & Pomegranate Kitten - Grain-free option with high-quality protein",
                "Hill's Science Diet Kitten - Well-balanced nutrition for developing kittens",
                "Purina Pro Plan Kitten - Contains DHA for brain and vision development");

        return new ChatResponse(
                "Based on your cat's profile, here are some food recommendations:",
                recommendations,
                true);
    }

    /**
     * Generate an AI meal kit based on chat history and cat profile
     */
    public com.purrpouch.backend.dto.AiMealKitDto generateAiMealKit(String catId, List<String> chatHistory) {
        try {
            Long catProfileId = Long.parseLong(catId);
            return aiMealGeneratorService.generateMealKit(catProfileId, chatHistory);
        } catch (Exception e) {
            // If there's an error, return null
            return null;
        }
    }
}
