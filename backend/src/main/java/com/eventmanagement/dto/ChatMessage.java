package com.eventmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * WebSocket payload for real-time event chat.
 *
 * <p>Clients send: {@code { "eventId": 1, "content": "Hello" }}</p>
 * <p>Server broadcasts: {@code { "id": 42, "eventId": 1, "senderId": 5,
 * "senderName": "Alice", "content": "Hello", "sentAt": "..." }}</p>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    private Long id;

    @NotNull(message = "Event ID is required")
    private Long eventId;

    private Long senderId;

    private String senderName;

    @NotBlank(message = "Message content must not be blank")
    @Size(max = 2000, message = "Message content must not exceed 2000 characters")
    private String content;

    private String sentAt;
}
