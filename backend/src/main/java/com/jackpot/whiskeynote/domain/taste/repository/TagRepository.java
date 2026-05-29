package com.jackpot.whiskeynote.domain.taste.repository;

import com.jackpot.whiskeynote.domain.taste.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TagRepository extends JpaRepository<Tag, Long> {
}
