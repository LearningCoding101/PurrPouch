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
            @Parameter(description = "Account number", required = true) @RequestParam String accountNo,

            @Parameter(description = "Start date (format: dd/MM/yyyy)", required = true) @RequestParam String fromDate,

            @Parameter(description = "End date (format: dd/MM/yyyy)", required = true) @RequestParam String toDate) {

        String response = mbBankService.getAccountTransactionHistory(accountNo, fromDate, toDate);
        return ResponseEntity.ok(response);
    }
}
