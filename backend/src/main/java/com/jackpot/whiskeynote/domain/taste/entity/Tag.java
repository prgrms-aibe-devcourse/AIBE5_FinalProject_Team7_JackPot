package com.jackpot.whiskeynote.domain.taste.entity;

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

    private Integer displayOrder;

    private String imageUrl;
}
