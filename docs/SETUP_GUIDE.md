# Development Setup Guide

## Prerequisites

- **Java 17+** (JDK)
- **Maven 3.9+**
- **Node.js 18+** and npm/yarn
- **MySQL 8.0+** running locally
- **IDE**: IntelliJ IDEA or VS Code

---

## Backend Setup

```bash
cd backend

# Create the MySQL database (if not using createDatabaseIfNotExist)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS event_management_dev;"

# Install dependencies and run
mvn spring-boot:run
```

Backend runs at: `http://localhost:8080/api`

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_USERNAME` | No | MySQL username (default: root) |
| `DB_PASSWORD` | No | MySQL password (default: root) |
| `JWT_SECRET` | No | Base64-encoded JWT secret (dev only) |

---

## Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Database

### Dev Database
- Name: `event_management_dev`
- Schema managed by Hibernate (`ddl-auto: update`)
- Tables auto-created on first run

### Test Database
- H2 in-memory (no setup required)
- Activated by `@ActiveProfiles("test")`

---

## Project Structure

```
online-event-management-platform/
├── frontend/               # React + Vite
│   ├── src/
│   │   ├── api/            # HTTP client & API calls
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Route-level components
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Helper functions
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                # Spring Boot
│   ├── src/main/java/com/eventmanagement/
│   │   ├── config/         # Security, CORS, WebSocket
│   │   ├── controller/     # REST controllers
│   │   ├── dto/            # Data transfer objects
│   │   ├── exception/      # Global exception handling
│   │   ├── model/          # JPA entities
│   │   ├── repository/     # Data access layer
│   │   ├── security/       # JWT auth
│   │   └── service/        # Business logic
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   ├── application-dev.yml
│   │   └── application-prod.yml
│   └── pom.xml
│
└── docs/                   # Project documentation
    ├── ARCHITECTURE.md
    ├── API_DESIGN.md
    ├── DATABASE_SCHEMA.md
    └── SETUP_GUIDE.md
```

---

## API Proxy

The Vite dev server proxies `/api` requests to `http://localhost:8080`, so frontend code can call:

```typescript
fetch('/api/events')  // → proxied to http://localhost:8080/api/events
```

---

## Next Steps

1. Implement auth endpoints (register, login, refresh)
2. Add Event CRUD business logic
3. Connect frontend auth flow
4. Set up WebSocket for real-time updates
5. Add registration/attendance features
