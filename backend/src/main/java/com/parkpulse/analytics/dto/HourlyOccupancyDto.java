package com.parkpulse.analytics.dto;

public record HourlyOccupancyDto(
    int hour,
    String label,
    double occupancyRate,
    long activityCount
) {}

