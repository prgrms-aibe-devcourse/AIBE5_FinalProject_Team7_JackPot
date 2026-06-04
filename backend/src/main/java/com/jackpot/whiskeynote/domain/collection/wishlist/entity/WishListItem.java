package com.jackpot.whiskeynote.domain.collection.wishlist.entity;

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
@Table(name = "wishlist_items")
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class WishListItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "whiskey_id", nullable = false)
    private Whiskey whiskey;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "folder_id", nullable = true)
    private WishListFolder folder;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public static WishListItem create(Users user, Whiskey whiskey, WishListFolder folder) {
        WishListItem item = new WishListItem();
        item.user = user;
        item.whiskey = whiskey;
        item.folder = folder;
        return item;
    }

    // 폴더 이동 (null이면 폴더 없음으로 이동)
    public void moveFolder(WishListFolder folder) {
        this.folder = folder;
    }
}
