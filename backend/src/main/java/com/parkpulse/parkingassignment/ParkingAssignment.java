package com.parkpulse.parkingassignment;

import com.parkpulse.parkingspace.ParkingSpace;
import com.parkpulse.user.User;
import jakarta.persistence.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "parking_assignments")
public class ParkingAssignment implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "space_id", nullable = false)
    private ParkingSpace space;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    private User employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "valet_id")
    private User valet;

    @Column(name = "plate_raw", nullable = false, length = 30)
    private String plateRaw;

    @Column(name = "plate_normalized", nullable = false, length = 30)
    private String plateNormalized;

    @Column(name = "is_guest", nullable = false)
    private boolean isGuest = false;

    @Column(name = "guest_note", length = 255)
    private String guestNote;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AssignmentStatus status = AssignmentStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AssignmentOrigin origin = AssignmentOrigin.VALET;

    @Column(name = "assigned_at", nullable = false)
    private Instant assignedAt = Instant.now();

    @Column(name = "released_at")
    private Instant releasedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public ParkingAssignment() {}

    public ParkingAssignment(
            ParkingSpace space,
            User employee,
            User valet,
            String plateRaw,
            String plateNormalized,
            boolean isGuest,
            String guestNote,
            AssignmentOrigin origin
    ) {
        this.space = space;
        this.employee = employee;
        this.valet = valet;
        this.plateRaw = plateRaw;
        this.plateNormalized = plateNormalized;
        this.isGuest = isGuest;
        this.guestNote = guestNote;
        this.origin = origin != null ? origin : AssignmentOrigin.VALET;
        this.status = AssignmentStatus.ACTIVE;
        this.assignedAt = Instant.now();
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (assignedAt == null) {
            assignedAt = Instant.now();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (updatedAt == null) {
            updatedAt = Instant.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public ParkingSpace getSpace() {
        return space;
    }

    public void setSpace(ParkingSpace space) {
        this.space = space;
    }

    public User getEmployee() {
        return employee;
    }

    public void setEmployee(User employee) {
        this.employee = employee;
    }

    public User getValet() {
        return valet;
    }

    public void setValet(User valet) {
        this.valet = valet;
    }

    public String getPlateRaw() {
        return plateRaw;
    }

    public void setPlateRaw(String plateRaw) {
        this.plateRaw = plateRaw;
    }

    public String getPlateNormalized() {
        return plateNormalized;
    }

    public void setPlateNormalized(String plateNormalized) {
        this.plateNormalized = plateNormalized;
    }

    public boolean isGuest() {
        return isGuest;
    }

    public void setGuest(boolean guest) {
        isGuest = guest;
    }

    public String getGuestNote() {
        return guestNote;
    }

    public void setGuestNote(String guestNote) {
        this.guestNote = guestNote;
    }

    public AssignmentStatus getStatus() {
        return status;
    }

    public void setStatus(AssignmentStatus status) {
        this.status = status;
    }

    public AssignmentOrigin getOrigin() {
        return origin;
    }

    public void setOrigin(AssignmentOrigin origin) {
        this.origin = origin;
    }

    public Instant getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(Instant assignedAt) {
        this.assignedAt = assignedAt;
    }

    public Instant getReleasedAt() {
        return releasedAt;
    }

    public void setReleasedAt(Instant releasedAt) {
        this.releasedAt = releasedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}

