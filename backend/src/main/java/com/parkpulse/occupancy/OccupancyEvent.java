package com.parkpulse.occupancy;

import com.parkpulse.parkingassignment.ParkingAssignment;
import com.parkpulse.parkingspace.ParkingSpace;
import jakarta.persistence.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "occupancy_events")
public class OccupancyEvent implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "space_id", nullable = false)
    private ParkingSpace space;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id")
    private ParkingAssignment assignment;

    @Column(name = "previous_status", nullable = false, length = 30)
    private String previousStatus;

    @Column(name = "new_status", nullable = false, length = 30)
    private String newStatus;

    @Column(nullable = false, length = 20)
    private String origin = "VALET";

    @Column(name = "recorded_at", nullable = false, updatable = false)
    private Instant recordedAt = Instant.now();

    public OccupancyEvent() {}

    public OccupancyEvent(ParkingSpace space, ParkingAssignment assignment, String previousStatus, String newStatus, String origin) {
        this.space = space;
        this.assignment = assignment;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.origin = origin != null ? origin : "VALET";
        this.recordedAt = Instant.now();
    }

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (recordedAt == null) {
            recordedAt = Instant.now();
        }
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

    public ParkingAssignment getAssignment() {
        return assignment;
    }

    public void setAssignment(ParkingAssignment assignment) {
        this.assignment = assignment;
    }

    public String getPreviousStatus() {
        return previousStatus;
    }

    public void setPreviousStatus(String previousStatus) {
        this.previousStatus = previousStatus;
    }

    public String getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(String newStatus) {
        this.newStatus = newStatus;
    }

    public String getOrigin() {
        return origin;
    }

    public void setOrigin(String origin) {
        this.origin = origin;
    }

    public Instant getRecordedAt() {
        return recordedAt;
    }
}

