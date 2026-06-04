package com.jackpot.whiskeynote.domain.whiskey.search.repository;

import com.jackpot.whiskeynote.domain.whiskey.search.entity.WhiskeyDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

public interface WhiskeySearchRepository extends ElasticsearchRepository<WhiskeyDocument,Long> {
    Page<WhiskeyDocument> findByNameContaining(String name, Pageable pageable);
}
