package com.parkpulse.simulation;

import com.parkpulse.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/simulation")
@PreAuthorize("hasRole('ADMIN')")
public class SimulationController {

    private final SimulationService simulationService;

    public SimulationController(SimulationService simulationService) {
        this.simulationService = simulationService;
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<SimulationStatusDto>> getStatus() {
        return ResponseEntity.ok(ApiResponse.ok(simulationService.getStatus()));
    }

    @PostMapping("/start")
    public ResponseEntity<ApiResponse<Void>> start(@RequestParam(defaultValue = "5") int intervalSeconds) {
        simulationService.startAutoSimulation(intervalSeconds);
        return ResponseEntity.ok(ApiResponse.message("Auto simulation started with " + intervalSeconds + "s interval"));
    }

    @PostMapping("/stop")
    public ResponseEntity<ApiResponse<Void>> stop() {
        simulationService.stopAutoSimulation();
        return ResponseEntity.ok(ApiResponse.message("Auto simulation stopped"));
    }

    @PostMapping("/trigger-arrival")
    public ResponseEntity<ApiResponse<String>> triggerArrival() {
        return simulationService.triggerArrival()
                .map(a -> ResponseEntity.ok(ApiResponse.ok("Simulated arrival created", a.getPlateRaw())))
                .orElseGet(() -> ResponseEntity.ok(ApiResponse.message("No available parking spaces for simulated arrival.")));
    }

    @PostMapping("/trigger-departure")
    public ResponseEntity<ApiResponse<Void>> triggerDeparture() {
        boolean released = simulationService.triggerDeparture();
        if (released) {
            return ResponseEntity.ok(ApiResponse.message("Simulated departure triggered"));
        } else {
            return ResponseEntity.ok(ApiResponse.message("No active simulated vehicles to release"));
        }
    }

    @PostMapping("/reset")
    public ResponseEntity<ApiResponse<Void>> reset() {
        simulationService.resetSimulationData();
        return ResponseEntity.ok(ApiResponse.message("Simulation data successfully purged. Real operational data is completely preserved."));
    }
}

