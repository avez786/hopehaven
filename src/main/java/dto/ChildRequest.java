
package com.hopehaven.hopehaven_backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChildRequest {

    @NotBlank(message = "Child name is required")
    @Size(max = 100, message = "Name cannot exceed 100 characters")
    private String name;

    @NotNull(message = "Age is required")
    @Min(value = 0, message = "Age cannot be negative")
    @Max(value = 18, message = "Age cannot exceed 18")
    private Integer age;

    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City cannot exceed 100 characters")
    private String city;

    @NotBlank(message = "Bio is required")
    @Size(max = 1000, message = "Bio cannot exceed 1000 characters")
    private String bio;

    @Size(max = 500, message = "Interests cannot exceed 500 characters")
    private String interests;

    @Size(max = 20, message = "Image emoji cannot exceed 20 characters")
    private String imageEmoji;
}
