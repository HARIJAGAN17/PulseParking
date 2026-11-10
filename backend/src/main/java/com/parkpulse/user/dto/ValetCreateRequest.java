package com.parkpulse.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ValetCreateRequest(
    @NotBlank(message = "Email is required")
    @Email(message = "Valid email is required")
    String email,

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    String password,

    @NotBlank(message = "Full name is required")
    String fullName,

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[+0-9\\s-]{7,20}$", message = "Phone number format is invalid")
    String phoneNumber
) {}

