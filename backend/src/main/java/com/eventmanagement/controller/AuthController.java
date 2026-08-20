package com.eventmanagement.controller;

import com.eventmanagement.dto.AuthResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register() {
        // TODO: implement registration
        return ResponseEntity.ok(AuthResponse.builder().build());
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login() {
        // TODO: implement login
        return ResponseEntity.ok(AuthResponse.builder().build());
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh() {
        // TODO: implement token refresh
        return ResponseEntity.ok(AuthResponse.builder().build());
    }
}
