package com.jackpot.whiskeynote.domain.taste.survey.repository;

import com.jackpot.whiskeynote.domain.taste.survey.entity.UserTasteProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserTasteProfileRepository extends JpaRepository<UserTasteProfile, Long> {
    Optional<UserTasteProfile> findByUserId(Long userId);
}
