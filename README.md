# Planora 📅

Planora is a modern full-stack calendar application designed to manage schedules across the years **2000–2099**.

It provides a powerful event engine with recurrence support, reminders, secure authentication, and a complete admin control panel for user management and system monitoring.

Built using **React + TypeScript (Frontend)** and **Node.js + Express + PostgreSQL (Backend)**, Planora follows production-grade architecture, strong security practices, and scalable design principles.

---

## 🚀 Key Features

- Month / Week / Day / Agenda calendar views
- Event creation with recurrence rules
- Reminder system
- ICS import & export
- Role-based authentication (User/Admin)
- Admin dashboard with KPIs
- User management (ban, role change)
- Audit logs for system tracking
- Strict date validation (2000–2099 enforced)
- Docker-ready setup

---

## 🛠 Tech Stack

**Frontend**
- React
- TypeScript
- Vite
- Tailwind CSS
- FullCalendar

**Backend**
- Node.js
- Express
- TypeScript
- Prisma ORM

**Database**
- PostgreSQL

**Security**
- JWT Authentication (Access + Refresh Tokens)
- Bcrypt Password Hashing
- Rate Limiting
- Input Validation (Zod)

---

## 🎯 Project Vision

Planora is built for reliability, performance, and long-term maintainability.  
The goal is to create a scalable calendar platform that enforces strict date validation and supports enterprise-ready control mechanisms.

---

## 📌 Date Constraint Rule

All event dates must fall between:

- Minimum: 2000-01-01  
- Maximum: 2099-12-31  

Any date outside this range is automatically rejected.

---

## ⚙️ Future Enhancements

- Dark Mode
- PWA Support
- Calendar Sharing Links
- Cloud Storage (S3 Integration)
- Mobile App Version

---

Planora — Plan smarter. Execute better. 📆


