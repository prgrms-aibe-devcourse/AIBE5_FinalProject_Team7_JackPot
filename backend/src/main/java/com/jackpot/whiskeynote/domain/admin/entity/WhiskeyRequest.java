package com.jackpot.whiskeynote.domain.admin.entity;

import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.whiskey.entity.Whiskey;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 위스키 등록 요청 엔티티
 * - whiskey_requests 테이블 매핑
 * - 사용자가 새 위스키 등록을 요청하면 관리자가 승인/반려 처리
 */
@Entity
@Table(name = "whiskey_requests")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class WhiskeyRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 요청자 (탈퇴해도 요청은 남길 수 있으므로 nullable)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = true)
    private Users requester;

    // 승인 후 생성된 위스키 — 승인 전엔 NULL, 관리자가 직접 DB에 넣은 후 연결
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_whiskey_id", nullable = true)
    private Whiskey approvedWhiskey;

    // 위스키 상세 정보 JSON (이름, 종류, 도수 등 자유 형식)
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "description", nullable = false, columnDefinition = "JSON")
    private Map<String, Object> description;

    // 요청 상태
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private WhiskeyRequestStatus status = WhiskeyRequestStatus.pending;

    // 검토한 관리자 (FK → users, role=admin) — nullable (처리 전엔 없음)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private Users reviewedBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 관리자 승인/반려 처리
    public void updateRequestStatus(WhiskeyRequestStatus status, Users admin) {
        this.status = status;
        this.reviewedBy = admin;
    }

    // 사용자 등록 요청 생성
    public static WhiskeyRequest create(Users requester, Map<String, Object> description) {
        return WhiskeyRequest.builder()
                .requester(requester)
                .description(description)
                .build();
    }

    // 사용자 등록 요청 수정 (pending 상태일 때만 호출할 것)
    public void update(Map<String, Object> description) {
        this.description = description;
    }
}
