package com.hopehaven.hopehaven_backend.dto;

import lombok.Data;

@Data
public class ChildRequest {
    private String name;
    private Integer age;
    private String city;
    private String bio;
    private String interests;
    private String imageEmoji;
}