package com.jackpot.whiskeynote.domain.taste.entity;

import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Getter
@Table(name = "tags")
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
