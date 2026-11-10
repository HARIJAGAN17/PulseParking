package com.parkpulse.parkingspace.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ParkingSpaceCreateRequest(
    @NotBlank(message = "Space label is required")
    @Size(max = 50)
    String spaceLabel,

    int displayOrder
) {}

