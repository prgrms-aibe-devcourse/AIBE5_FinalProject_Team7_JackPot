package com.jackpot.whiskeynote.domain.admin.repository;

import com.jackpot.whiskeynote.domain.admin.entity.ReportStatus;
import com.jackpot.whiskeynote.domain.admin.entity.ReportTargetType;
import com.jackpot.whiskeynote.domain.admin.entity.Reports;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportsRepository extends JpaRepository<Reports, Long> {
    // 신고목록 조회(전체)
    Page<Reports> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // status 상태값에 따른 신고 목록 조회
    Page<Reports> findAllByStatusOrderByCreatedAtDesc(ReportStatus status, Pageable pageable);

    // 신고 중복 체크
    boolean existsByReporterIdAndTargetIdAndTargetType(Long userId, Long aLong, ReportTargetType reportTargetType);
}
