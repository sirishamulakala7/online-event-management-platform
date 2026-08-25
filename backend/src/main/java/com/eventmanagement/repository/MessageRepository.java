package com.eventmanagement.repository;

import com.eventmanagement.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByEventIdOrderBySentAtAsc(Long eventId);

    List<Message> findTop50ByEventIdOrderBySentAtDesc(Long eventId);
}
