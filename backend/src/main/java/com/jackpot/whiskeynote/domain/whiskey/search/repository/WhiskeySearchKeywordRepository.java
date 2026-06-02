package com.jackpot.whiskeynote.domain.whiskey.search.repository;

import com.jackpot.whiskeynote.domain.whiskey.search.entity.WhiskeySearchKeywordDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

public interface WhiskeySearchKeywordRepository
        extends ElasticsearchRepository<WhiskeySearchKeywordDocument, String> {
}
