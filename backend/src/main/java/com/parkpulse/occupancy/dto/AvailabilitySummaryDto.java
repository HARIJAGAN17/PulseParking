package com.parkpulse.occupancy.dto;

import java.time.Instant;
import java.util.List;

public record AvailabilitySummaryDto(
    long totalConfiguredSpaces,
    long usableCapacity,
    long availableSpaces,
    long occupiedSpaces,
    long outOfServiceSpaces,
    double availabilityPercentage,
    List<BuildingAvailabilityDto> buildings,
    Instant timestamp
) {}

