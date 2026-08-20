package com.eventmanagement.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/events")
public class EventController {

    @GetMapping
    public ResponseEntity<?> getAllEvents() {
        // TODO: implement list events
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getEventById(@PathVariable Long id) {
        // TODO: implement get event by id
        return ResponseEntity.ok().build();
    }

    @PostMapping
    public ResponseEntity<?> createEvent() {
        // TODO: implement create event
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable Long id) {
        // TODO: implement update event
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id) {
        // TODO: implement delete event
        return ResponseEntity.ok().build();
    }
}
