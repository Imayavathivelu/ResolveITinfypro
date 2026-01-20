package com.resolveit.service;

import com.resolveit.model.Complaint;
import com.resolveit.model.User;
import com.resolveit.repository.ComplaintRepository;
import com.resolveit.repository.AttachmentRepository;
import com.resolveit.repository.ComplaintTimelineRepository;
import com.resolveit.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final AttachmentRepository attachmentRepository;
    private final ComplaintTimelineRepository timelineRepository;
    private final UserRepository userRepository;
    private final FileService fileService;
    private final NotificationService notificationService;

    @Autowired
    public ComplaintService(ComplaintRepository complaintRepository,
            AttachmentRepository attachmentRepository,
            FileService fileService,
            ComplaintTimelineRepository timelineRepository,
            UserRepository userRepository,
            NotificationService notificationService) {
        this.complaintRepository = complaintRepository;
        this.attachmentRepository = attachmentRepository;
        this.fileService = fileService;
        this.timelineRepository = timelineRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public List<Complaint> getComplaintsByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return complaintRepository.findByUser(user);
    }

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    public Optional<Complaint> getComplaintById(Long id) {
        return complaintRepository.findById(id);
    }

    @Transactional
    public Complaint createComplaint(Complaint complaint) {
        if (complaint.getStatus() == null) {
            complaint.setStatus(Complaint.Status.NEW);
        }
        Complaint saved = complaintRepository.save(complaint);
        addTimelineEntry(saved, "NEW", "Complaint submitted.");

        String recipient = null;
        if (saved.getUser() != null) {
            recipient = saved.getUser().getEmail();
        } else if (saved.getIsAnonymous() && saved.getAnonymousEmail() != null) {
            recipient = saved.getAnonymousEmail();
        }

        if (recipient != null) {
            notificationService.sendNotification(recipient, "Complaint Submitted",
                    "Your complaint #" + saved.getComplaintId() + " has been received.");
        }
        return saved;
    }

    @Transactional
    public void addTimelineEntry(Complaint complaint, String status, String comment) {
        com.resolveit.model.ComplaintTimeline timeline = new com.resolveit.model.ComplaintTimeline();
        timeline.setComplaint(complaint);
        timeline.setStatus(status);
        timeline.setComment(comment);
        timeline.setIsPublic(true);
        timelineRepository.save(timeline);
    }

    @Transactional
    public Complaint createComplaintWithAttachment(Complaint complaint,
            org.springframework.web.multipart.MultipartFile file) {
        if (complaint.getStatus() == null) {
            complaint.setStatus(Complaint.Status.NEW);
        }
        Complaint savedComplaint = complaintRepository.save(complaint);
        addTimelineEntry(savedComplaint, "NEW", "Complaint submitted with evidence.");

        if (file != null && !file.isEmpty()) {
            String storedFileName = fileService.storeFile(file);
            com.resolveit.model.Attachment attachment = new com.resolveit.model.Attachment();
            attachment.setComplaint(savedComplaint);
            attachment.setFileName(file.getOriginalFilename());
            attachment.setFilePath(storedFileName);
            attachment.setFileType(file.getContentType());
            attachment.setFileSize(file.getSize());
            attachmentRepository.save(attachment);
        }

        String recipient = null;
        if (savedComplaint.getUser() != null) {
            recipient = savedComplaint.getUser().getEmail();
        } else if (Boolean.TRUE.equals(savedComplaint.getIsAnonymous()) && savedComplaint.getAnonymousEmail() != null) {
            recipient = savedComplaint.getAnonymousEmail();
        }

        if (recipient != null) {
            notificationService.sendNotification(recipient, "Complaint Submitted",
                    "Your complaint #" + savedComplaint.getComplaintId() + " has been received with evidence.");
        }

        return savedComplaint;
    }

    public List<com.resolveit.model.ComplaintTimeline> getTimeline(Long complaintId, boolean isAdmin) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        List<com.resolveit.model.ComplaintTimeline> timeline = timelineRepository
                .findByComplaintOrderByTimestampDesc(complaint);
        if (!isAdmin) {
            return timeline.stream().filter(t -> Boolean.TRUE.equals(t.getIsPublic()))
                    .collect(java.util.stream.Collectors.toList());
        }
        return timeline;
    }

    @Transactional
    public Complaint updateComplaint(Long id, Complaint complaintDetails) {
        return complaintRepository.findById(id).map(complaint -> {
            String oldStatus = complaint.getStatus().name();
            complaint.setTitle(complaintDetails.getTitle());
            complaint.setDescription(complaintDetails.getDescription());
            complaint.setCategory(complaintDetails.getCategory());
            complaint.setPriority(complaintDetails.getPriority());
            complaint.setStatus(complaintDetails.getStatus());
            complaint.setIsAnonymous(complaintDetails.getIsAnonymous());
            complaint.setAnonymousEmail(complaintDetails.getAnonymousEmail());

            Complaint updated = complaintRepository.save(complaint);
            if (!oldStatus.equals(updated.getStatus().name())) {
                addTimelineEntry(updated, updated.getStatus().name(), "Status updated to " + updated.getStatus());
            }
            return updated;
        }).orElseThrow(() -> new RuntimeException("Complaint not found with id " + id));
    }

    public java.util.Map<String, Object> getStatistics() {
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("total", complaintRepository.count());
        stats.put("open", complaintRepository.countByStatus(Complaint.Status.NEW) +
                complaintRepository.countByStatus(Complaint.Status.IN_PROGRESS) +
                complaintRepository.countByStatus(Complaint.Status.UNDER_REVIEW));
        stats.put("resolved", complaintRepository.countByStatus(Complaint.Status.RESOLVED));
        stats.put("closed", complaintRepository.countByStatus(Complaint.Status.CLOSED));

        List<Object[]> categoryCounts = complaintRepository.countByCategory();
        java.util.Map<String, Long> catMap = new java.util.HashMap<>();
        for (Object[] row : categoryCounts) {
            catMap.put((String) row[0], (Long) row[1]);
        }
        stats.put("categories", catMap);

        return stats;
    }

    public String exportToCsv() {
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Title,Category,Status,Priority,CreatedAt,ResolvedAt,User,AssignedTo\n");
        List<Complaint> all = complaintRepository.findAll();
        for (Complaint c : all) {
            csv.append(c.getComplaintId()).append(",");
            csv.append("\"").append(c.getTitle().replace("\"", "\"\"")).append("\",");
            csv.append(c.getCategory()).append(",");
            csv.append(c.getStatus()).append(",");
            csv.append(c.getPriority()).append(",");
            csv.append(c.getCreatedAt()).append(",");
            csv.append(c.getResolvedAt() != null ? c.getResolvedAt() : "").append(",");
            csv.append(c.getUser() != null ? c.getUser().getEmail() : (c.getIsAnonymous() ? "Anonymous" : ""))
                    .append(",");
            csv.append(c.getAssignedTo() != null ? c.getAssignedTo().getFullName() : "").append("\n");
        }
        return csv.toString();
    }

    @Transactional
    public Complaint assignComplaint(Long id, Long userId) {
        User technician = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Technician not found"));

        return complaintRepository.findById(id).map(complaint -> {
            complaint.setAssignedTo(technician);
            complaint.setStatus(Complaint.Status.IN_PROGRESS);
            Complaint updated = complaintRepository.save(complaint);
            addTimelineEntry(updated, "IN_PROGRESS", "Complaint assigned to " + technician.getFullName());
            notificationService.sendNotification(updated.getUser().getEmail(), "Technician Assigned", "Your complaint #"
                    + updated.getComplaintId() + " has been assigned to " + technician.getFullName());
            notificationService.sendNotification(technician.getEmail(), "New Complaint Assigned",
                    "You have been assigned a new complaint: #" + updated.getComplaintId());
            return updated;
        }).orElseThrow(() -> new RuntimeException("Complaint not found"));
    }

    @Transactional
    public void addComment(Long id, String comment, String userEmail, boolean isPublic) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        complaintRepository.findById(id).ifPresent(complaint -> {
            com.resolveit.model.ComplaintTimeline timeline = new com.resolveit.model.ComplaintTimeline();
            timeline.setComplaint(complaint);
            timeline.setStatus(complaint.getStatus().name());
            timeline.setComment(comment);
            timeline.setUpdatedBy(user);
            timeline.setIsPublic(isPublic);
            timelineRepository.save(timeline);
        });
    }

    @Transactional
    public void checkAndEscalateComplaints() {
        java.time.LocalDateTime threshold = java.time.LocalDateTime.now().minusHours(48);
        List<Complaint> slowComplaints = complaintRepository.findByStatusInAndCreatedAtBefore(
                java.util.Arrays.asList(Complaint.Status.NEW, Complaint.Status.UNDER_REVIEW),
                threshold);

        for (Complaint complaint : slowComplaints) {
            complaint.setStatus(Complaint.Status.ESCALATED);
            complaint.setPriority(Complaint.Priority.CRITICAL);
            complaintRepository.save(complaint);
            addTimelineEntry(complaint, "ESCALATED", "Automatically escalated due to SLA breach (48h).");

            // Notify User
            String userEmail = complaint.getUser() != null ? complaint.getUser().getEmail()
                    : complaint.getAnonymousEmail();
            if (userEmail != null) {
                notificationService.sendNotification(userEmail, "Complaint Escalated",
                        "Your complaint #" + complaint.getComplaintId()
                                + " has been escalated to senior management for priority resolution.");
            }

            // Notify Assigned Technician (if any)
            if (complaint.getAssignedTo() != null) {
                notificationService.sendNotification(complaint.getAssignedTo().getEmail(),
                        "Complaint Escalated - Urgency Critical",
                        "A complaint assigned to you (#" + complaint.getComplaintId()
                                + ") has been escalated due to SLA breach.");
            }

            // Notify Senior Admin (Mocked as a generic admin email for now)
            notificationService.sendNotification("senior-admin@resolveit.com",
                    "Urgent: ESCALATION #" + complaint.getComplaintId(),
                    "A complaint has breached the 48h SLA and requires immediate attention.");
        }
    }

    @Transactional
    public Complaint resolveComplaint(Long id, String comment, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail).orElseThrow();
        return complaintRepository.findById(id).map(complaint -> {
            complaint.setStatus(Complaint.Status.RESOLVED);
            complaint.setResolvedAt(java.time.LocalDateTime.now());
            Complaint updated = complaintRepository.save(complaint);
            addTimelineEntry(updated, "RESOLVED", comment != null ? comment : "Grievance has been resolved.");
            notificationService.sendNotification(updated.getUser().getEmail(), "Grievance Resolved", "Your grievance #"
                    + updated.getComplaintId() + " has been marked as resolved. Please review the solution.");
            return updated;
        }).orElseThrow(() -> new RuntimeException("Complaint not found"));
    }

    @Transactional
    public Complaint closeComplaint(Long id, String comment, String userEmail) {
        return complaintRepository.findById(id).map(complaint -> {
            complaint.setStatus(Complaint.Status.CLOSED);
            Complaint updated = complaintRepository.save(complaint);
            addTimelineEntry(updated, "CLOSED", comment != null ? comment : "User acknowledged the resolution.");
            return updated;
        }).orElseThrow(() -> new RuntimeException("Complaint not found"));
    }

    @Transactional
    public Complaint reopenComplaint(Long id, String reason, String userEmail) {
        return complaintRepository.findById(id).map(complaint -> {
            complaint.setStatus(Complaint.Status.IN_PROGRESS);
            Complaint updated = complaintRepository.save(complaint);
            addTimelineEntry(updated, "REOPENED", "Grievance reopened: " + reason);
            return updated;
        }).orElseThrow(() -> new RuntimeException("Complaint not found"));
    }

    @Transactional
    public void deleteComplaint(Long id) {
        complaintRepository.deleteById(id);
    }
}
