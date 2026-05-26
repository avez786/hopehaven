package com.hopehaven.hopehaven_backend.controller;

import com.hopehaven.hopehaven_backend.dto.DonationRequest;
import com.hopehaven.hopehaven_backend.model.Donation;
import com.hopehaven.hopehaven_backend.service.DonationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/donations")
@CrossOrigin(origins = "*")
public class DonationController {

    @Autowired
    private DonationService donationService;

    @PostMapping
    public ResponseEntity<Donation> donate(@RequestBody DonationRequest request) {
        return ResponseEntity.ok(donationService.saveDonation(request));
    }

    @GetMapping
    public List<Donation> getAllDonations() {
        return donationService.getAll();
    }

    @GetMapping("/total")
    public ResponseEntity<?> getTotal() {
        return ResponseEntity.ok(Map.of("total", donationService.getTotalAmount()));
    }
}