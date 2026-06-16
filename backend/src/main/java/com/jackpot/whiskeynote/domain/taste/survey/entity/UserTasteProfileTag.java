package com.jackpot.whiskeynote.domain.taste.survey.entity;

import com.jackpot.whiskeynote.domain.taste.tag.entity.Tag;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 설문 취향 프로필 태그 (1NF 정규화)
 *
 * user_taste_profiles 의 nose_tag_ids / taste_tag_ids 컬럼을
 * 별도 테이블로 분리한 결과물.
 *
 * category : "nose" | "taste"
 */
@Entity
@Table(name = "user_taste_profile_tags")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserTasteProfileTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private UserTasteProfile profile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tag_id", nullable = false)
    private Tag tag;

    // "nose" 또는 "taste"
    @Column(name = "category", nullable = false, length = 10)
    private String category;

    // ── 정적 팩토리 ───────────────────────────────────────────────
    public static UserTasteProfileTag of(UserTasteProfile profile, Tag tag, String category) {
        UserTasteProfileTag entity = new UserTasteProfileTag();
        entity.profile  = profile;
        entity.tag      = tag;
        entity.category = category;
        return entity;
    }
}
