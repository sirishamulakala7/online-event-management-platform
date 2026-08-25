package com.eventmanagement.service;

import com.eventmanagement.dto.ChatMessage;
import com.eventmanagement.exception.ResourceNotFoundException;
import com.eventmanagement.model.Event;
import com.eventmanagement.model.Message;
import com.eventmanagement.model.User;
import com.eventmanagement.repository.EventRepository;
import com.eventmanagement.repository.MessageRepository;
import com.eventmanagement.repository.UserRepository;
import com.eventmanagement.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageService {

    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private final MessageRepository messageRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public MessageService(MessageRepository messageRepository,
                          EventRepository eventRepository,
                          UserRepository userRepository) {
        this.messageRepository = messageRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    /**
     * Persists a chat message and returns the enriched DTO ready for broadcast.
     *
     * @throws ResourceNotFoundException if the event or user does not exist
     */
    @Transactional
    public ChatMessage saveAndEnrich(Long eventId, UserPrincipal sender, String content) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));

        User user = userRepository.findById(sender.id())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + sender.id()));

        Message message = Message.builder()
                .eventId(eventId)
                .sender(user)
                .content(content)
                .sentAt(LocalDateTime.now())
                .build();

        message = messageRepository.save(message);

        return toDto(message);
    }

    /**
     * Returns recent messages for an event (up to 50, newest first in DB, reversed to chronological for the client).
     */
    @Transactional(readOnly = true)
    public List<ChatMessage> getRecentMessages(Long eventId) {
        List<Message> messages = messageRepository.findTop50ByEventIdOrderBySentAtDesc(eventId);
        // Reverse to chronological order (oldest first)
        return messages.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private ChatMessage toDto(Message message) {
        return ChatMessage.builder()
                .id(message.getId())
                .eventId(message.getEventId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getName())
                .content(message.getContent())
                .sentAt(message.getSentAt() != null ? message.getSentAt().format(ISO_FORMATTER) : null)
                .build();
    }
}
