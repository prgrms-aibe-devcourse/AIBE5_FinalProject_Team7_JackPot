package com.jackpot.whiskeynote.domain.admin.entity;

import com.jackpot.whiskeynote.domain.member.entity.Users;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Getter
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class Reports {  // 신고 엔티티
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = true)
    private Users reporter; // 신고자

    @Column(nullable = false)
    private Long targetId;  // targetId(게시물, 댓글)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReportTargetType targetType;

    @Enumerated(EnumType.STRING)
    @Column(name = "reason", nullable = false, length = 20)
    private ReportReason reason;

    @Column(length = 500)
    private String detail;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 20)
    private ReportStatus status = ReportStatus.PENDING;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public static Reports create(Users reporter, Long targetId, ReportTargetType targetType,
            ReportReason reason, String detail) {
        return Reports.builder()
                .reporter(reporter)
                .targetId(targetId)
                .targetType(targetType)
                .reason(reason)
                .detail(detail)
                .build();
    }

    // 신고 수정(관리자)
    public void updateStatus(ReportStatus status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }
}
