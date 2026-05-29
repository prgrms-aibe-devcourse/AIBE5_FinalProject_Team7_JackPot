package com.jackpot.whiskeynote.domain.taste.tag.repository;

import com.jackpot.whiskeynote.domain.taste.tag.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TagRepository extends JpaRepository<Tag, Long> {
}
