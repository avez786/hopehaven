
package com.hopehaven.hopehaven_backend.controller;

import com.hopehaven.hopehaven_backend.dto.AdoptionRequestDto;
import com.hopehaven.hopehaven_backend.model.AdoptionRequest;
import com.hopehaven.hopehaven_backend.model.RequestStatus;
import com.hopehaven.hopehaven_backend.service.AdoptionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/adoptions")
@CrossOrigin(origins = "*")
public class AdoptionController {

    @Autowired
    private AdoptionService adoptionService;

    @PostMapping
    public ResponseEntity<AdoptionRequest> submitRequest(
            @Valid @RequestBody AdoptionRequestDto dto,
            Authentication authentication) {

        return ResponseEntity.ok(
                adoptionService.submitRequest(
                        dto, authentication.getName()));
    }

    @GetMapping
    public List<AdoptionRequest> getAllRequests() {
        return adoptionService.getAll();
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approve(
            @PathVariable("id") Long id) {

        adoptionService.updateStatus(id, RequestStatus.APPROVED);
        return ResponseEntity.ok(
                Map.of("message", "Request approved"));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> reject(
            @PathVariable("id") Long id) {

        adoptionService.updateStatus(id, RequestStatus.REJECTED);
        return ResponseEntity.ok(
                Map.of("message", "Request rejected"));
    }
}
