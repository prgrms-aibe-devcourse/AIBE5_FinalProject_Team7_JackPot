package com.jackpot.whiskeynote.domain.admin.repository;

import com.jackpot.whiskeynote.domain.admin.entity.WhiskeyRequest;
import com.jackpot.whiskeynote.domain.admin.entity.WhiskeyRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WhiskeyRequestRepository extends JpaRepository<WhiskeyRequest, Long> {
    // 위스키 등록 요청 목록 조회(전체) - 관리자
    Page<WhiskeyRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // 위스키 등록 요청 목록 조회(대기중, 승인, 반려 탭) - 관리자
    Page<WhiskeyRequest> findAllByStatusOrderByCreatedAtDesc(WhiskeyRequestStatus status, Pageable pageable);

    // 위스키 등록 요청 목록 조회(전체) - 일반
    Page<WhiskeyRequest> findAllByRequesterIdOrderByCreatedAtDesc(Long requesterId, Pageable pageable);

    // 위스키 등록 요청 목록 조회(대기중, 승인, 반려 탭) - 일반
    Page<WhiskeyRequest> findAllByRequesterIdAndStatusOrderByCreatedAtDesc(Long requesterId, WhiskeyRequestStatus status, Pageable pageable);
}
