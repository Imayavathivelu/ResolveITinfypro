package com.resolveit.controller;

import com.resolveit.service.ComplaintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {

    private final ComplaintService complaintService;

    @Autowired
    public TestController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    /**
     * Trigger the escalation logic manually.
     * Note: This will only escalate complaints older than 48h.
     * To test with newer complaints, you can change their createdAt date in the
     * database.
     */
    @PostMapping("/trigger-escalation")
    public ResponseEntity<String> triggerEscalation() {
        complaintService.checkAndEscalateComplaints();
        return ResponseEntity.ok("Escalation check triggered successfully. Check logs for details.");
    }
}
