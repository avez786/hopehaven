package com.hopehaven.hopehaven_backend.controller;

import com.hopehaven.hopehaven_backend.dto.AdoptionRequestDto;
import com.hopehaven.hopehaven_backend.model.AdoptionRequest;
import com.hopehaven.hopehaven_backend.model.RequestStatus;
import com.hopehaven.hopehaven_backend.service.AdoptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/adoptions")
@CrossOrigin(origins = "*")
public class AdoptionController {

    @Autowired
    private AdoptionService adoptionService;

    @PostMapping
    public ResponseEntity<AdoptionRequest> submitRequest(
            @RequestBody AdoptionRequestDto dto) {
        return ResponseEntity.ok(adoptionService.submitRequest(dto));
    }

    @GetMapping
    public List<AdoptionRequest> getAllRequests() {
        return adoptionService.getAll();
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<AdoptionRequest> approve(@PathVariable Long id) {
        return ResponseEntity.ok(adoptionService.updateStatus(id, RequestStatus.APPROVED));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<AdoptionRequest> reject(@PathVariable Long id) {
        return ResponseEntity.ok(adoptionService.updateStatus(id, RequestStatus.REJECTED));
    }
}