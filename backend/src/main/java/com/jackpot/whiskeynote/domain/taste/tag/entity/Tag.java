package com.jackpot.whiskeynote.domain.taste.tag.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Table(name = "tags")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Tag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private TagCategory category;

    private String name;

    private String nameEng;

    private String description;

    private String example;

    private Integer displayOrder;

    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paired_id")
    private Tag pairedTag;
}
