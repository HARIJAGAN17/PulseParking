package com.parkpulse.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank(message = "Work email is required")
    @Email(message = "Please provide a valid email address")
    String email,

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    String password,

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    String fullName,

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[+0-9\\s-]{7,20}$", message = "Phone number format is invalid")
    String phoneNumber,

    @NotBlank(message = "Vehicle registration plate is required")
    @Size(min = 3, max = 20, message = "Plate must be between 3 and 20 characters")
    String plateNumber
) {}

