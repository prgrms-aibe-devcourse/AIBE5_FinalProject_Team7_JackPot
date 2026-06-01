package com.jackpot.whiskeynote.domain.collection.pick.entity;

import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.whiskey.entity.Whiskey;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter
@Entity
@Table(
        name = "my_picks",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_my_picks_user_whiskey", columnNames = {"user_id", "whiskey_id"})
        }
)
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class MyPick {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "whiskey_id", nullable = false)
    private Whiskey whiskey;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public static MyPick create(Users user, Whiskey whiskey) {
        MyPick pick = new MyPick();
        pick.user = user;
        pick.whiskey = whiskey;
        return pick;
    }
}
