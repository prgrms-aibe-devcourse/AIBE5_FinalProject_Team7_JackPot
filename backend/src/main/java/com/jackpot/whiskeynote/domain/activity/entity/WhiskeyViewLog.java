package com.jackpot.whiskeynote.domain.activity.entity;


import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.whiskey.entity.Whiskey;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "whiskey_view_logs")
public class WhiskeyViewLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private Users user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "whiskey_id")
    private Whiskey whiskey;

    private Integer viewDuration;

    private LocalDateTime createdAt;

    @Builder
    private WhiskeyViewLog(Users user, Whiskey whiskey, Integer viewDuration) {
        this.user = user;
        this.whiskey = whiskey;
        this.viewDuration = viewDuration;
        createdAt = LocalDateTime.now();
    }
}
