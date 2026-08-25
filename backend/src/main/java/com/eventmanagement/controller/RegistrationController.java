package com.eventmanagement.controller;

import com.eventmanagement.dto.RegistrationRequest;
import com.eventmanagement.dto.RegistrationResponse;
import com.eventmanagement.exception.AccessDeniedException;
import com.eventmanagement.exception.ResourceNotFoundException;
import com.eventmanagement.model.Event;
import com.eventmanagement.model.UserRole;
import com.eventmanagement.repository.EventRepository;
import com.eventmanagement.repository.UserRepository;
import com.eventmanagement.security.UserPrincipal;
import com.eventmanagement.service.RegistrationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/registrations")
public class RegistrationController {

    private final RegistrationService registrationService;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public RegistrationController(RegistrationService registrationService,
                                  EventRepository eventRepository,
                                  UserRepository userRepository) {
        this.registrationService = registrationService;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<RegistrationResponse> register(@Valid @RequestBody RegistrationRequest request) {
        UserPrincipal principal = getCurrentPrincipal();

        // Users can only register themselves (unless admin)
        if (principal.role() != UserRole.ADMIN && !principal.id().equals(request.getUserId())) {
            throw new AccessDeniedException("You can only register yourself for events");
        }

        RegistrationResponse created = registrationService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<RegistrationResponse>> getByEventId(@PathVariable Long eventId) {
        UserPrincipal principal = getCurrentPrincipal();

        // Verify the user is the organizer of this event (or admin)
        if (principal.role() != UserRole.ADMIN) {
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));
            if (!event.getOrganizer().getId().equals(principal.id())) {
                throw new AccessDeniedException("You can only view registrations for your own events");
            }
        }

        return ResponseEntity.ok(registrationService.getByEventId(eventId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RegistrationResponse>> getByUserId(@PathVariable Long userId) {
        UserPrincipal principal = getCurrentPrincipal();

        // Users can only view their own registrations (unless admin)
        if (principal.role() != UserRole.ADMIN && !principal.id().equals(userId)) {
            throw new AccessDeniedException("You can only view your own registrations");
        }

        return ResponseEntity.ok(registrationService.getByUserId(userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        // The service cancel method will fetch the registration.
        // We enforce ownership in the controller before delegating.
        UserPrincipal principal = getCurrentPrincipal();

        // Verify the registration belongs to the current user (or admin)
        com.eventmanagement.model.Registration registration =
                registrationService.getRegistrationById(id);

        if (principal.role() != UserRole.ADMIN && !principal.id().equals(registration.getUser().getId())) {
            throw new AccessDeniedException("You can only cancel your own registrations");
        }

        registrationService.cancel(id);
        return ResponseEntity.noContent().build();
    }

    private UserPrincipal getCurrentPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal)) {
            throw new AccessDeniedException("Authentication required");
        }
        return (UserPrincipal) auth.getPrincipal();
    }
}
