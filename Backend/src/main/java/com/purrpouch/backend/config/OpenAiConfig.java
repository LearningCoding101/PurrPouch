// package com.purrpouch.backend.config;

// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.ai.chat.model.ChatModel;
// import org.springframework.ai.openai.OpenAiChatModel;
// import org.springframework.ai.openai.OpenAiChatOptions;
// import org.springframework.ai.openai.api.OpenAiApi;

// @Configuration
// public class OpenAiConfig {

// @Value("${openai.api.key}")
// private String apiKey;

// @Bean
// public ChatModel chatModel() {
// OpenAiApi openAiApi = new OpenAiApi(apiKey);

// OpenAiChatOptions options = OpenAiChatOptions.builder()
// .model(OpenAiApi.ChatModel.GPT_4_O_MINI)
// .temperature(0.7)
// .maxTokens(1500)
// .build();

// return new OpenAiChatModel(openAiApi, options);
// }
// }