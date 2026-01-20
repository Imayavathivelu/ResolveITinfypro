package com.resolveit.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Escalation Entity
 * Tracks escalated complaints to higher authorities
 */
@Entity
@Table(name = "escalations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Escalation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "escalation_id")
    private Long escalationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "escalated_from")
    private User escalatedFrom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "escalated_to")
    private User escalatedTo;

    @Column(name = "escalation_reason", columnDefinition = "TEXT")
    private String escalationReason;

    @Column(name = "escalation_level")
    private Integer escalationLevel = 1;

    @Column(name = "is_resolved")
    private Boolean isResolved = false;

    @CreationTimestamp
    @Column(name = "escalated_at", updatable = false)
    private LocalDateTime escalatedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
}
