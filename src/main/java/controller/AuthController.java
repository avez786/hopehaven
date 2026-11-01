package com.hopehaven.hopehaven_backend.controller;

import com.hopehaven.hopehaven_backend.dto.LoginRequest;
import com.hopehaven.hopehaven_backend.dto.LoginResponse;
import com.hopehaven.hopehaven_backend.dto.RegisterRequest;
import com.hopehaven.hopehaven_backend.model.User;
import com.hopehaven.hopehaven_backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.hopehaven.hopehaven_backend.dto.UserResponse;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(
            @RequestBody RegisterRequest request) {

        User user = authService.register(request);

        UserResponse response = new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole().name()
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request.getEmail(), request.getPassword()));
    }
}