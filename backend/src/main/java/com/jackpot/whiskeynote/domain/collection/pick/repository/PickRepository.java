package com.jackpot.whiskeynote.domain.collection.pick.repository;

import com.jackpot.whiskeynote.domain.collection.pick.entity.MyPick;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


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

    // 유저 매칭용 — 유저의 모든 pick (위스키 포함)
    @Query("SELECT p FROM MyPick p JOIN FETCH p.whiskey WHERE p.user.id = :userId")
    List<MyPick> findAllByUserIdWithWhiskey(@Param("userId") Long userId);

    // 유저 매칭용 (배치) — 여러 유저의 pick을 한 번에 조회 (N+1 방지)
    @Query("SELECT p FROM MyPick p JOIN FETCH p.whiskey JOIN FETCH p.user WHERE p.user.id IN :userIds")
    List<MyPick> findAllByUserIdInWithWhiskey(@Param("userIds") Collection<Long> userIds);

    //캐비넷 픽 조회용
    long countByUserId(Long userId);
}
