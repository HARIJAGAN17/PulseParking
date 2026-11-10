package com.parkpulse.parkingarea.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ParkingAreaCreateRequest(
    @NotBlank(message = "Area name is required")
    @Size(max = 100)
    String name,

    @NotBlank(message = "Level code is required")
    @Size(max = 20)
    String levelCode,

    int displayOrder
) {}

