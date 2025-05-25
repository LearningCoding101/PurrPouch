package com.purrpouch.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;

@Configuration
public class AppConfiguration {

    @Value("${spring.ai.openai.api-key}")
    private String openAiApiKey;

    @Bean
    public OpenAiApi openAiApi() {
        return new OpenAiApi(openAiApiKey);
    }

    @Bean
    public ChatModel chatModel(OpenAiApi openAiApi) {
        return new OpenAiChatModel(openAiApi,
                OpenAiChatOptions.builder().model(OpenAiApi.ChatModel.GPT_4_O_MINI).build());
    }
}