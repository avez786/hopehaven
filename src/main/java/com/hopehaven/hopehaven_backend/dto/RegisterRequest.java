package com.hopehaven.hopehaven_backend.dto;

import com.hopehaven.hopehaven_backend.model.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String phone;
    private String city;
    private Role role;
}