package com.parkpulse.analytics.dto;

import java.util.List;

public record AnalyticsOverviewDto(
    double currentOccupancyRate,
    double averageDailyOccupancyRate,
    int peakHour,
    double peakHourOccupancyRate,
    long totalAssignmentsPastWeek,
    long totalReleasesPastWeek,
    List<HourlyOccupancyDto> hourlyDistribution,
    List<DailyOccupancyDto> dailyTrend,
    List<WeekdayOccupancyDto> weekdayComparison
) {}

