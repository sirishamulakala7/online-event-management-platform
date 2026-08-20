# Online Event Management Platform

A full-stack Online Event Management Platform built with React, Spring Boot, MySQL, and WebSockets.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, TypeScript, React Router, Axios |
| Backend | Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA |
| Database | MySQL 8.0 |
| Auth | JWT (access + refresh tokens) |
| Real-time | WebSocket (STOMP) |

## Project Structure

```
├── frontend/          # React + Vite (port 5173)
├── backend/           # Spring Boot + Maven (port 8080)
└── docs/              # Architecture, API design, schema docs
```

## Quick Start

See [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md) for full setup instructions.

```bash
# Backend
cd backend && mvn spring-boot:run

# Frontend
cd frontend && npm install && npm run dev
```

## Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [API Design](docs/API_DESIGN.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [Setup Guide](docs/SETUP_GUIDE.md)
