package com.eventmanagement.security;

import com.eventmanagement.model.UserRole;

/**
 * Custom principal stored in SecurityContext after JWT authentication.
 * Carries the user's ID, email, and role for use in controllers and services.
 */
public record UserPrincipal(Long id, String email, UserRole role) {
}
