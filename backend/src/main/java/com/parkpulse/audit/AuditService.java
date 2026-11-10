package com.parkpulse.audit;

import com.parkpulse.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void logAction(User actor, String action, String targetType, String targetId, String details, String ipAddress) {
        // Enforce zero PII in details
        AuditLog log = new AuditLog(actor, action, targetType, targetId, details, ipAddress);
        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<AuditLogDto> listRecentLogs() {
        return auditLogRepository.findRecentAuditLogs().stream()
                .map(AuditLogDto::fromEntity)
                .toList();
    }

    public record AuditLogDto(
            UUID id,
            String actorEmail,
            String actorName,
            String action,
            String targetType,
            String targetId,
            String details,
            String ipAddress,
            Instant createdAt
    ) {
        public static AuditLogDto fromEntity(AuditLog a) {
            return new AuditLogDto(
                    a.getId(),
                    a.getActor() != null ? a.getActor().getEmail() : "SYSTEM",
                    a.getActor() != null ? a.getActor().getFullName() : "System Process",
                    a.getAction(),
                    a.getTargetType(),
                    a.getTargetId(),
                    a.getDetails(),
                    a.getIpAddress(),
                    a.getCreatedAt()
            );
        }
    }
}

