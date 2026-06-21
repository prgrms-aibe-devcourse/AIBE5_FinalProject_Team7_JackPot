package com.jackpot.whiskeynote.domain.taste.survey.repository;

import com.jackpot.whiskeynote.domain.taste.survey.entity.FlavorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FlavorProfileRepository extends JpaRepository<FlavorProfile, Long> {
    @Query("SELECT fp FROM FlavorProfile fp " +
        "LEFT JOIN FETCH fp.tags fpt " +
        "LEFT JOIN FETCH fpt.tag ")
    List<FlavorProfile> findAllWithTag();

    @Query("SELECT fp FROM FlavorProfile fp " +
        "LEFT JOIN FETCH fp.tags fpt " +
        "LEFT JOIN FETCH fpt.tag " +
        "WHERE fp.userId = :userId")
    Optional<FlavorProfile> findByUserId(@Param("userId") Long userId);
}
