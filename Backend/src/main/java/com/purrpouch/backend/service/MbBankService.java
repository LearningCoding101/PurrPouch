package com.purrpouch.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class MbBankService {

    private final RestTemplate restTemplate;

    @Value("${mbbank.sessionId}")
    private String sessionId;

    @Value("${mbbank.refNo}")
    private String refNo;

    public MbBankService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Get account transaction history from MB Bank
     * 
     * @param accountNo The account number
     * @param fromDate  The start date in format "dd/MM/yyyy"
     * @param toDate    The end date in format "dd/MM/yyyy"
     * @param sessionId Optional session ID, if null a new one will be generated
     * @param refNo     Optional reference number, if null a new one will be
     *                  generated
     * @return The response from MB Bank API
     */
    public String getAccountTransactionHistory(String accountNo, String fromDate, String toDate) {
        String url = "https://online.mbbank.com.vn/api/retail-transactionms/transactionms/get-account-transaction-history";

        // Generate deviceId if not provided
        String deviceId = "7dp26d2d-mbib-0000-0000-2025052622172795";

        // Set headers
        HttpHeaders headers = new HttpHeaders();
        headers.set("accept", "application/json, text/plain, */*");
        headers.set("accept-language", "en-US,en;q=0.9,vi;q=0.8");
        headers.set("app", "MB_WEB");
        headers.set("authorization", "Basic RU1CUkVUQUlMV0VCOlNEMjM0ZGZnMzQlI0BGR0AzNHNmc2RmNDU4NDNm");
        headers.set("cache-control", "no-cache");
        headers.set("content-type", "application/json; charset=UTF-8");
        headers.set("deviceid", deviceId);
        headers.set("elastic-apm-traceparent", "00-5116307770d8c0827ab2a03981315e6d-ba4e4163d9f93f5a-01");
        headers.set("origin", "https://online.mbbank.com.vn");
        headers.set("pragma", "no-cache");
        headers.set("priority", "u=1, i");
        headers.set("referer", "https://online.mbbank.com.vn/information-account/source-account");
        headers.set("refno", refNo);
        headers.set("sec-ch-ua", "\"Chromium\";v=\"136\", \"Google Chrome\";v=\"136\", \"Not.A/Brand\";v=\"99\"");
        headers.set("sec-ch-ua-mobile", "?0");
        headers.set("sec-ch-ua-platform", "\"Windows\"");
        headers.set("sec-fetch-dest", "empty");
        headers.set("sec-fetch-mode", "cors");
        headers.set("sec-fetch-site", "same-origin");
        headers.set("user-agent",
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36");
        headers.set("x-request-id", refNo);

        // Create request body
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("accountNo", accountNo);
        requestBody.put("fromDate", fromDate);
        requestBody.put("toDate", toDate);
        requestBody.put("sessionId", sessionId);
        requestBody.put("refNo", refNo);
        requestBody.put("deviceIdCommon", deviceId);

        // Create HTTP entity with headers and body
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        // Make the request
        ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                String.class);

        return response.getBody();
    }
}
