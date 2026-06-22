package com.jackpot.whiskeynote.domain.taste.survey.entity;

import com.jackpot.whiskeynote.domain.taste.note.vo.WhiskeyScoreVo;
import com.jackpot.whiskeynote.domain.taste.tag.entity.Tag;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "flavor_profile")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FlavorProfile {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 추후 삭제로직 구현 필요
    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "body_score", nullable = false)
    private Double bodyScore;

    @Column(name = "finish_score", nullable = false)
    private Double finishScore;

    @Column(name = "smoky_score", nullable = false)
    private Double smokyScore;

    @Column(name = "spicy_score", nullable = false)
    private Double spicyScore;

    @Column(name = "sweet_score", nullable = false)
    private Double sweetScore;

    @OneToMany(mappedBy = "flavorProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FlavorProfileTag> tags = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public static FlavorProfile create(Long userId, double[] scoreArray, Map<Tag, Double> tags) {
        FlavorProfile flavorProfile = new FlavorProfile();
        flavorProfile.userId = userId;
        flavorProfile.update(scoreArray[0], scoreArray[1], scoreArray[2], scoreArray[3], scoreArray[4], tags);
        flavorProfile.createdAt = LocalDateTime.now();
        return flavorProfile;
    }

    public double[] getScoreArray() {
        return new double[]{bodyScore, finishScore, smokyScore, spicyScore, sweetScore};
    }

    public void update(Double bodyScore, Double finishScore, Double smokyScore, Double spicyScore, Double sweetScore, Map<Tag, Double> tags) {
        this.bodyScore   = bodyScore;
        this.finishScore = finishScore;
        this.smokyScore  = smokyScore;
        this.spicyScore  = spicyScore;
        this.sweetScore  = sweetScore;
        updateTags(tags);
    }

    private void updateTags(Map<Tag, Double> tags) {
        this.tags.clear();
        this.tags.addAll(
            tags.entrySet().stream()
                .map(e -> FlavorProfileTag.create(this, e.getKey(), e.getValue()))
                .toList()
        );
    }
}
