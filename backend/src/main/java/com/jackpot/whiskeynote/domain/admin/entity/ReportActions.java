package com.jackpot.whiskeynote.domain.admin.entity;

import com.jackpot.whiskeynote.domain.member.entity.Users;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "report_actions")
@Getter
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class ReportActions {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    private Reports report; // 신고 상세 내역

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private Users admin; // 처리자(어드민)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ReportActionType action;  // 제제 방법

    @Column(length = 500)
    private String note;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public static ReportActions create(Reports report, Users admin,
                                       ReportActionType action, String note) {
        return ReportActions.builder()
                .report(report)
                .admin(admin)
                .action(action)
                .note(note)
                .build();
    }
}
