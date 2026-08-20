# Architecture Overview

## System Architecture

```
┌─────────────────────┐     HTTP / WebSocket      ┌─────────────────────────┐
│                     │ ◄──────────────────────► │                         │
│   React Frontend    │                           │  Spring Boot Backend    │
│   (Vite, TypeScript)│                           │  (REST API + WebSocket) │
│                     │                           │                         │
│   Port: 5173        │                           │   Port: 8080            │
└─────────────────────┘                           └───────────┬─────────────┘
                                                              │
                                                     JPA / JDBC
                                                              │
                                                   ┌──────────▼─────────────┐
                                                   │                       │
                                                   │   MySQL Database      │
                                                   │                       │
                                                   │   Port: 3306          │
                                                   └───────────────────────┘
```

## Layers

### Frontend (React + Vite)
- **Pages** — route-level components (`src/pages/`)
- **Components** — shared UI elements (`src/components/`)
- **API** — Axios HTTP client with interceptors (`src/api/`)
- **Hooks** — custom React hooks (`src/hooks/`)
- **Types** — shared TypeScript interfaces (`src/types/`)

### Backend (Spring Boot)
- **Controller** — REST endpoints, request validation
- **Service** — business logic, transactional operations
- **Repository** — Spring Data JPA interfaces
- **Model** — JPA entities and enums
- **DTO** — request/response transfer objects
- **Security** — JWT token provider, authentication filter
- **Config** — CORS, WebSocket, Security, and application configuration
- **Exception** — global error handling

### Database (MySQL)
- Dev: `event_management_dev`
- Prod: `event_management` (managed externally)
- Schema managed via Hibernate DDL auto (dev) / validate (prod)

## Communication

| Protocol | Path | Purpose |
|----------|------|---------|
| REST     | `/api/auth/*` | Authentication (register, login, refresh) |
| REST     | `/api/events/*` | Event CRUD |
| WebSocket | `/ws` | Real-time event updates (STOMP) |

## Authentication Flow

1. User registers or logs in via `POST /api/auth/login`
2. Server returns `accessToken` (24h) + `refreshToken` (7d)
3. Frontend stores tokens in localStorage
4. Every request includes `Authorization: Bearer <accessToken>`
5. `JwtAuthenticationFilter` validates token and sets security context
6. On 401, frontend clears tokens and redirects to `/login`
