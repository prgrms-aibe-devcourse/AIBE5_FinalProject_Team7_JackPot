package com.jackpot.whiskeynote.domain.whiskey.repository;

import com.jackpot.whiskeynote.domain.whiskey.entity.Whiskey;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WhiskeyRepository extends JpaRepository<Whiskey,Long> {
    // 위스키 전체 조회

    // 위스키 이름 검색 (포함검색, 대소문자 구분X)
    Page<Whiskey> findByNameContainingIgnoreCase(String name, Pageable pageable);

}
