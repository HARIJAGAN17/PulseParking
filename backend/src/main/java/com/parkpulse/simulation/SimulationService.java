package com.parkpulse.simulation;

import com.parkpulse.audit.AuditService;
import com.parkpulse.occupancy.OccupancyEventRepository;
import com.parkpulse.occupancy.OccupancyService;
import com.parkpulse.parkingassignment.AssignmentOrigin;
import com.parkpulse.parkingassignment.AssignmentStatus;
import com.parkpulse.parkingassignment.ParkingAssignment;
import com.parkpulse.parkingassignment.ParkingAssignmentRepository;
import com.parkpulse.parkingassignment.ParkingAssignmentService;
import com.parkpulse.parkingassignment.dto.ValetAssignRequest;
import com.parkpulse.parkingspace.ParkingSpace;
import com.parkpulse.parkingspace.ParkingSpaceRepository;
import com.parkpulse.parkingspace.SpaceStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
public class SimulationService {

    private static final Logger log = LoggerFactory.getLogger(SimulationService.class);

    private final ParkingSpaceRepository spaceRepository;
    private final ParkingAssignmentRepository assignmentRepository;
    private final OccupancyEventRepository occupancyEventRepository;
    private final ParkingAssignmentService assignmentService;
    private final OccupancyService occupancyService;
    private final AuditService auditService;

    private final AtomicBoolean isRunning = new AtomicBoolean(false);
    private int intervalSeconds = 5;
    private final Random random = new Random();

    public SimulationService(
            ParkingSpaceRepository spaceRepository,
            ParkingAssignmentRepository assignmentRepository,
            OccupancyEventRepository occupancyEventRepository,
            ParkingAssignmentService assignmentService,
            OccupancyService occupancyService,
            AuditService auditService) {
        this.spaceRepository = spaceRepository;
        this.assignmentRepository = assignmentRepository;
        this.occupancyEventRepository = occupancyEventRepository;
        this.assignmentService = assignmentService;
        this.occupancyService = occupancyService;
        this.auditService = auditService;
    }

    public void startAutoSimulation(int interval) {
        this.intervalSeconds = Math.max(2, interval);
        this.isRunning.set(true);
        log.info("Auto simulation started with interval {}s", intervalSeconds);
    }

    public void stopAutoSimulation() {
        this.isRunning.set(false);
        log.info("Auto simulation stopped");
    }

    public SimulationStatusDto getStatus() {
        long activeSim = assignmentRepository.countByOriginAndStatus(AssignmentOrigin.SIMULATION,
                AssignmentStatus.ACTIVE);
        long totalEvents = occupancyEventRepository.findByOrigin("SIMULATION").size();
        return new SimulationStatusDto(isRunning.get(), intervalSeconds, activeSim, totalEvents);
    }

    @Scheduled(fixedDelay = 5000)
    public void scheduledTick() {
        if (!isRunning.get()) {
            return;
        }

        try {
            // Randomly decide whether to park or release
            boolean doArrival = random.nextDouble() > 0.45;
            if (doArrival) {
                triggerArrival();
            } else {
                triggerDeparture();
            }
        } catch (Exception ex) {
            log.debug("Simulation tick skipped: {}", ex.getMessage());
        }
    }

    @Transactional
    public Optional<ParkingAssignment> triggerArrival() {
        List<ParkingSpace> availableSpaces = spaceRepository.findAll().stream()
                .filter(s -> s.isActive() && s.getStatus() == SpaceStatus.AVAILABLE)
                .toList();

        if (availableSpaces.isEmpty()) {
            log.debug("Simulation: No available spaces for arrival.");
            return Optional.empty();
        }

        ParkingSpace space = availableSpaces.get(random.nextInt(availableSpaces.size()));
        String simPlate = "SIM-" + (1000 + random.nextInt(9000));

        ValetAssignRequest req = new ValetAssignRequest(
                space.getId(),
                null,
                simPlate,
                true,
                "Simulated arrival event");

        ParkingAssignment assignment = assignmentService.assignVehicle(req, null, "127.0.0.1",
                AssignmentOrigin.SIMULATION);
        log.info("Simulation: Assigned space {} to {}", space.getSpaceLabel(), simPlate);
        return Optional.of(assignment);
    }

    @Transactional
    public boolean triggerDeparture() {
        List<ParkingAssignment> activeSimAssignments = assignmentRepository
                .findByOriginAndStatus(AssignmentOrigin.SIMULATION, AssignmentStatus.ACTIVE);

        if (activeSimAssignments.isEmpty()) {
            log.debug("Simulation: No active simulated vehicles to release.");
            return false;
        }

        ParkingAssignment assignment = activeSimAssignments.get(random.nextInt(activeSimAssignments.size()));
        assignmentService.releaseVehicle(assignment.getId(), null, "127.0.0.1");
        log.info("Simulation: Released vehicle {}", assignment.getPlateRaw());
        return true;
    }

    @Transactional
    public void resetSimulationData() {
        stopAutoSimulation();

        // 1. Release all spaces occupied by simulation
        List<ParkingAssignment> activeSimAssignments = assignmentRepository
                .findByOriginAndStatus(AssignmentOrigin.SIMULATION, AssignmentStatus.ACTIVE);
        for (ParkingAssignment a : activeSimAssignments) {
            ParkingSpace space = a.getSpace();
            space.setStatus(SpaceStatus.AVAILABLE);
            spaceRepository.save(space);

            occupancyService.broadcastOccupancyUpdate(
                    space.getId(),
                    space.getParkingArea().getBuilding().getId(),
                    space.getParkingArea().getId(),
                    SpaceStatus.AVAILABLE,
                    space.getVersion());
        }

        // 2. Delete all simulation occupancy events
        occupancyEventRepository.deleteByOrigin("SIMULATION");

        // 3. Delete all simulation assignments
        List<ParkingAssignment> allSim = assignmentRepository.findByOrigin(AssignmentOrigin.SIMULATION);
        assignmentRepository.deleteAll(allSim);

        auditService.logAction(
                null,
                "SIMULATION_RESET",
                "SYSTEM",
                "SIMULATION",
                "Admin purged all simulated parking data. Real data preserved.",
                "127.0.0.1");

        log.info("Simulation reset completed. Real operations and employees remain 100% untouched.");
    }
}
