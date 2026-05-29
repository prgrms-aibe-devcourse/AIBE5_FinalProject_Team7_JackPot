package com.jackpot.whiskeynote.domain.whiskey.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "whiskeys")
@Builder
public class Whiskey {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Enumerated(EnumType.STRING)
    private WhiskeyType type;

    private String etcDetail;

    private String imageUrl;

    private Double abv;

    private Integer ageYears;

    @Enumerated(EnumType.STRING)
    private WhiskeyStatus status;

    private String region;

    private String country;

    private String cask;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
