package com.jackpot.whiskeynote.domain.admin.repository;

import com.jackpot.whiskeynote.domain.admin.entity.ReportActions;
import com.jackpot.whiskeynote.domain.admin.entity.Reports;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportActionsRepository extends JpaRepository<ReportActions, Long> {
    // 특정 신고의 처리 이력 조회
    List<ReportActions> findAllByReportOrderByCreatedAtDesc(Reports report);
}
