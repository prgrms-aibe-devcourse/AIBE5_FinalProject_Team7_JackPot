package com.jackpot.whiskeynote.domain.taste.tag.repository;

import com.jackpot.whiskeynote.domain.taste.tag.entity.Tag;
import com.jackpot.whiskeynote.domain.taste.tag.entity.TagCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TagRepository extends JpaRepository<Tag, Long> {

    // AI 분석 결과의 한글 태그명으로 태그 ID 조회
    List<Tag> findByNameInAndCategory(List<String> names, TagCategory category);

    @Query("SELECT t FROM Tag t " +
        "WHERE t.category = :category")
    List<Tag> findAllByCategory(@Param("category") TagCategory category);
}
