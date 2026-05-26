package com.hopehaven.hopehaven_backend.dto;

import com.hopehaven.hopehaven_backend.model.ChildStatus;
import lombok.Data;

@Data
public class ChildResponse {
    private Long id;
    private String name;
    private Integer age;
    private String city;
    private String bio;
    private String interests;
    private String imageEmoji;
    private ChildStatus status;
}