package com.purrpouch.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;

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

    public String getAccountTransactionHistory(String fromDate, String toDate) {
        String url = "https://online.mbbank.com.vn/api/retail-transactionms/transactionms/get-account-transaction-history";

        String deviceId = "7dp26d2d-mbib-0000-0000-2025052622172795";
        String accountNo = "0379604656";

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
        headers.set("x-request-id", "0379604656-2025052622215588-28866");
        headers.set("Cookie",
                "BIGipServerk8s_online_banking_pool_9712=3474718986.61477.0000; MBAnalyticsaaaaaaaaaaaaaaaa_session_=ICHELODIEDIDHBIIEDPCAIHMEGOHLNIEALLHIHIINMGLKALNNDHOBNANCIOLPPNCEGCDOGJDLFCIAJNLKNFAIPFNLIHHCEGIJEKCLDKIPADJAOGFANMCKNPNFOJFNGCC; AKA_A2=A; _gid=GA1.3.916544743.1748272648; BIGipServerk8s_KrakenD_Api_gateway_pool_10781=3457941770.7466.0000; _ga=GA1.1.1462207.1748272648; MBAnalytics0305260751aaaaaaaaaaaaaaaa_cspm_=HPHAGAJCJILKENHFIKFBFJIDLDKDBINHHMMNKPJFILJIKLNIFNNNPNHJBEPPNDKENFACFDBGIPJHIAMBPANAJOFEAABPOPGEMIMPINPNGNBAIPLIBHPLMKCKNEJLIDMN; _ga_T1003L03HZ=GS2.1.s1748272648^$o1^$g1^$t1748272858^$j0^$l0^$h0; JSESSIONID=89FABD47FB21781BE3A723AA0FA2199B");

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("accountNo", accountNo);
        requestBody.put("fromDate", fromDate);
        requestBody.put("toDate", toDate);
        requestBody.put("sessionId", sessionId);
        requestBody.put("refNo", refNo);
        requestBody.put("deviceIdCommon", deviceId);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

        return response.getBody();
    }

    /**
     * Alternative implementation using direct curl command to retrieve account
     * transaction history
     *
     * @param fromDate Start date in format "dd/MM/yyyy"
     * @param toDate   End date in format "dd/MM/yyyy"
     * @return Response from MBBank API as a String
     * @throws IOException          If an I/O error occurs
     * @throws InterruptedException If the process is interrupted
     */
    public String getAccountTransactionHistoryWithCurl(String fromDate, String toDate)
            throws IOException, InterruptedException {
        // First, check if curl is available on the system
        try {
            Process checkCurl = new ProcessBuilder("cmd.exe", "/c", "curl --version").start();
            int curlExitCode = checkCurl.waitFor();
            if (curlExitCode != 0) {
                throw new IOException(
                        "Curl is not installed or not available in PATH. Please install curl and try again.");
            }
        } catch (IOException e) {
            throw new IOException("Failed to check curl installation: " + e.getMessage(), e);
        }

        String deviceId = "7dp26d2d-mbib-0000-0000-2025052622172795";
        String accountNo = "0379604656";

        // Create the JSON payload
        String jsonPayload = String.format("""
                {
                    "accountNo": "%s",
                    "fromDate": "%s",
                    "toDate": "%s",
                    "sessionId": "%s",
                    "refNo": "%s",
                    "deviceIdCommon": "%s"
                }
                """, accountNo, fromDate, toDate, sessionId, refNo, deviceId);

        // Create a temporary file to hold the JSON payload
        java.nio.file.Path tempFile = java.nio.file.Files.createTempFile("mbbank_payload_", ".json");
        java.nio.file.Files.writeString(tempFile, jsonPayload);

        // Build the curl command with better quoting and file-based payload
        ProcessBuilder processBuilder = new ProcessBuilder(
                "cmd.exe", "/c",
                "curl", "--location", "--verbose",
                "https://online.mbbank.com.vn/api/retail-transactionms/transactionms/get-account-transaction-history",
                "--header", "accept: application/json, text/plain, */*",
                "--header", "accept-language: en-US,en;q=0.9,vi;q=0.8",
                "--header", "app: MB_WEB",
                "--header", "authorization: Basic RU1CUkVUQUlMV0VCOlNEMjM0ZGZnMzQlI0BGR0AzNHNmc2RmNDU4NDNm",
                "--header", "cache-control: no-cache",
                "--header", "content-type: application/json; charset=UTF-8",
                "--header", "deviceid: " + deviceId,
                "--header", "elastic-apm-traceparent: 00-5116307770d8c0827ab2a03981315e6d-ba4e4163d9f93f5a-01",
                "--header", "origin: https://online.mbbank.com.vn",
                "--header", "pragma: no-cache",
                "--header", "priority: u=1, i",
                "--header", "referer: https://online.mbbank.com.vn/information-account/source-account",
                "--header", "refno: " + refNo,
                "--header", "sec-ch-ua: \"Chromium\";v=\"136\", \"Google Chrome\";v=\"136\", \"Not.A/Brand\";v=\"99\"",
                "--header", "sec-ch-ua-mobile: ?0",
                "--header", "sec-ch-ua-platform: \"Windows\"",
                "--header", "sec-fetch-dest: empty",
                "--header", "sec-fetch-mode: cors",
                "--header", "sec-fetch-site: same-origin",
                "--header",
                "user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
                "--header", "x-request-id: 0379604656-2025052622215588-28866",
                "--header",
                "Cookie: BIGipServerk8s_online_banking_pool_9712=3474718986.61477.0000; MBAnalyticsaaaaaaaaaaaaaaaa_session_=ICHELODIEDIDHBIIEDPCAIHMEGOHLNIEALLHIHIINMGLKALNNDHOBNANCIOLPPNCEGCDOGJDLFCIAJNLKNFAIPFNLIHHCEGIJEKCLDKIPADJAOGFANMCKNPNFOJFNGCC; AKA_A2=A; _gid=GA1.3.916544743.1748272648; BIGipServerk8s_KrakenD_Api_gateway_pool_10781=3457941770.7466.0000; _ga=GA1.1.1462207.1748272648; MBAnalytics0305260751aaaaaaaaaaaaaaaa_cspm_=HPHAGAJCJILKENHFIKFBFJIDLDKDBINHHMMNKPJFILJIKLNIFNNNPNHJBEPPNDKENFACFDBGIPJHIAMBPANAJOFEAABPOPGEMIMPINPNGNBAIPLIBHPLMKCKNEJLIDMN; _ga_T1003L03HZ=GS2.1.s1748272648^$o1^$g1^$t1748272858^$j0^$l0^$h0; JSESSIONID=89FABD47FB21781BE3A723AA0FA2199B; MBAnalyticsaaaaaaaaaaaaaaaa_session_=FFAOHKKJGLBNCIHPKLFAGBHJLGCOOLOGLJMFKNEGCOPKALBDLLLLCCDDNABNHMCEEEMDABIGCDAHIOKEIHEAKALFOJHCMLICFKBPHGGJEFDEAFBFOHAAKDEHEGFLDHIC",
                "--data", "@" + tempFile.toAbsolutePath());

        // Set up process to capture the output
        processBuilder.redirectErrorStream(true);
        Process process = processBuilder.start();

        // Read the output
        StringBuilder output = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
        }

        // Delete the temporary file
        try {
            java.nio.file.Files.deleteIfExists(tempFile);
        } catch (IOException e) {
            // Just log this, not critical
            System.err.println("Warning: Failed to delete temporary file: " + tempFile);
        }

        // Wait for the process to complete
        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new IOException("Curl command failed with exit code: " + exitCode + "\nOutput: " + output.toString());
        }

        return output.toString().trim();
    }

    /**
     * Alternative implementation using Java's HttpClient to retrieve account
     * transaction history
     * Does not rely on external curl command
     * 
     * @param fromDate Start date in format "dd/MM/yyyy"
     * @param toDate   End date in format "dd/MM/yyyy"
     * @return Response from MBBank API as a String
     * @throws IOException          If an I/O error occurs
     * @throws InterruptedException If the process is interrupted
     */
    public String getAccountTransactionHistoryWithHttpClient(String fromDate, String toDate)
            throws IOException, InterruptedException {
        String deviceId = "7dp26d2d-mbib-0000-0000-2025052622172795";
        String accountNo = "0379604656";
        String url = "https://online.mbbank.com.vn/api/retail-transactionms/transactionms/get-account-transaction-history";

        // Create the JSON payload
        String jsonPayload = String.format("""
                {
                    "accountNo": "%s",
                    "fromDate": "%s",
                    "toDate": "%s",
                    "sessionId": "%s",
                    "refNo": "%s",
                    "deviceIdCommon": "%s"
                }
                """, accountNo, fromDate, toDate, sessionId, refNo, deviceId);

        // Create an HttpClient
        java.net.http.HttpClient httpClient = java.net.http.HttpClient.newBuilder()
                .version(java.net.http.HttpClient.Version.HTTP_2)
                .build();

        // Create the request
        java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                .uri(java.net.URI.create(url))
                .header("accept", "application/json, text/plain, */*")
                .header("accept-language", "en-US,en;q=0.9,vi;q=0.8")
                .header("app", "MB_WEB")
                .header("authorization", "Basic RU1CUkVUQUlMV0VCOlNEMjM0ZGZnMzQlI0BGR0AzNHNmc2RmNDU4NDNm")
                .header("cache-control", "no-cache")
                .header("content-type", "application/json; charset=UTF-8")
                .header("deviceid", deviceId)
                .header("elastic-apm-traceparent", "00-5116307770d8c0827ab2a03981315e6d-ba4e4163d9f93f5a-01")
                .header("origin", "https://online.mbbank.com.vn")
                .header("pragma", "no-cache")
                .header("priority", "u=1, i")
                .header("referer", "https://online.mbbank.com.vn/information-account/source-account")
                .header("refno", refNo)
                .header("sec-ch-ua", "\"Chromium\";v=\"136\", \"Google Chrome\";v=\"136\", \"Not.A/Brand\";v=\"99\"")
                .header("sec-ch-ua-mobile", "?0")
                .header("sec-ch-ua-platform", "\"Windows\"")
                .header("sec-fetch-dest", "empty")
                .header("sec-fetch-mode", "cors")
                .header("sec-fetch-site", "same-origin")
                .header("user-agent",
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36")
                .header("x-request-id", "0379604656-2025052622215588-28866")
                .header("Cookie",
                        "BIGipServerk8s_online_banking_pool_9712=3474718986.61477.0000; MBAnalyticsaaaaaaaaaaaaaaaa_session_=ICHELODIEDIDHBIIEDPCAIHMEGOHLNIEALLHIHIINMGLKALNNDHOBNANCIOLPPNCEGCDOGJDLFCIAJNLKNFAIPFNLIHHCEGIJEKCLDKIPADJAOGFANMCKNPNFOJFNGCC; AKA_A2=A; _gid=GA1.3.916544743.1748272648; BIGipServerk8s_KrakenD_Api_gateway_pool_10781=3457941770.7466.0000; _ga=GA1.1.1462207.1748272648; MBAnalytics0305260751aaaaaaaaaaaaaaaa_cspm_=HPHAGAJCJILKENHFIKFBFJIDLDKDBINHHMMNKPJFILJIKLNIFNNNPNHJBEPPNDKENFACFDBGIPJHIAMBPANAJOFEAABPOPGEMIMPINPNGNBAIPLIBHPLMKCKNEJLIDMN; _ga_T1003L03HZ=GS2.1.s1748272648^$o1^$g1^$t1748272858^$j0^$l0^$h0; JSESSIONID=89FABD47FB21781BE3A723AA0FA2199B; MBAnalyticsaaaaaaaaaaaaaaaa_session_=FFAOHKKJGLBNCIHPKLFAGBHJLGCOOLOGLJMFKNEGCOPKALBDLLLLCCDDNABNHMCEEEMDABIGCDAHIOKEIHEAKALFOJHCMLICFKBPHGGJEFDEAFBFOHAAKDEHEGFLDHIC")
                .POST(java.net.http.HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

        // Send the request and get the response
        java.net.http.HttpResponse<String> response = httpClient.send(
                request,
                java.net.http.HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 400) {
            throw new IOException("HTTP request failed with status code: " + response.statusCode() +
                    "\nResponse body: " + response.body());
        }

        return response.body();
    }
}
