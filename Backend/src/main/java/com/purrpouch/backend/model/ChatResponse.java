package com.purrpouch.backend.model;

import java.util.List;

public class ChatResponse {
    private String message;
    private List<String> recommendations;
    private boolean success;

    public ChatResponse() {
    }

    public ChatResponse(String message, List<String> recommendations, boolean success) {
        this.message = message;
        this.recommendations = recommendations;
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<String> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<String> recommendations) {
        this.recommendations = recommendations;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }
}
