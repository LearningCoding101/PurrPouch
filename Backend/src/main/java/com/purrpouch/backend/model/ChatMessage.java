package com.purrpouch.backend.model;

public class ChatMessage {
    private String message;
    private String catId;
    private String userId;

    public ChatMessage() {
    }

    public ChatMessage(String message, String catId, String userId) {
        this.message = message;
        this.catId = catId;
        this.userId = userId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getCatId() {
        return catId;
    }

    public void setCatId(String catId) {
        this.catId = catId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
