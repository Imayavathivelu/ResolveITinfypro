package com.resolveit.repository;

import com.resolveit.model.Escalation;
import com.resolveit.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EscalationRepository extends JpaRepository<Escalation, Long> {
    Optional<Escalation> findByComplaintAndIsResolvedFalse(Complaint complaint);
}
