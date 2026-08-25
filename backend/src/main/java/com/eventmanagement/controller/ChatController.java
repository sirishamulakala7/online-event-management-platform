package com.eventmanagement.controller;

import com.eventmanagement.dto.ChatMessage;
import com.eventmanagement.exception.ResourceNotFoundException;
import com.eventmanagement.security.UserPrincipal;
import com.eventmanagement.service.MessageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.security.Principal;

/**
 * STOMP controller that handles real-time chat messages for events.
 *
 * <h3>Message flow</h3>
 * <ol>
 *   <li>Client sends to {@code /app/chat/eventId} with payload {@code { "content": "..." }}</li>
 *   <li>This handler persists the message and broadcasts to {@code /topic/event/{eventId}}</li>
 * </ol>
 *
 * <h3>Topic pattern</h3>
 * <p>Subscribers listen on {@code /topic/event/{eventId}} to receive messages for a specific event.</p>
 */
@Controller
public class ChatController {

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;

    public ChatController(SimpMessagingTemplate messagingTemplate, MessageService messageService) {
        this.messagingTemplate = messagingTemplate;
        this.messageService = messageService;
    }

    /**
     * Receives a chat message from an authenticated user and broadcasts it
     * to all subscribers of the event's topic.
     *
     * <p>Destination: {@code /app/chat/{eventId}}</p>
     *
     * @param eventId  the event to chat in
     * @param chatMessage incoming payload (only {@code content} is used)
     * @param principal   the authenticated user principal (injected by Spring Security)
     */
    @MessageMapping("/chat/{eventId}")
    public void sendEventMessage(
            @DestinationVariable Long eventId,
            @Payload ChatMessage chatMessage,
            Principal principal) {

        if (principal == null || !(principal instanceof Authentication auth)) {
            log.warn("Unauthenticated user attempted to send a message to event {}", eventId);
            return;
        }

        UserPrincipal userPrincipal = (UserPrincipal) auth.getPrincipal();

        // Validate content is not blank
        String content = chatMessage.getContent();
        if (content == null || content.trim().isEmpty()) {
            log.warn("Empty message content from user {} for event {}", userPrincipal.id(), eventId);
            return;
        }

        if (content.length() > 2000) {
            log.warn("Message too long ({} chars) from user {} for event {}",
                    content.length(), userPrincipal.id(), eventId);
            return;
        }

        ChatMessage saved = messageService.saveAndEnrich(eventId, userPrincipal, content.trim());

        String destination = "/topic/event/" + eventId;
        messagingTemplate.convertAndSend(destination, saved);

        log.debug("Broadcast message id={} to {}", saved.getId(), destination);
    }
}
