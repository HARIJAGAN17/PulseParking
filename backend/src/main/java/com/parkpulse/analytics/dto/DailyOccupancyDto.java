package com.parkpulse.analytics.dto;

import java.time.LocalDate;

public record DailyOccupancyDto(
    LocalDate date,
    String dayOfWeek,
    double occupancyRate,
    long assignmentsCount
) {}

