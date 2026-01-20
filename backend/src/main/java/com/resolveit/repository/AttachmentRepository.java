package com.resolveit.repository;

import com.resolveit.model.Attachment;
import com.resolveit.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByComplaint(Complaint complaint);
}
