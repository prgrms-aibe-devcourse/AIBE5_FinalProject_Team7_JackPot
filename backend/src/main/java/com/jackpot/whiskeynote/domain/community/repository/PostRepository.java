package com.jackpot.whiskeynote.domain.community.repository;

import com.jackpot.whiskeynote.domain.community.entity.Post;
import com.jackpot.whiskeynote.domain.community.entity.PostCategory;
import com.jackpot.whiskeynote.domain.community.entity.PostType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findByPostTypeAndIsDeletedFalseOrderByCreatedAtDesc(PostType postType, Pageable pageable);
    Page<Post> findByPostTypeAndCategoryAndIsDeletedFalseOrderByCreatedAtDesc(PostType postType, PostCategory category, Pageable pageable);
    Page<Post> findByIsDeletedFalseOrderByCreatedAtDesc(Pageable pageable);
}
