package com.jackpot.whiskeynote.domain.taste.survey.entity;

import com.jackpot.whiskeynote.domain.taste.tag.entity.Tag;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "flavor_profile_tags")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FlavorProfileTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flavor_profile_id")
    private FlavorProfile flavorProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tag_id")
    private Tag tag;

    private Double weight;

    public static FlavorProfileTag create(FlavorProfile flavorProfile, Tag tag, Double weight) {
        FlavorProfileTag flavorProfile1Tag = new FlavorProfileTag();
        flavorProfile1Tag.flavorProfile = flavorProfile;
        flavorProfile1Tag.tag = tag;
        flavorProfile1Tag.weight = weight;
        return flavorProfile1Tag;
    }
}
