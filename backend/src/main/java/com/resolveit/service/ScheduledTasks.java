package com.resolveit.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class ScheduledTasks {

    private final ComplaintService complaintService;

    @Autowired
    public ScheduledTasks(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    /**
     * Check for complaints that need escalation every hour
     */
    @Scheduled(fixedRate = 3600000)
    public void performEscalationCheck() {
        complaintService.checkAndEscalateComplaints();
    }
}
