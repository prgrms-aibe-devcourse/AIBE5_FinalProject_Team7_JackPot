package com.jackpot.whiskeynote.domain.community.column.repository;

import com.jackpot.whiskeynote.domain.community.column.entity.WhiskeyColumn;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WhiskeyColumnRepository extends JpaRepository<WhiskeyColumn, Long> {

    Page<WhiskeyColumn> findAllByOrderByPublishedAtDescCreatedAtDesc(Pageable pageable);

    List<WhiskeyColumn> findTop5ByWhiskeyKeywordContainingIgnoreCaseOrderByPublishedAtDesc(String keyword);
}
