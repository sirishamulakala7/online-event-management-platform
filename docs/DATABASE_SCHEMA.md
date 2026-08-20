# Database Schema

## Tables

### users

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT |
| email | VARCHAR(255) | NOT NULL, UNIQUE |
| password | VARCHAR(255) | NOT NULL |
| name | VARCHAR(255) | NOT NULL |
| role | VARCHAR(20) | NOT NULL (ATTENDEE, ORGANIZER, ADMIN) |
| created_at | DATETIME | NOT NULL, DEFAULT NOW |
| updated_at | DATETIME | NOT NULL, DEFAULT NOW |

### events

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT |
| title | VARCHAR(255) | NOT NULL |
| description | TEXT | NULLABLE |
| location | VARCHAR(255) | NULLABLE |
| start_date | DATETIME | NOT NULL |
| end_date | DATETIME | NOT NULL |
| max_attendees | INT | NULLABLE |
| organizer_id | BIGINT | FK → users.id, NOT NULL |
| status | VARCHAR(20) | NOT NULL (DRAFT, PUBLISHED, CANCELLED, COMPLETED) |
| created_at | DATETIME | NOT NULL, DEFAULT NOW |
| updated_at | DATETIME | NOT NULL, DEFAULT NOW |

### registrations (future)

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT |
| user_id | BIGINT | FK → users.id, NOT NULL |
| event_id | BIGINT | FK → events.id, NOT NULL |
| registered_at | DATETIME | NOT NULL, DEFAULT NOW |
| status | VARCHAR(20) | NOT NULL (CONFIRMED, CANCELLED) |

---

## Indexes

- `users.email` — unique index (login lookups)
- `events.organizer_id` — index (organizer's events)
- `events.status` — index (filtered queries)
- `registrations.user_id + event_id` — unique composite index

---

## ER Diagram

```
┌──────────────┐         ┌──────────────┐         ┌────────────────┐
│    users     │         │    events    │         │ registrations  │
├──────────────┤         ├──────────────┤         ├────────────────┤
│ id       PK │◄────────│ organizer_id FK│◄───────│ event_id    FK │
│ email        │         │ id       PK  │         │ user_id     FK │──┐
│ password     │         │ title        │         │ id         PK │  │
│ name         │         │ description  │         │ registered_at │  │
│ role         │         │ location     │         │ status        │  │
│ created_at   │         │ start_date   │         └────────────────┘  │
│ updated_at   │         │ end_date     │                             │
└──────────────┘         │ max_attendees│                             │
                         │ status       │                             │
                         │ created_at   │                             │
                         │ updated_at   │                             │
                         └──────────────┘                             │
                                                       ┌─────────────┘
                                                       │
                                                 users.id
```
