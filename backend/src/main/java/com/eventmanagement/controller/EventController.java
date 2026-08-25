package com.eventmanagement.controller;

import com.eventmanagement.dto.EventRequest;
import com.eventmanagement.dto.EventResponse;
import com.eventmanagement.exception.AccessDeniedException;
import com.eventmanagement.model.Event;
import com.eventmanagement.model.UserRole;
import com.eventmanagement.repository.EventRepository;
import com.eventmanagement.security.UserPrincipal;
import com.eventmanagement.service.EventService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/events")
public class EventController {

    private final EventService eventService;
    private final EventRepository eventRepository;

    public EventController(EventService eventService, EventRepository eventRepository) {
        this.eventService = eventService;
        this.eventRepository = eventRepository;
    }

    @GetMapping
    public ResponseEntity<List<EventResponse>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    @PostMapping
    public ResponseEntity<EventResponse> createEvent(@Valid @RequestBody EventRequest request) {
        EventResponse created = eventService.createEvent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventResponse> updateEvent(@PathVariable Long id,
                                                     @Valid @RequestBody EventRequest request) {
        enforceEventOwnership(id);
        return ResponseEntity.ok(eventService.updateEvent(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        enforceEventOwnership(id);
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Verify the current user owns this event (or is ADMIN).
     * ORGANIZER can only modify their own events.
     */
    private void enforceEventOwnership(Long eventId) {
        UserPrincipal principal = getCurrentPrincipal();
        if (principal.role() == UserRole.ADMIN) {
            return; // Admins can modify any event
        }

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new com.eventmanagement.exception.ResourceNotFoundException("Event", "id", eventId));

        if (!event.getOrganizer().getId().equals(principal.id())) {
            throw new AccessDeniedException("You can only modify your own events");
        }
    }

    private UserPrincipal getCurrentPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal)) {
            throw new AccessDeniedException("Authentication required");
        }
        return (UserPrincipal) auth.getPrincipal();
    }
}
