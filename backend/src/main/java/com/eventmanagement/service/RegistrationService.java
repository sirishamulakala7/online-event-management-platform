package com.eventmanagement.service;

import com.eventmanagement.dto.RegistrationRequest;
import com.eventmanagement.dto.RegistrationResponse;
import com.eventmanagement.exception.ConflictException;

import com.eventmanagement.exception.ResourceNotFoundException;
import com.eventmanagement.model.Event;
import com.eventmanagement.model.EventStatus;
import com.eventmanagement.model.Registration;
import com.eventmanagement.model.RegistrationStatus;
import com.eventmanagement.model.User;
import com.eventmanagement.repository.EventRepository;
import com.eventmanagement.repository.RegistrationRepository;
import com.eventmanagement.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;

    public RegistrationService(RegistrationRepository registrationRepository,
                               UserRepository userRepository,
                               EventRepository eventRepository) {
        this.registrationRepository = registrationRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
    }

    public RegistrationResponse register(RegistrationRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUserId()));

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", request.getEventId()));

        if (event.getStatus() == EventStatus.CANCELLED || event.getStatus() == EventStatus.COMPLETED) {
            throw new IllegalArgumentException("Cannot register for an event that is " + event.getStatus().name().toLowerCase());
        }

        if (registrationRepository.existsByUserIdAndEventIdAndStatus(user.getId(), event.getId(), RegistrationStatus.CONFIRMED)) {
            throw new ConflictException("User is already registered for this event");
        }

        if (event.getMaxAttendees() != null) {
            long confirmedCount = registrationRepository.countByEventIdAndStatus(event.getId(), RegistrationStatus.CONFIRMED);
            if (confirmedCount >= event.getMaxAttendees()) {
                throw new IllegalArgumentException("Event has reached maximum capacity of " + event.getMaxAttendees());
            }
        }

        Registration registration = Registration.builder()
                .user(user)
                .event(event)
                .status(RegistrationStatus.CONFIRMED)
                .build();

        Registration saved = registrationRepository.save(registration);
        return toResponse(saved);
    }

    public List<RegistrationResponse> getByEventId(Long eventId) {
        if (!eventRepository.existsById(eventId)) {
            throw new ResourceNotFoundException("Event", "id", eventId);
        }
        return registrationRepository.findByEventId(eventId).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<RegistrationResponse> getByUserId(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }
        return registrationRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    public Registration getRegistrationById(Long id) {
        return registrationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registration", "id", id));
    }

    public void cancel(Long id) {
        Registration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registration", "id", id));

        if (registration.getStatus() == RegistrationStatus.CANCELLED) {
            throw new IllegalArgumentException("Registration is already cancelled");
        }

        registration.setStatus(RegistrationStatus.CANCELLED);
        registrationRepository.save(registration);
    }

    private RegistrationResponse toResponse(Registration registration) {
        return RegistrationResponse.builder()
                .id(registration.getId())
                .userId(registration.getUser().getId())
                .userName(registration.getUser().getName())
                .eventId(registration.getEvent().getId())
                .eventTitle(registration.getEvent().getTitle())
                .status(registration.getStatus())
                .registeredAt(registration.getRegisteredAt())
                .build();
    }
}
