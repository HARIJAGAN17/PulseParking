package com.parkpulse.audit;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    @Query("SELECT a FROM AuditLog a LEFT JOIN FETCH a.actor ORDER BY a.createdAt DESC")
    List<AuditLog> findRecentAuditLogs();
}
