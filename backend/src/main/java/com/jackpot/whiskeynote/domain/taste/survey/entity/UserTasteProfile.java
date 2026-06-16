package com.jackpot.whiskeynote.domain.taste.survey.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

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

    // TODO: 1NF 정규화 필요 — 아래 5개 컬럼은 복수 값을 문자열로 저장해 1NF 위반
    //  - nose_tag_ids, taste_tag_ids : "2,7,8" 형태 (쉼표 구분 ID 목록)
    //  - style_tags                  : "single_malt,bourbon" 형태
    //  - nose_tag_weights            : "1=2,7=1" 형태 (tagId=intensity 쌍)
    //  - taste_tag_weights           : 동일
    //  개선 방향: user_taste_profile_tags(profile_id, category, tag_id, intensity)
    //            user_taste_profile_styles(profile_id, style) 별도 테이블로 분리

    @Column(name = "nose_tag_ids", length = 512)
    private String noseTagIds;

    @Column(name = "taste_tag_ids", length = 512)
    private String tasteTagIds;

    @Column(name = "user_type", length = 128)
    private String userType;

    @Column(name = "survey_type", length = 20, nullable = false)
    @Builder.Default
    private String surveyType = "BEGINNER";

    @Column(name = "style_tags", length = 1000)
    private String styleTags;

    @Column(name = "nose_tag_weights", length = 2000)
    private String noseTagWeights;

    @Column(name = "taste_tag_weights", length = 2000)
    private String tasteTagWeights;

    @Column(name = "exploration_level")
    private Integer explorationLevel; // 1=보수형 2=균형형 3=탐험형

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    public List<Long> getNoseTagIdList() {
        if (noseTagIds == null || noseTagIds.isBlank()) return Collections.emptyList();
        return Arrays.stream(noseTagIds.split(","))
                .map(Long::parseLong).collect(Collectors.toList());
    }

    public List<Long> getTasteTagIdList() {
        if (tasteTagIds == null || tasteTagIds.isBlank()) return Collections.emptyList();
        return Arrays.stream(tasteTagIds.split(","))
                .map(Long::parseLong).collect(Collectors.toList());
    }

    public void update(Integer sweetScore, Integer bodyScore, Integer smokyScore,
                       Integer spicyScore, Integer finishScore,
                       String noseTagIds, String tasteTagIds, String userType) {
        this.sweetScore = sweetScore;
        this.bodyScore = bodyScore;
        this.smokyScore = smokyScore;
        this.spicyScore = spicyScore;
        this.finishScore = finishScore;
        this.noseTagIds = noseTagIds;
        this.tasteTagIds = tasteTagIds;
        this.userType = userType;
        this.surveyType = "BEGINNER";
    }

    public void updateEnthusiast(Integer sweetScore, Integer bodyScore, Integer smokyScore,
                                  Integer spicyScore, Integer finishScore,
                                  String noseTagIds, String tasteTagIds, String userType,
                                  String styleTags, String noseTagWeights, String tasteTagWeights,
                                  Integer explorationLevel) {
        this.sweetScore = sweetScore;
        this.bodyScore = bodyScore;
        this.smokyScore = smokyScore;
        this.spicyScore = spicyScore;
        this.finishScore = finishScore;
        this.noseTagIds = noseTagIds;
        this.tasteTagIds = tasteTagIds;
        this.userType = userType;
        this.surveyType = "ENTHUSIAST";
        this.styleTags = styleTags;
        this.noseTagWeights = noseTagWeights;
        this.tasteTagWeights = tasteTagWeights;
        this.explorationLevel = explorationLevel;
    }
}
