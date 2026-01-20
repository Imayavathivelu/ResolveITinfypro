package com.resolveit.controller;

import com.resolveit.model.Complaint;
import com.resolveit.service.ComplaintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/complaints")
@CrossOrigin(origins = "*")
public class ComplaintController {

    private final ComplaintService complaintService;

    @Autowired
    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @GetMapping
    public List<Complaint> getAllComplaints() {
        return complaintService.getAllComplaints();
    }

    @GetMapping("/me")
    public List<Complaint> getMyComplaints(org.springframework.security.core.Authentication authentication) {
        return complaintService.getComplaintsByEmail(authentication.getName());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Complaint> getComplaintById(@PathVariable Long id) {
        return complaintService.getComplaintById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<Complaint> createComplaint(
            @RequestPart("complaint") String complaintJson,
            @RequestPart(value = "file", required = false) org.springframework.web.multipart.MultipartFile file) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            Complaint complaint = mapper.readValue(complaintJson, Complaint.class);
            return ResponseEntity.ok(complaintService.createComplaintWithAttachment(complaint, file));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Complaint> updateComplaint(@PathVariable Long id, @RequestBody Complaint complaintDetails) {
        try {
            return ResponseEntity.ok(complaintService.updateComplaint(id, complaintDetails));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<java.util.Map<String, Object>> getStatistics() {
        return ResponseEntity.ok(complaintService.getStatistics());
    }

    @GetMapping("/export")
    public ResponseEntity<String> exportComplaints() {
        String csv = complaintService.exportToCsv();
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=complaints.csv")
                .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "text/csv")
                .body(csv);
    }

    @GetMapping("/{id}/timeline")
    public List<com.resolveit.model.ComplaintTimeline> getTimeline(@PathVariable Long id,
            org.springframework.security.core.Authentication auth) {
        System.out.println("Timeline endpoint called for complaint ID: " + id);
        System.out.println("Authentication: " + (auth != null ? auth.getName() : "null"));

        boolean isAdmin = false;
        if (auth != null) {
            System.out.println("Authorities: " + auth.getAuthorities());
            isAdmin = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        }

        System.out.println("Is Admin: " + isAdmin);
        return complaintService.getTimeline(id, isAdmin);
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<Complaint> assignComplaint(@PathVariable Long id,
            @RequestBody java.util.Map<String, Long> payload) {
        return ResponseEntity.ok(complaintService.assignComplaint(id, payload.get("userId")));
    }

    @PostMapping("/{id}/comment")
    public ResponseEntity<Void> addComment(@PathVariable Long id, @RequestBody java.util.Map<String, Object> payload,
            org.springframework.security.core.Authentication auth) {
        String comment = (String) payload.get("comment");
        Boolean isPublic = payload.get("isPublic") != null ? (Boolean) payload.get("isPublic") : true;
        complaintService.addComment(id, comment, auth.getName(), isPublic);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/resolve")
    public ResponseEntity<Complaint> resolveComplaint(@PathVariable Long id,
            @RequestBody java.util.Map<String, String> payload, org.springframework.security.core.Authentication auth) {
        return ResponseEntity.ok(complaintService.resolveComplaint(id, payload.get("comment"), auth.getName()));
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<Complaint> closeComplaint(@PathVariable Long id,
            @RequestBody java.util.Map<String, String> payload, org.springframework.security.core.Authentication auth) {
        return ResponseEntity.ok(complaintService.closeComplaint(id, payload.get("comment"), auth.getName()));
    }

    @PostMapping("/{id}/reopen")
    public ResponseEntity<Complaint> reopenComplaint(@PathVariable Long id,
            @RequestBody java.util.Map<String, String> payload, org.springframework.security.core.Authentication auth) {
        return ResponseEntity.ok(complaintService.reopenComplaint(id, payload.get("reason"), auth.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComplaint(@PathVariable Long id) {
        complaintService.deleteComplaint(id);
        return ResponseEntity.noContent().build();
    }
}
