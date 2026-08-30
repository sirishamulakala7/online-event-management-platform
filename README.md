# Online Event Management Platform

A full-stack web application for creating, managing, and attending online events with real-time WebSocket chat. Built as a college project using React, Spring Boot, MySQL, and STOMP WebSockets.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Database Design](#database-design)
- [Authentication & JWT Flow](#authentication--jwt-flow)
- [Event Management Flow](#event-management-flow)
- [Registration Flow](#registration-flow)
- [WebSocket Chat Flow](#websocket-chat-flow)
- [REST API Endpoints](#rest-api-endpoints)
- [Frontend Routes](#frontend-routes)
- [Local Setup & Run](#local-setup--run)
- [Testing & Verification Status](#testing--verification-status)
- [Project Structure](#project-structure)

---

## Project Overview

The **Online Event Management Platform** allows users to register, create and manage events, register as attendees, and communicate in real-time via WebSocket chat. The system supports three user roles — **Attendee**, **Organizer**, and **Admin** — each with distinct permissions. Organizers can create, edit, and delete their own events, while attendees can browse published events and register for them. A real-time chat panel on every event detail page lets participants communicate during the event.

---

## Key Features

- **User Registration & Authentication** — Register, login, and logout with JWT-based access and refresh tokens.
- **Role-Based Access Control** — Three roles (Attendee, Organizer, Admin) with enforced permissions at both API and UI levels.
- **Event CRUD** — Organizers can create, update, and delete events with title, description, location, date range, capacity, and status.
- **Event Browsing** — All authenticated users can view published events in a responsive card grid.
- **Attendee Registration** — Users can register for events; duplicate registrations are prevented.
- **My Registrations** — Users can view their registration history and cancel active registrations.
- **Real-Time WebSocket Chat** — Per-event chat rooms powered by STOMP over SockJS; messages are persisted in the database.
- **Responsive UI** — Mobile-first CSS with breakpoints at 768px and 480px.
- **Error & Empty States** — Graceful handling of loading spinners, error alerts, and empty-state messages throughout the UI.
- **JWT Token Refresh** — Automatic access token renewal using refresh tokens.

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript 5.6, Vite 5.4, React Router 6, Axios |
| **Real-Time** | STOMP (via `@stomp/stompjs` 7.3) over SockJS 1.6 |
| **Backend** | Java 17, Spring Boot 3.2.5, Spring Security, Spring Data JPA, Spring WebSocket |
| **Database** | MySQL 8.x (Hibernate `ddl-auto: update`) |
| **Authentication** | JWT (via `jjwt` 0.12.6) — HMAC-SHA256 signed access + refresh tokens |
| **Build Tools** | Maven 3.9 (backend), Vite (frontend), TypeScript compiler |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (Vite)                     │
│                   http://localhost:5173                   │
│                                                         │
│  React SPA  ──Axios──▶  /api proxy  ──▶  Backend:8080   │
│  STOMP Client ──SockJS──▶ /api/ws ──▶  Backend:8080     │
└─────────────────────────┬───────────────────────────────┘
                          │  HTTP / WebSocket
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend (Spring Boot)                    │
│                   http://localhost:8080/api               │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Security    │  │  REST        │  │  WebSocket    │  │
│  │  FilterChain │  │  Controllers │  │  STOMP Broker │  │
│  │  (JWT filter)│  │  (CRUD)      │  │  (Chat)       │  │
│  └──────┬───────┘  └──────┬───────┘  └───────┬───────┘  │
│         │                 │                  │           │
│         └────────┬────────┴──────────────────┘           │
│                  ▼                                       │
│         ┌────────────────┐                               │
│         │  Service Layer │                               │
│         └────────┬───────┘                               │
│                  ▼                                       │
│         ┌────────────────┐                               │
│         │  JPA / Repos   │                               │
│         └────────┬───────┘                               │
└──────────────────┼──────────────────────────────────────┘
                   ▼
         ┌────────────────┐
         │   MySQL 8.x    │
         │  (4 tables)    │
         └────────────────┘
```

The frontend runs on **port 5173** (Vite dev server). All `/api` requests are proxied to the backend on **port 8080**. WebSocket connections go through the same proxy to `/api/ws`.

---

## Database Design

The schema is managed by Hibernate (`ddl-auto: update`) against a MySQL 8.x database named `event_management_dev`. There are **4 tables**:

### ER Diagram

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│    users      │       │    events         │       │  messages     │
│──────────────│       │──────────────────│       │──────────────│
│ id (PK)      │◄──┐   │ id (PK)          │◄──┐   │ id (PK)      │
│ email (UQ)   │   │   │ title            │   │   │ event_id (FK)│──┐
│ password     │   │   │ description      │   │   │ sender_id FK │──┤
│ name         │   │   │ location         │   │   │ content      │  │
│ role         │   │   │ start_date       │   │   │ sent_at      │  │
│ created_at   │   │   │ end_date         │   │   └──────────────┘  │
│ updated_at   │   │   │ max_attendees    │   │                     │
└──────┬───────┘   │   │ organizer_id(FK) │───┘                     │
       │           │   │ status           │                         │
       │           │   │ created_at       │                         │
       │           │   │ updated_at       │                         │
       │           │   └──────────────────┘                         │
       │           │                                                │
       │           │   ┌──────────────────┐                         │
       │           │   │  registrations    │                         │
       │           │   │──────────────────│                         │
       │           └──▶│ user_id (FK)     │                         │
       │               │ event_id (FK)    │─── ┘                    │
       └──────────────▶│ registered_at    │                         │
                       │ status           │                         │
                       │ UQ(user_id,      │                         │
                       │     event_id)    │                         │
                       └──────────────────┘                         │
                                                                    │
       messages.event_id is a plain FK column (no JPA relationship  │
       on the Event entity — queried directly via MessageRepository)│
```

### Table: `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, auto-increment | Unique user identifier |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Login credential |
| `password` | VARCHAR(255) | NOT NULL | BCrypt-hashed password |
| `name` | VARCHAR(255) | NOT NULL | Display name |
| `role` | VARCHAR(255) | NOT NULL | `ATTENDEE` / `ORGANIZER` / `ADMIN` |
| `created_at` | DATETIME | NOT NULL | Auto-set on creation |
| `updated_at` | DATETIME | | Auto-set on update |

### Table: `events`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, auto-increment | Unique event identifier |
| `title` | VARCHAR(255) | NOT NULL | Event title |
| `description` | TEXT | | Long description |
| `location` | VARCHAR(255) | | Venue or meeting link |
| `start_date` | DATETIME | NOT NULL | Event start |
| `end_date` | DATETIME | NOT NULL | Event end |
| `max_attendees` | INT | | Optional capacity limit |
| `organizer_id` | BIGINT | NOT NULL, FK → `users.id` | Event creator |
| `status` | VARCHAR(255) | NOT NULL | `DRAFT` / `PUBLISHED` / `CANCELLED` / `COMPLETED` |
| `created_at` | DATETIME | NOT NULL | Auto-set on creation |
| `updated_at` | DATETIME | | Auto-set on update |

### Table: `registrations`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, auto-increment | Unique registration identifier |
| `user_id` | BIGINT | NOT NULL, FK → `users.id` | Registered attendee |
| `event_id` | BIGINT | NOT NULL, FK → `events.id` | Target event |
| `registered_at` | DATETIME | NOT NULL | Auto-set on creation |
| `status` | VARCHAR(255) | NOT NULL | `CONFIRMED` / `CANCELLED` |
| | | UNIQUE(`user_id`, `event_id`) | Prevents duplicate registrations |

### Table: `messages`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, auto-increment | Unique message identifier |
| `event_id` | BIGINT | NOT NULL, FK → `events.id` | Chat room (event) |
| `sender_id` | BIGINT | NOT NULL, FK → `users.id` | Message author |
| `content` | TEXT | NOT NULL | Message body (max 2000 chars enforced in code) |
| `sent_at` | DATETIME | NOT NULL | Auto-set on creation |
| | | INDEX `idx_message_event_id` on `event_id` | Optimizes chat history queries |

### Relationships

| Relationship | Type | Description |
|-------------|------|-------------|
| User → Events | One-to-Many | One user organizes many events (`organizer_id`) |
| User → Registrations | One-to-Many | One user registers for many events (`user_id`) |
| Event → Registrations | One-to-Many | One event has many registrations (`event_id`) |
| User ↔ Event (via Registration) | Many-to-Many | Resolved through the `registrations` join table |
| User → Messages | One-to-Many | One user sends many messages (`sender_id`) |
| Event → Messages | One-to-Many | One event has many chat messages (`event_id`) |

### Cascade Rules

- Deleting a **User** cascades to delete their organized events and registrations.
- Deleting an **Event** cascades to delete all its registrations.
- Messages are **not** cascade-deleted — they persist independently.

---

## Authentication & JWT Flow

### Token Generation

1. User sends `POST /api/auth/register` or `POST /api/auth/login` with email + password.
2. Backend validates credentials, generates:
   - **Access token** (24-hour expiry, HMAC-SHA256 signed, contains user email as subject).
   - **Refresh token** (7-day expiry, same signing, used for token renewal).
3. Response includes `accessToken`, `refreshToken`, and a `user` object with `id`, `email`, `name`, and `role`.

### Token Usage

Every authenticated request includes the header:
```
Authorization: Bearer <access_token>
```

The `JwtAuthenticationFilter` intercepts every request, validates the token, loads the user from the database, and sets a `UserPrincipal` in the Spring Security context.

### Token Refresh

- `POST /api/auth/refresh` with a valid refresh token returns a new access + refresh token pair.
- Frontend stores tokens in `localStorage` and includes the access token on all API and WebSocket requests.

### WebSocket Authentication

- STOMP CONNECT frame includes `Authorization: Bearer <token>` in `connectHeaders`.
- The backend's `WebSocketAuthChannelInterceptor` extracts and validates the JWT from this header.
- Unauthenticated users can connect but cannot send messages.

---

## Event Management Flow

```
Organizer                          Backend                         Database
   │                                  │                               │
   │  POST /api/events                │                               │
   │  {title, dates, organizerId,     │                               │
   │   status, ...}                   │                               │
   │ ───────────────────────────────▶ │  Validates ORGANIZER role     │
   │                                  │  Creates Event entity         │
   │                                  │ ───────────────────────────▶  │  INSERT INTO events
   │  201 Created + EventResponse     │                               │
   │ ◀─────────────────────────────── │                               │
   │                                  │                               │
   │  PUT /api/events/{id}            │                               │
   │  (update fields)                 │                               │
   │ ───────────────────────────────▶ │  Verifies ownership           │
   │                                  │ ───────────────────────────▶  │  UPDATE events
   │  200 OK + EventResponse          │                               │
   │ ◀─────────────────────────────── │                               │
   │                                  │                               │
   │  DELETE /api/events/{id}         │                               │
   │ ───────────────────────────────▶ │  Verifies ownership           │
   │                                  │ ───────────────────────────▶  │  DELETE events (+ cascaded registrations)
   │  204 No Content                  │                               │
   │ ◀─────────────────────────────── │                               │
```

- **Ownership enforcement**: Organizers can only modify/delete their own events. Admins can modify any event.
- **Status lifecycle**: Events move through `DRAFT → PUBLISHED → COMPLETED` or `CANCELLED`.

---

## Registration Flow

```
Attendee                            Backend                         Database
   │                                  │                               │
   │  POST /api/registrations         │                               │
   │  {eventId, userId}               │                               │
   │ ───────────────────────────────▶ │  Validates userId matches JWT │
   │                                  │  Checks unique constraint     │
   │                                  │  Creates Registration         │
   │                                  │ ───────────────────────────▶  │  INSERT INTO registrations
   │  201 Created + RegistrationResponse                             │
   │ ◀─────────────────────────────── │                               │
   │                                  │                               │
   │  DELETE /api/registrations/{id}  │                               │
   │ ───────────────────────────────▶ │  Verifies ownership           │
   │                                  │  Sets status = CANCELLED      │
   │                                  │ ───────────────────────────▶  │  UPDATE registrations SET status='CANCELLED'
   │  204 No Content                  │                               │
   │ ◀─────────────────────────────── │                               │
```

- **Duplicate prevention**: Unique constraint on `(user_id, event_id)` prevents double registration. Returns `409 Conflict`.
- **Soft cancel**: Cancellation sets `status = CANCELLED` but does not delete the row, preserving history.
- **My Registrations**: `GET /api/registrations/user/{userId}` returns all registrations for the authenticated user.

---

## WebSocket Chat Flow

```
Browser A (User 1)                 Backend (STOMP)              Browser B (User 2)
       │                                  │                              │
       │  Connect: /api/ws               │                              │
       │  Headers: Authorization: Bearer │                              │
       │ ───────────────────────────────▶ │  JWT validated               │
       │  STOMP CONNECTED                │  User authenticated          │
       │ ◀─────────────────────────────── │                              │
       │                                  │                              │
       │  Subscribe: /topic/event/1       │                              │
       │ ───────────────────────────────▶ │  Subscription registered     │
       │                                  │                              │
       │                                  │  ◀─── Subscribe: /topic/event/1
       │                                  │  Subscription registered     │
       │                                  │                              │
       │  Send: /app/chat/1               │                              │
       │  {"content": "Hello!"}           │                              │
       │ ───────────────────────────────▶ │  Save to messages table      │
       │                                  │  Broadcast to /topic/event/1 │
       │  ◀─── /topic/event/1            │ ───────────────────────────▶ │
       │  {"content":"Hello!",            │  ChatPanel updates UI        │
       │   "senderName":"User 1", ...}    │                              │
```

- **Protocol**: STOMP over SockJS (HTTP fallback when WebSocket is unavailable).
- **Persistence**: Every message is saved to the `messages` table before broadcasting.
- **Delivery**: Messages are broadcast to all subscribers of `/topic/event/{eventId}`.
- **Validation**: Empty messages and messages over 2000 characters are rejected.

---

## REST API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | Public | Register a new user |
| POST | `/auth/login` | Public | Login, receive access + refresh tokens |
| POST | `/auth/refresh` | Public | Refresh an expired access token |

### Events (`/api/events`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/events` | Public | List all events |
| GET | `/events/{id}` | Public | Get event by ID |
| POST | `/events` | ORGANIZER / ADMIN | Create a new event |
| PUT | `/events/{id}` | Owner / ADMIN | Update an event |
| DELETE | `/events/{id}` | Owner / ADMIN | Delete an event (+ cascaded registrations) |

### Registrations (`/api/registrations`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/registrations` | Authenticated | Register for an event (self only) |
| GET | `/registrations/user/{userId}` | Self / ADMIN | Get user's registrations |
| GET | `/registrations/event/{eventId}` | Event organizer / ADMIN | Get registrations for an event |
| DELETE | `/registrations/{id}` | Owner / ADMIN | Cancel a registration |

### WebSocket (`/api/ws`)

| Protocol | Endpoint | Description |
|----------|----------|-------------|
| STOMP CONNECT | `/api/ws` | Authenticate via `Authorization` header |
| STOMP SUBSCRIBE | `/topic/event/{eventId}` | Listen for chat messages |
| STOMP SEND | `/app/chat/{eventId}` | Send a chat message (payload: `{"content": "..."}` ) |

### Error Response Format

All errors follow a consistent structure:

```json
{
  "status": 400,
  "message": "Title is required",
  "timestamp": "2026-08-30T16:37:39.400978"
}
```

---

## Frontend Routes

| Route | Component | Access | Description |
|-------|-----------|--------|-------------|
| `/` | — | — | Redirects to `/events` |
| `/login` | `LoginPage` | Public | User login form |
| `/register` | `RegisterPage` | Public | User registration form |
| `/events` | `EventsPage` | Protected | Event card grid (all events) |
| `/events/new` | `CreateEventPage` | Protected | Create a new event form |
| `/events/:id` | `EventDetailPage` | Protected | Event details + chat panel |
| `/events/:id/edit` | `EditEventPage` | Protected | Edit event form |
| `/my-registrations` | `MyRegistrationsPage` | Protected | User's registration list |
| `*` | `NotFound` | Public | 404 page |

Protected routes check authentication state via `ProtectedRoute`. Unauthenticated users are redirected to `/login` with the intended destination preserved for post-login redirect.

---

## Local Setup & Run

### Prerequisites

- **Java 17+** (JDK)
- **Node.js 18+** and npm
- **MySQL 8.x** running on `localhost:3306`
- **Maven 3.9+** (or use the bundled `mvnw`)

### 1. Database Setup

MySQL must be running. The app auto-creates the database (`event_management_dev`) and all tables via Hibernate.

```sql
-- Manual setup (optional, Hibernate handles this):
CREATE DATABASE IF NOT EXISTS event_management_dev;
```

Default credentials: `root` / `root`. Override with environment variables:

```bash
export DB_USERNAME=your_user
export DB_PASSWORD=your_password
```

### 2. Backend

```bash
cd backend
./mvnw spring-boot:run
```

The backend starts on **http://localhost:8080** with context path `/api`.

Set a custom JWT secret for production:

```bash
export JWT_SECRET=your_base64_encoded_secret_at_least_32_bytes
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on **http://localhost:5173** and proxies `/api` requests to the backend.

### 4. Verify

Open **http://localhost:5173** in your browser. You should see the login page. Register a new account, create an event, and test the chat.

---

## Testing & Verification Status

| Flow | Status | Notes |
|------|--------|-------|
| User Registration | PASS | Returns JWT tokens, prevents duplicate emails (409) |
| User Login | PASS | Returns JWT tokens, rejects wrong credentials (400) |
| JWT Token Validation | PASS | All protected endpoints reject invalid/missing tokens (403) |
| Create Event | PASS | Requires ORGANIZER/ADMIN role, validates required fields (400) |
| List Events | PASS | Public endpoint, returns all events |
| Get Event by ID | PASS | Returns full event details, 404 for missing events |
| Update Event | PASS | Owner-only, updates all fields |
| Delete Event | PASS | Owner-only, cascades to delete registrations |
| Register for Event | PASS | Prevents duplicates (409), validates userId matches JWT |
| My Registrations | PASS | Returns user's registration history |
| Cancel Registration | PASS | Soft cancel (status → CANCELLED), preserves record |
| WebSocket Chat Connect | PASS | Authenticates via STOMP Authorization header |
| WebSocket Send Message | PASS | Persists to DB, broadcasts to all subscribers |
| WebSocket Receive Message | PASS | Real-time delivery to all subscribed clients |
| React App Renders | PASS | No console errors, all pages load correctly |
| TypeScript Compilation | PASS | Zero errors |
| ESLint | PASS | Zero warnings or errors |
| Production Build | PASS | Builds successfully (227 modules, ~100KB gzipped) |

---

## Project Structure

```
online-event-management-platform/
├── backend/                          # Spring Boot backend
│   ├── src/main/java/com/eventmanagement/
│   │   ├── EventManagementApplication.java
│   │   ├── config/                   # Security, WebSocket, CORS config
│   │   ├── controller/               # REST + STOMP controllers
│   │   ├── dto/                      # Request/Response DTOs
│   │   ├── exception/                # Custom exceptions + handlers
│   │   ├── model/                    # JPA entities + enums
│   │   ├── repository/               # Spring Data JPA repositories
│   │   ├── security/                 # JWT filter, token provider, principal
│   │   └── service/                  # Business logic layer
│   ├── src/main/resources/
│   │   ├── application.yml           # Base config
│   │   ├── application-dev.yml       # Dev profile (MySQL)
│   │   └── application-prod.yml      # Production profile
│   └── pom.xml
├── frontend/                         # React SPA
│   ├── src/
│   │   ├── api/                      # Axios client + API modules
│   │   ├── components/               # Reusable UI components
│   │   ├── context/                  # React context definitions
│   │   ├── hooks/                    # Custom hooks (useAuth, useWebSocket)
│   │   ├── pages/                    # Route page components
│   │   ├── providers/                # Context providers
│   │   ├── types/                    # TypeScript type definitions
│   │   ├── utils/                    # Utility helpers (placeholder)
│   │   ├── index.css                 # Global styles + responsive design
│   │   ├── main.tsx                  # App entry point
│   │   └── App.tsx                   # Route definitions
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── docs/                             # Project documentation
│   ├── API_DESIGN.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   └── SETUP_GUIDE.md
└── README.md
```

---

## License

This project was developed for academic purposes.
