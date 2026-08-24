package com.eventmanagement.dto;

import com.eventmanagement.model.RegistrationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistrationResponse {

    private Long id;
    private Long userId;
    private String userName;
    private Long eventId;
    private String eventTitle;
    private RegistrationStatus status;
    private LocalDateTime registeredAt;
}
