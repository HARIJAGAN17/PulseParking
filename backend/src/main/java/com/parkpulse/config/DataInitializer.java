package com.parkpulse.config;

import com.parkpulse.building.Building;
import com.parkpulse.building.BuildingRepository;
import com.parkpulse.common.PlateNormalizer;
import com.parkpulse.occupancy.OccupancyEvent;
import com.parkpulse.occupancy.OccupancyEventRepository;
import com.parkpulse.parkingarea.ParkingArea;
import com.parkpulse.parkingarea.ParkingAreaRepository;
import com.parkpulse.parkingassignment.AssignmentOrigin;
import com.parkpulse.parkingassignment.AssignmentStatus;
import com.parkpulse.parkingassignment.ParkingAssignment;
import com.parkpulse.parkingassignment.ParkingAssignmentRepository;
import com.parkpulse.parkingspace.ParkingSpace;
import com.parkpulse.parkingspace.ParkingSpaceRepository;
import com.parkpulse.parkingspace.SpaceStatus;
import com.parkpulse.user.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BuildingRepository buildingRepository;
    private final ParkingAreaRepository parkingAreaRepository;
    private final ParkingSpaceRepository parkingSpaceRepository;
    private final ParkingAssignmentRepository assignmentRepository;
    private final OccupancyEventRepository occupancyEventRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            RoleRepository roleRepository,
            BuildingRepository buildingRepository,
            ParkingAreaRepository parkingAreaRepository,
            ParkingSpaceRepository parkingSpaceRepository,
            ParkingAssignmentRepository assignmentRepository,
            OccupancyEventRepository occupancyEventRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.buildingRepository = buildingRepository;
        this.parkingAreaRepository = parkingAreaRepository;
        this.parkingSpaceRepository = parkingSpaceRepository;
        this.assignmentRepository = assignmentRepository;
        this.occupancyEventRepository = occupancyEventRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        initRoles();
        initUsersAndFacility();
    }

    private void initRoles() {
        if (!roleRepository.existsById(Role.ROLE_ADMIN)) {
            roleRepository.save(new Role(Role.ROLE_ADMIN, "System administrator"));
        }
        if (!roleRepository.existsById(Role.ROLE_VALET)) {
            roleRepository.save(new Role(Role.ROLE_VALET, "Valet operator"));
        }
        if (!roleRepository.existsById(Role.ROLE_EMPLOYEE)) {
            roleRepository.save(new Role(Role.ROLE_EMPLOYEE, "Employee"));
        }
    }

    private void initUsersAndFacility() {
        if (userRepository.existsByEmailIgnoreCase("admin@parkpulse.com")) {
            log.info("Data already seeded. Skipping initialization.");
            return;
        }

        log.info("Seeding realistic sample data for ParkPulse office facility...");

        Role adminRole = roleRepository.findById(Role.ROLE_ADMIN).orElseThrow();
        Role valetRole = roleRepository.findById(Role.ROLE_VALET).orElseThrow();
        Role empRole = roleRepository.findById(Role.ROLE_EMPLOYEE).orElseThrow();

        // 1. Initial Admin
        User admin = new User(
                "admin@parkpulse.com",
                passwordEncoder.encode("Admin@123456"),
                "Facility Admin",
                "+91 99000 11223",
                null,
                null,
                UserStatus.APPROVED);
        admin.getRoles().add(adminRole);
        userRepository.save(admin);

        // 2. Initial Valet
        User valet = new User(
                "valet@parkpulse.com",
                passwordEncoder.encode("Valet@123456"),
                "David Valet",
                "+91 98765 43210",
                null,
                null,
                UserStatus.APPROVED);
        valet.getRoles().add(valetRole);
        userRepository.save(valet);

        // 3. Approved Employee with parked vehicle
        User sarah = new User(
                "sarah.chen@acme.com",
                passwordEncoder.encode("Employee@123456"),
                "Sarah Chen",
                "+91 98765 00001",
                "KA01AB1234",
                PlateNormalizer.normalize("KA01AB1234"),
                UserStatus.APPROVED);
        sarah.getRoles().add(empRole);
        userRepository.save(sarah);

        // 4. Approved Employee without parked vehicle
        User david = new User(
                "david.miller@acme.com",
                passwordEncoder.encode("Employee@123456"),
                "David Miller",
                "+91 98765 00002",
                "KA03CD5678",
                PlateNormalizer.normalize("KA03CD5678"),
                UserStatus.APPROVED);
        david.getRoles().add(empRole);
        userRepository.save(david);

        // 5. Pending Employee (awaiting approval)
        User alex = new User(
                "alex.kumar@acme.com",
                passwordEncoder.encode("Employee@123456"),
                "Alex Kumar",
                "+91 98765 00003",
                "MH02EF9012",
                PlateNormalizer.normalize("MH02EF9012"),
                UserStatus.PENDING);
        alex.getRoles().add(empRole);
        userRepository.save(alex);

        // 6. Building: Vismaya Building
        Building vismaya = new Building(
                "Vismaya Building",
                "VSM-01",
                "Sector 5, Outer Ring Road, Tech Corridor",
                1);
        buildingRepository.save(vismaya);

        // 7. Floors / Parking Areas
        ParkingArea b1 = parkingAreaRepository.save(new ParkingArea(vismaya, "Basement 1", "B1", 1));
        ParkingArea gf = parkingAreaRepository.save(new ParkingArea(vismaya, "Ground Floor", "GF", 2));
        ParkingArea l1 = parkingAreaRepository.save(new ParkingArea(vismaya, "Floor 1", "L1", 3));

        // 8. Spaces
        // Basement 1 (B1-01 to B1-06)
        for (int i = 1; i <= 6; i++) {
            ParkingSpace space = new ParkingSpace(b1, String.format("B1-%02d", i), i);
            if (i == 5) {
                space.setStatus(SpaceStatus.OUT_OF_SERVICE);
            }
            space = parkingSpaceRepository.save(space);
            occupancyEventRepository.save(new OccupancyEvent(space, null, "NONE", space.getStatus().name(), "SYSTEM"));
        }

        // Ground Floor (GF-01 to GF-08)
        ParkingSpace sarahSpace = null;
        for (int i = 1; i <= 8; i++) {
            ParkingSpace space = new ParkingSpace(gf, String.format("GF-%02d", i), i);
            if (i == 3) {
                space.setStatus(SpaceStatus.OCCUPIED);
            }
            space = parkingSpaceRepository.save(space);
            if (i == 3) {
                sarahSpace = space;
            }
            occupancyEventRepository.save(new OccupancyEvent(space, null, "NONE", space.getStatus().name(), "SYSTEM"));
        }

        // Floor 1 (L1-01 to L1-06)
        for (int i = 1; i <= 6; i++) {
            ParkingSpace space = new ParkingSpace(l1, String.format("L1-%02d", i), i);
            space = parkingSpaceRepository.save(space);
            occupancyEventRepository.save(new OccupancyEvent(space, null, "NONE", space.getStatus().name(), "SYSTEM"));
        }

        // 9. Active Assignment for Sarah Chen in GF-03
        if (sarahSpace != null) {
            ParkingAssignment assignment = new ParkingAssignment(
                    sarahSpace,
                    sarah,
                    valet,
                    "KA01AB1234",
                    PlateNormalizer.normalize("KA01AB1234"),
                    false,
                    null,
                    AssignmentOrigin.VALET);
            assignment.setAssignedAt(Instant.now().minus(2, ChronoUnit.HOURS));
            assignment = assignmentRepository.save(assignment);

            occupancyEventRepository.save(new OccupancyEvent(
                    sarahSpace,
                    assignment,
                    SpaceStatus.AVAILABLE.name(),
                    SpaceStatus.OCCUPIED.name(),
                    "VALET"));
        }

        log.info("Data seeding finished successfully: Vismaya Building configured with 20 parking spaces.");
    }
}