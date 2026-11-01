
package com.hopehaven.hopehaven_backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdoptionRequestDto {

    @NotNull(message = "Child ID is required")
    @Positive(message = "Child ID must be a positive number")
    private Long childId;

    @Size(max = 1000, message = "Message cannot exceed 1000 characters")
    private String message;
}
