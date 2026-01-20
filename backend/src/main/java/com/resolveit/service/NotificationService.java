package com.resolveit.service;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificationService {

    private final com.resolveit.repository.NotificationRepository notificationRepository;
    private final com.resolveit.repository.UserRepository userRepository;
    private final com.resolveit.repository.ComplaintRepository complaintRepository;

    @org.springframework.beans.factory.annotation.Autowired
    public NotificationService(com.resolveit.repository.NotificationRepository notificationRepository,
            com.resolveit.repository.UserRepository userRepository,
            com.resolveit.repository.ComplaintRepository complaintRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.complaintRepository = complaintRepository;
    }

    public void sendNotification(String recipient, String subject, String message) {
        sendNotification(recipient, subject, message, null, com.resolveit.model.Notification.NotificationType.COMMENT);
    }

    public void sendNotification(String recipient, String subject, String message, Long complaintId,
            com.resolveit.model.Notification.NotificationType type) {
        // Log to console (Mock for Email/SMS)
        System.out.println("--------------------------------------------------");
        System.out.println("NOTIFICATION SENT TO: " + recipient);
        System.out.println("SUBJECT: " + subject);
        System.out.println("MESSAGE: " + message);
        System.out.println("--------------------------------------------------");

        // Persist to DB for In-App Alert
        userRepository.findByEmail(recipient).ifPresent(user -> {
            com.resolveit.model.Notification notification = new com.resolveit.model.Notification();
            notification.setUser(user);
            notification.setTitle(subject);
            notification.setMessage(message);
            notification.setNotificationType(type);
            notification.setIsRead(false);

            if (complaintId != null) {
                complaintRepository.findById(complaintId).ifPresent(notification::setComplaint);
            }

            notificationRepository.save(notification);
        });
    }

    public List<com.resolveit.model.Notification> getNotificationsForUser(String email) {
        return userRepository.findByEmail(email)
                .map(notificationRepository::findByUserOrderByCreatedAtDesc)
                .orElse(java.util.Collections.emptyList());
    }

    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
        });
    }
}
