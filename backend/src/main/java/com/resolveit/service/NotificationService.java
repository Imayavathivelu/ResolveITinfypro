package com.resolveit.service;

import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    public void sendNotification(String recipient, String subject, String message) {
        // In a real system, this would call an Email/SMS API (e.g., SendGrid, Twilio)
        System.out.println("--------------------------------------------------");
        System.out.println("NOTIFICATION SENT TO: " + recipient);
        System.out.println("SUBJECT: " + subject);
        System.out.println("MESSAGE: " + message);
        System.out.println("--------------------------------------------------");
    }
}
