
package com.hopehaven.hopehaven_backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DonationRequest {

    @NotNull(message = "Donation amount is required")
    @DecimalMin(value = "1.0", message = "Donation amount must be at least 1")
    private Double amount;

    @NotBlank(message = "Donation category is required")
    @Size(max = 100, message = "Category cannot exceed 100 characters")
    private String category;

    @NotBlank(message = "Donation frequency is required")
    private String frequency;
}
