package com.parkpulse.occupancy.dto;

import java.util.List;
import java.util.UUID;

public record BuildingAvailabilityDto(
    UUID buildingId,
    String name,
    String code,
    String address,
    long totalSpaces,
    long usableCapacity,
    long availableSpaces,
    long occupiedSpaces,
    long outOfServiceSpaces,
    double availabilityPercentage,
    List<AreaAvailabilityDto> areas
) {}

