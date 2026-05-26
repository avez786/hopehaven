package com.hopehaven.hopehaven_backend.dto;

import lombok.Data;

@Data
public class DonationRequest {
    private String donorName;
    private String donorEmail;
    private Double amount;
    private String category;
    private String frequency;
}