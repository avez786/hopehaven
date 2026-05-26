package com.hopehaven.hopehaven_backend.service;

import com.hopehaven.hopehaven_backend.dto.LoginResponse;
import com.hopehaven.hopehaven_backend.dto.RegisterRequest;
import com.hopehaven.hopehaven_backend.exception.EmailAlreadyExistsException;
import com.hopehaven.hopehaven_backend.exception.ResourceNotFoundException;
import com.hopehaven.hopehaven_backend.model.User;
import com.hopehaven.hopehaven_backend.repository.UserRepository;
import com.hopehaven.hopehaven_backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.hopehaven.hopehaven_backend.exception.EmailAlreadyExistsException;
import com.hopehaven.hopehaven_backend.exception.ResourceNotFoundException;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email already registered");
        }
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setCity(request.getCity());
        user.setRole(request.getRole());
        return userRepository.save(user);
    }

    public LoginResponse login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtUtil.generateToken(email, user.getRole().name());
        return new LoginResponse(token, email, user.getRole().name());
    }
}