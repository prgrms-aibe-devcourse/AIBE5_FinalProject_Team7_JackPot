package com.jackpot.whiskeynote.domain.community.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "post_whiskeys")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PostWhiskey {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "post_id", nullable = false)
    private Long postId;

    @Column(name = "whiskey_id", nullable = false)
    private Long whiskeyId;

    @Column(name = "`order`", nullable = false)
    private int order;

    public static PostWhiskey create(Long postId, Long whiskeyId, int order) {
        PostWhiskey pw = new PostWhiskey();
        pw.postId = postId;
        pw.whiskeyId = whiskeyId;
        pw.order = order;
        return pw;
    }
}