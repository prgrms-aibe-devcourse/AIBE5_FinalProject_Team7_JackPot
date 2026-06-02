package com.jackpot.whiskeynote.domain.collection.pick.repository;

import com.jackpot.whiskeynote.domain.collection.pick.entity.MyPick;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface PickRepository extends JpaRepository<MyPick, Long> {
    /**
     * 특정 유저의 모든 Pick 목록 전체 조회
     * @param userId
     * @param pageable
     * @return
     */
    Page<MyPick> findAllByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /**
     * 특정 pick 조회
     * @param userId
     * @param whiskeyId
     * @return
     */
    Optional<MyPick> findByUserIdAndWhiskeyId(Long userId, Long whiskeyId);

    /**
     * 중복 픽 확인
     * @param userId
     * @param whiskeyId
     * @return
     */
    boolean existsByUserIdAndWhiskeyId(Long userId, Long whiskeyId);

    //캐비넷 픽 조회용
    long countByUserId(Long userId);
}
