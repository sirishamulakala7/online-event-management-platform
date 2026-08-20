# API Design

## Base URL

```
http://localhost:8080/api
```

## Authentication

### Register
```
POST /auth/register
Body: { "email": "", "password": "", "name": "" }
Response: 201 { "accessToken": "", "refreshToken": "", "user": {...} }
```

### Login
```
POST /auth/login
Body: { "email": "", "password": "" }
Response: 200 { "accessToken": "", "refreshToken": "", "user": {...} }
```

### Refresh Token
```
POST /auth/refresh
Body: { "refreshToken": "" }
Response: 200 { "accessToken": "", "refreshToken": "" }
```

---

## Events

All event endpoints require `Authorization: Bearer <token>`.

### List Events
```
GET /events
Query: ?page=0&size=10&status=PUBLISHED
Response: 200 { "content": [...], "totalElements": 0, "totalPages": 0 }
```

### Get Event by ID
```
GET /events/{id}
Response: 200 { "id": 0, "title": "", ... }
```

### Create Event
```
POST /events
Body: { "title": "", "description": "", "location": "", "startDate": "", "endDate": "", "maxAttendees": 0 }
Response: 201 { "id": 0, "title": "", ... }
```

### Update Event
```
PUT /events/{id}
Body: { "title": "", ... }
Response: 200 { "id": 0, "title": "", ... }
```

### Delete Event
```
DELETE /events/{id}
Response: 204
```

---

## WebSocket

### Connect
```
ws://localhost:8080/api/ws
```

### Subscribe to Event Updates
```
STOMP SUBSCRIBE /topic/events/{eventId}
```

### Send Event Update (Organizer)
```
STOMP SEND /app/events/{eventId}/update
Body: { "status": "PUBLISHED", "message": "" }
```

---

## Error Responses

```json
{
  "timestamp": "2024-01-01T00:00:00",
  "message": "Error description",
  "status": 400
}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request / validation error |
| 401 | Unauthorized (missing or invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Resource not found |
| 500 | Internal server error |
