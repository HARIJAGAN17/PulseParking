package com.parkpulse.parkingassignment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record ValetAssignRequest(
    @NotNull(message = "Space ID is required")
    UUID spaceId,

    UUID employeeId,

    @NotBlank(message = "Vehicle plate number is required")
    @Size(min = 3, max = 20, message = "Plate number must be between 3 and 20 characters")
    String plateNumber,

    boolean isGuest,

    @Size(max = 255)
    String guestNote
) {}

