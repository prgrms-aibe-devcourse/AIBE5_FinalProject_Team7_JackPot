package com.jackpot.whiskeynote.domain.whiskey.search.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "whiskey_aliases")
public class WhiskeyAlias {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "whiskey_id", nullable = false)
    private Long whiskeyId;

    @Column(nullable = false, length = 200)
    private String alias;

    @Column(name="created_at", nullable = false)
    private LocalDateTime createdAt;

    public static WhiskeyAlias create(Long whiskeyId, String alias) {
        WhiskeyAlias whiskeyAlias = new WhiskeyAlias();
        whiskeyAlias.whiskeyId = whiskeyId;
        whiskeyAlias.alias = alias;
        whiskeyAlias.createdAt = LocalDateTime.now();
        return whiskeyAlias;
    }
}
