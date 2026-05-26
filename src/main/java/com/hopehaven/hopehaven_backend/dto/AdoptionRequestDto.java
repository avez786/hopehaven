package com.hopehaven.hopehaven_backend.dto;

import lombok.Data;

@Data
public class AdoptionRequestDto {
    private Long childId;
    private String message;
}