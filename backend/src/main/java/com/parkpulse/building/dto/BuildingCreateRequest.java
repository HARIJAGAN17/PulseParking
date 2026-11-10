package com.parkpulse.building.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BuildingCreateRequest(
    @NotBlank(message = "Building name is required")
    @Size(max = 100)
    String name,

    @NotBlank(message = "Building code is required")
    @Size(max = 50)
    String code,

    @Size(max = 255)
    String address,

    int displayOrder
) {}

