package com.eventmanagement.config;

import com.eventmanagement.security.JwtTokenProvider;
import com.eventmanagement.security.UserPrincipal;
import com.eventmanagement.model.User;
import com.eventmanagement.model.UserRole;
import com.eventmanagement.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Intercepts STOMP CONNECT frames to authenticate users via JWT token.
 *
 * <p>The client must pass the JWT token either as:</p>
 * <ul>
 *   <li>A {@code Authorization} header in the CONNECT frame (preferred), or</li>
 *   <li>A query parameter {@code ?token=...} on the WebSocket URL</li>
 * </ul>
 */
@Component
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    private static final Logger log = LoggerFactory.getLogger(WebSocketAuthChannelInterceptor.class);

    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;

    public WebSocketAuthChannelInterceptor(JwtTokenProvider tokenProvider, UserRepository userRepository) {
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = extractToken(accessor);

            if (token != null && tokenProvider.validateToken(token)) {
                String email = tokenProvider.getEmailFromToken(token);
                User user = userRepository.findByEmail(email).orElse(null);

                if (user != null) {
                    List<SimpleGrantedAuthority> authorities = List.of(
                            new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
                    );

                    UserPrincipal principal = new UserPrincipal(user.getId(), user.getEmail(), user.getRole());
                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(principal, null, authorities);
                    accessor.setUser(auth);

                    log.debug("WebSocket authenticated user: {} (id={})", user.getEmail(), user.getId());
                } else {
                    log.warn("WebSocket CONNECT: user not found for email={}", email);
                }
            } else {
                log.debug("WebSocket CONNECT: no valid JWT token provided – anonymous session");
            }
        }

        return message;
    }

    private String extractToken(StompHeaderAccessor accessor) {
        // 1. Try the Authorization header on the CONNECT frame
        String authHeader = accessor.getFirstNativeHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        // 2. Fall back to the "token" query parameter set during the handshake
        String url = accessor.getFirstNativeHeader("simpConnectMessage");
        if (url != null && url.contains("token=")) {
            return extractTokenFromUrl(url);
        }

        // Also check the native header used by some STOMP clients
        String tokenHeader = accessor.getFirstNativeHeader("token");
        if (tokenHeader != null) {
            return tokenHeader;
        }

        return null;
    }

    private String extractTokenFromUrl(String url) {
        int idx = url.indexOf("token=");
        if (idx == -1) return null;
        String value = url.substring(idx + 6);
        int end = value.indexOf('&');
        return end == -1 ? value : value.substring(0, end);
    }
}
