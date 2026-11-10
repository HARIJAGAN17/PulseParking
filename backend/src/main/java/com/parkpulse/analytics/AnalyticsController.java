package com.parkpulse.analytics;

import com.parkpulse.analytics.dto.AnalyticsOverviewDto;
import com.parkpulse.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/analytics")
@PreAuthorize("hasRole('ADMIN')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<AnalyticsOverviewDto>> getOverview(
            @RequestParam(defaultValue = "false") boolean includeSimulation
    ) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getOverview(includeSimulation)));
    }
}

