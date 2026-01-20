package com.resolveit.repository;

import com.resolveit.model.Complaint;
import com.resolveit.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for Complaint entity
 */
@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    List<Complaint> findByUser(User user);

    List<Complaint> findByStatus(Complaint.Status status);

    List<Complaint> findByCategory(String category);

    List<Complaint> findByPriority(Complaint.Priority priority);

    List<Complaint> findByAssignedTo(User assignedTo);

    List<Complaint> findByIsAnonymous(Boolean isAnonymous);

    List<Complaint> findByStatusInAndCreatedAtBefore(List<Complaint.Status> statuses, LocalDateTime threshold);

    @Query("SELECT c FROM Complaint c WHERE c.status = :status AND c.createdAt < :threshold")
    List<Complaint> findUnresolvedComplaintsOlderThan(
            @Param("status") Complaint.Status status,
            @Param("threshold") LocalDateTime threshold);

    @Query("SELECT c FROM Complaint c WHERE c.user = :user ORDER BY c.createdAt DESC")
    List<Complaint> findByUserOrderByCreatedAtDesc(@Param("user") User user);

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.status = :status")
    Long countByStatus(@Param("status") Complaint.Status status);

    @Query("SELECT c.category, COUNT(c) FROM Complaint c GROUP BY c.category")
    List<Object[]> countByCategory();
}
