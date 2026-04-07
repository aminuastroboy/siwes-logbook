# SIWES Logbook Management System — Full-Stack Starter

This is a full-stack starter for a SIWES Logbook Management System with:

- React + Vite frontend
- Express backend
- SQLite database
- JWT authentication
- Role-based access control
- Student log submission
- Supervisor review workflow
- Admin overview

## Roles

- `student`
- `supervisor`
- `admin`

## Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Default Seed Accounts

These are created automatically on first run:

- Admin: `admin@siwes.local` / `password123`
- Supervisor: `supervisor@siwes.local` / `password123`
- Student: `student@siwes.local` / `password123`

## API Summary

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/me`
- `GET /api/logs`
- `POST /api/logs`
- `PUT /api/logs/:id`
- `DELETE /api/logs/:id`
- `GET /api/supervisor/queue`
- `PATCH /api/supervisor/logs/:id/review`
- `GET /api/admin/students`
- `GET /api/admin/summary`

## Notes

- The backend uses `better-sqlite3` for simplicity.
- File uploads are not implemented yet.
- PDF export is not implemented yet.
