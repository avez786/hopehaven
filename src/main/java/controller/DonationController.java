
package com.hopehaven.hopehaven_backend.controller;

import com.hopehaven.hopehaven_backend.dto.DonationRequest;
import com.hopehaven.hopehaven_backend.model.Donation;
import com.hopehaven.hopehaven_backend.service.DonationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
    public ResponseEntity<Donation> donate(
            @Valid @RequestBody DonationRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                donationService.saveDonation(
                        request, authentication.getName()));
    }

    @GetMapping
    public List<Donation> getAllDonations() {
        return donationService.getAll();
    }

    @GetMapping("/total")
    public ResponseEntity<?> getTotal() {
        return ResponseEntity.ok(
                Map.of("total", donationService.getTotalAmount()));
    }

    @GetMapping("/category")
    public ResponseEntity<Map<String, Double>> getDonationsByCategory() {
        return ResponseEntity.ok(
                donationService.getDonationsByCategory());
    }

    @GetMapping("/recent")
    public ResponseEntity<List<Donation>> getRecentDonations() {
        return ResponseEntity.ok(
                donationService.getRecentDonations());
    }
}
