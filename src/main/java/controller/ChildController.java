
package com.hopehaven.hopehaven_backend.controller;

import com.hopehaven.hopehaven_backend.dto.ChildRequest;
import com.hopehaven.hopehaven_backend.dto.ChildResponse;
import com.hopehaven.hopehaven_backend.service.ChildService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/children")
@CrossOrigin(origins = "*")
public class ChildController {

    @Autowired
    private ChildService childService;

    @GetMapping
    public List<ChildResponse> getAllChildren() {
        return childService.getAllChildren();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChildResponse> getChild(
            @PathVariable("id") Long id) {
        return ResponseEntity.ok(childService.getChildById(id));
    }

    @PostMapping
    public ResponseEntity<ChildResponse> addChild(
            @Valid @RequestBody ChildRequest request) {
        return ResponseEntity.ok(childService.addChild(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChildResponse> updateChild(
            @PathVariable("id") Long id,
            @Valid @RequestBody ChildRequest request) {
        return ResponseEntity.ok(childService.updateChild(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteChild(
            @PathVariable("id") Long id) {
        childService.deleteChild(id);
        return ResponseEntity.ok("Deleted successfully");
    }

    @GetMapping("/filter")
    public List<ChildResponse> filterChildren(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer minAge,
            @RequestParam(required = false) Integer maxAge) {
        return childService.filterChildren(city, status, minAge, maxAge);
    }
}
