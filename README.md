# ResolveIT - Online Complaint and Grievance Portal

## Project Overview
ResolveIT is a comprehensive grievance and feedback management system designed to bring transparency and efficiency to institutional complaint handling. The platform enables users to submit complaints (anonymously or publicly), track their status in real-time, and escalate unresolved issues when necessary.

## Project Statement
Institutions often lack transparency and efficiency in handling grievances. This platform allows users to submit complaints (anonymously or publicly), track statuses, and escalate unresolved issues, while admins manage the resolution process.

## Key Features
- **Anonymous or Verified Submissions**: Users can choose to submit complaints anonymously or with their account
- **Real-time Status Tracking**: Track complaint resolution through multiple stages
- **Evidence Attachment**: Upload supporting documents and images
- **Smart Escalation**: Automatic escalation of unresolved complaints
- **Admin Dashboard**: Comprehensive management interface for administrators
- **Analytics & Reports**: Visual dashboards and exportable logs (CSV/PDF)

## Technology Stack
- **Backend**: Java Spring Boot
- **Frontend**: React (Vite)
- **Database**: PostgreSQL (v15+)
- **Build Tool**: Maven / npm
- **Architecture**: Micro-services style (Shared Proxy)
- **Authentication**: Spring Security with JWT

 **Run Backend**
```bash
cd backend
mvn spring-boot:run
```

 **Run Frontend**
```bash
cd frontend
npm install
npm run dev
