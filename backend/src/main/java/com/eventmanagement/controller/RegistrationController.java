package com.eventmanagement.controller;

import com.eventmanagement.dto.RegistrationRequest;
import com.eventmanagement.dto.RegistrationResponse;
import com.eventmanagement.service.RegistrationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/registrations")
public class RegistrationController {

    private final RegistrationService registrationService;

    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping
    public ResponseEntity<RegistrationResponse> register(@Valid @RequestBody RegistrationRequest request) {
        RegistrationResponse created = registrationService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<RegistrationResponse>> getByEventId(@PathVariable Long eventId) {
        return ResponseEntity.ok(registrationService.getByEventId(eventId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RegistrationResponse>> getByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(registrationService.getByUserId(userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        registrationService.cancel(id);
        return ResponseEntity.noContent().build();
    }
}
