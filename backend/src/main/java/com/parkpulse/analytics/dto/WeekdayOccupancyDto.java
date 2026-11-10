package com.parkpulse.analytics.dto;

public record WeekdayOccupancyDto(
    int dayNumber, // 1 = Monday, 7 = Sunday
    String dayName,
    double averageOccupancyRate
) {}

