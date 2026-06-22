package com.jackpot.whiskeynote.domain.taste.survey.repository;

import com.jackpot.whiskeynote.domain.taste.survey.entity.FlavorProfile;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FlavorProfileRepository extends JpaRepository<FlavorProfile, Long> {
    @Query("SELECT fp FROM FlavorProfile fp " +
        "LEFT JOIN FETCH fp.tags fpt " +
        "LEFT JOIN FETCH fpt.tag ")
    List<FlavorProfile> findAllWithTag();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT fp FROM FlavorProfile fp " +
        "LEFT JOIN FETCH fp.tags fpt " +
        "LEFT JOIN FETCH fpt.tag " +
        "WHERE fp.userId = :userId")
    Optional<FlavorProfile> findByUserId(@Param("userId") Long userId);

    // 동시 계산 직렬화를 위한 비관적 락. 컬렉션 JOIN FETCH를 함께 쓰면
    // FOR UPDATE가 제대로 적용되지 않으므로(HHH000444), 루트(flavor_profile)만 잠근다.
    // tags는 @Transactional 컨텍스트 안에서 getTags() lazy 로딩으로 사용.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT fp FROM FlavorProfile fp WHERE fp.userId = :userId")
    Optional<FlavorProfile> findByUserIdForUpdate(@Param("userId") Long userId);
}
