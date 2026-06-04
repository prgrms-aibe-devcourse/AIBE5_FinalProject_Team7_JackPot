package com.jackpot.whiskeynote.domain.collection.wishlist.entity;

import com.jackpot.whiskeynote.domain.collection.wishlist.dto.WishlistFolderCreateRequest;
import com.jackpot.whiskeynote.domain.member.entity.Users;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "wishlist_folders")
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class WishListFolder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @Column(length = 128, nullable = false)
    private String name;

    @Column(name = "sort_order", nullable = false, columnDefinition = "INT DEFAULT 0")
    private int sortOrder;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public static WishListFolder create(Users user, WishlistFolderCreateRequest req){
        WishListFolder folder = new WishListFolder();
        folder.user = user;
        folder.name = req.name();
        folder.sortOrder = req.sortOrder();
        return folder;
    }

    // 이름 변경 전용 메서드
    public void updateName(String newName){
        this.name = newName;
    }

    // 순서 변경 전용 메서드
    public void updateSortOrder(int sortOrder){
        this.sortOrder = sortOrder;
    }

    // 순서 변경 후용 메서드(이름, 순서)
    public void update(String name, int sortOrder){
        this.name = name;
        this.sortOrder = sortOrder;
    }
}
