package com.jackpot.whiskeynote.domain.taste.survey.entity;

import com.jackpot.whiskeynote.domain.taste.note.vo.WhiskeyScoreVo;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "user_taste_profiles")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class UserTasteProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "sweet_score", nullable = false)
    private Integer sweetScore;

    @Column(name = "body_score", nullable = false)
    private Integer bodyScore;

    @Column(name = "smoky_score", nullable = false)
    private Integer smokyScore;

    @Column(name = "spicy_score", nullable = false)
    private Integer spicyScore;

    @Column(name = "finish_score", nullable = false)
    private Integer finishScore;

    // 설문 유형: BEGINNER | ENTHUSIAST
    @Column(name = "survey_type", length = 20, nullable = false)
    @Builder.Default
    private String surveyType = "BEGINNER";

    // 위스키 스타일 선호 (애호가 설문 전용)
    @Column(name = "style_tags", length = 1000)
    private String styleTags;

    // 탐험 성향 (1=보수형, 2=균형형, 3=탐험형)
    @Column(name = "exploration_level")
    private Integer explorationLevel;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 1NF 정규화 — 태그는 user_taste_profile_tags 테이블로 분리
    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<UserTasteProfileTag> tags = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    // ── 헬퍼 ────────────────────────────────────────────────────

    public WhiskeyScoreVo getScoreVo() {
        return new WhiskeyScoreVo(
            bodyScore.shortValue(),
            finishScore.shortValue(),
            smokyScore.shortValue(),
            spicyScore.shortValue(),
            sweetScore.shortValue());
    }

    /** 향(nose) 태그 목록 반환 */
    public List<UserTasteProfileTag> getNoseTags() {
        return tags.stream()
                .filter(t -> "nose".equals(t.getCategory()))
                .toList();
    }

    /** 맛(taste) 태그 목록 반환 */
    public List<UserTasteProfileTag> getTasteTags() {
        return tags.stream()
                .filter(t -> "taste".equals(t.getCategory()))
                .toList();
    }

    /** 향(nose) 태그 ID 목록 반환 */
    public List<Long> getNoseTagIds() {
        return getNoseTags().stream()
                .map(t -> t.getTag().getId())
                .toList();
    }

    /** 맛(taste) 태그 ID 목록 반환 */
    public List<Long> getTasteTagIds() {
        return getTasteTags().stream()
                .map(t -> t.getTag().getId())
                .toList();
    }

    // ── 수정 메서드 ──────────────────────────────────────────────

    /** 입문자 설문 점수 수정 */
    public void update(Integer sweetScore, Integer bodyScore, Integer smokyScore,
                       Integer spicyScore, Integer finishScore) {
        this.sweetScore  = sweetScore;
        this.bodyScore   = bodyScore;
        this.smokyScore  = smokyScore;
        this.spicyScore  = spicyScore;
        this.finishScore = finishScore;
        this.surveyType  = "BEGINNER";
    }

    /** 애호가 설문 점수 + 스타일/탐험 레벨 수정 */
    public void updateEnthusiast(Integer sweetScore, Integer bodyScore, Integer smokyScore,
                                  Integer spicyScore, Integer finishScore,
                                  String styleTags, Integer explorationLevel) {
        this.sweetScore      = sweetScore;
        this.bodyScore       = bodyScore;
        this.smokyScore      = smokyScore;
        this.spicyScore      = spicyScore;
        this.finishScore     = finishScore;
        this.surveyType      = "ENTHUSIAST";
        this.styleTags       = styleTags;
        this.explorationLevel = explorationLevel;
    }
}
