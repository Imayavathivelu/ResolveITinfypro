package com.resolveit.repository;

import com.resolveit.model.Complaint;
import com.resolveit.model.ComplaintTimeline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintTimelineRepository extends JpaRepository<ComplaintTimeline, Long> {
    List<ComplaintTimeline> findByComplaintOrderByTimestampDesc(Complaint complaint);
}
