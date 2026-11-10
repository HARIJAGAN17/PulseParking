package com.parkpulse.occupancy.dto;

import java.util.UUID;

public record AreaAvailabilityDto(
    UUID areaId,
    String name,
    String levelCode,
    int displayOrder,
    long totalSpaces,
    long usableCapacity,
    long availableSpaces,
    long occupiedSpaces,
    long outOfServiceSpaces,
    double availabilityPercentage
) {}

