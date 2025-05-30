package com.purrpouch.backend.controller;

import com.purrpouch.backend.service.MbBankService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.lang.InterruptedException;

@RestController
@RequestMapping("/api/banking")
@CrossOrigin(origins = "*", maxAge = 3600)
@Tag(name = "MB Bank API", description = "Endpoints for interacting with MB Bank services")
public class MbBankController {

    @Autowired
    private MbBankService mbBankService;

    @Operation(summary = "Get account transaction history", description = "Retrieve transaction history for a specific account within a date range")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved transaction history", content = @Content(mediaType = "application/json", schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input parameters"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    @GetMapping("/transactions")
    public ResponseEntity<String> getTransactionHistory(

            @Parameter(description = "Start date (format: dd/MM/yyyy)", required = true) @RequestParam String fromDate,

            @Parameter(description = "End date (format: dd/MM/yyyy)", required = true) @RequestParam String toDate) {

        try {
            // Try the HttpClient implementation first (doesn't rely on curl)
            String response = mbBankService.getAccountTransactionHistoryWithHttpClient(fromDate, toDate);
            return ResponseEntity.ok(response);
        } catch (IOException | InterruptedException e) {
            // Log the error
            e.printStackTrace();

            try {
                // Fall back to the original implementation if the new one fails
                String response = mbBankService.getAccountTransactionHistory(fromDate, toDate);
                return ResponseEntity.ok(response);
            } catch (Exception fallbackError) {
                // Log the fallback error
                fallbackError.printStackTrace();
                return ResponseEntity.status(500).body("Error processing request: " + e.getMessage() +
                        "\nFallback error: " + fallbackError.getMessage());
            }
        }
    }
}
