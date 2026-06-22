package com.jackpot.whiskeynote.domain.taste.survey.repository;

import com.jackpot.whiskeynote.domain.taste.survey.entity.FlavorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface FlavorProfileRepository extends JpaRepository<FlavorProfile, Long> {
    @Query("SELECT fp FROM FlavorProfile fp " +
        "LEFT JOIN FETCH fp.tags fpt " +
        "LEFT JOIN FETCH fpt.tag ")
    List<FlavorProfile> findAllWithTag();
}
