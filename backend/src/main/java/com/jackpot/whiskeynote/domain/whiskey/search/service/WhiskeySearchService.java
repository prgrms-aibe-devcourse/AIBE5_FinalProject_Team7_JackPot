package com.jackpot.whiskeynote.domain.whiskey.search.service;

import com.jackpot.whiskeynote.domain.whiskey.dto.WhiskeyCardResponse;
import com.jackpot.whiskeynote.domain.whiskey.entity.Whiskey;
import com.jackpot.whiskeynote.domain.whiskey.repository.WhiskeyRepository;
import com.jackpot.whiskeynote.domain.whiskey.search.dto.WhiskeyKeywordCorrectionResponse;
import com.jackpot.whiskeynote.domain.whiskey.search.dto.WhiskeyKeywordSuggestResponse;
import com.jackpot.whiskeynote.domain.whiskey.search.entity.WhiskeyDocument;
import com.jackpot.whiskeynote.domain.whiskey.search.entity.WhiskeySearchKeywordDocument;
import com.jackpot.whiskeynote.domain.whiskey.search.entity.WhiskeySearchMapper;
import com.jackpot.whiskeynote.domain.whiskey.search.repository.WhiskeySearchKeywordRepository;
import com.jackpot.whiskeynote.domain.whiskey.search.repository.WhiskeySearchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class WhiskeySearchService {
    private final WhiskeyRepository whiskeyRepository;
    private final WhiskeySearchRepository whiskeySearchRepository;
    private final WhiskeySearchKeywordRepository whiskeySearchKeywordRepository;
    private final ElasticsearchOperations elasticsearchOperations;

    private static final List<String> BRAND_KEYWORDS = List.of(
            "조니워커",
            "맥캘란",
            "글렌피딕",
            "글렌모렌지",
            "발베니",
            "라프로익",
            "아드벡",
            "로얄 살루트",
            "로얄 브라클라",
            "와일드 터키",
            "메이커스 마크"
            // 추가예정...
    );
    // 키워드 검색 + 페이징 처리
    @Transactional(readOnly = true)
    public Page<WhiskeyCardResponse> searchByKeyword(String keyword,int page,int size){
        PageRequest pageRequest = PageRequest.of(page,size);

        if(keyword == null || keyword.isBlank()){
            return whiskeyRepository.findAll(pageRequest).map(WhiskeyCardResponse::from);
        }
        return whiskeySearchRepository.findByNameContaining(keyword,pageRequest)
                .map(WhiskeySearchMapper::toCardResponse);
    }
    @Transactional(readOnly = true)
    public List<WhiskeyKeywordSuggestResponse> autocompleteKeyword(String q, int size){
        if(q == null || q.isBlank()){
            return List.of();
        }

        NativeQuery query = NativeQuery.builder()
                .withQuery(queryBuilder -> queryBuilder
                        .prefix(prefix -> prefix
                                .field("keyword")
                                .value(q.trim())
                        )
                )
                .withPageable(PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "weight")))
                .build();

        return elasticsearchOperations.search(query, WhiskeySearchKeywordDocument.class)
                .stream()
                .map(SearchHit::getContent)
                .map(WhiskeyKeywordSuggestResponse::from)
                .toList();

    }
    // 위스키 1개만 Elasticsearch에 저장하는 메서드
    @Transactional(readOnly = true)
    public void indexOne(Long whiskeyId){
        Whiskey whiskey = whiskeyRepository.findById(whiskeyId)
                .orElseThrow(() -> new IllegalArgumentException("위스키를 찾을 수 없습니다."));

        whiskeySearchRepository.save(WhiskeySearchMapper.fromEntity(whiskey));
    }
    @Transactional(readOnly = true)
    public void reindexAll(){
        List<Whiskey> whiskeys = whiskeyRepository.findAll();

        List<WhiskeyDocument> whiskeyDocuments = whiskeys.stream()
                .map(WhiskeySearchMapper::fromEntity)
                .toList();

        whiskeySearchRepository.saveAll(whiskeyDocuments);
        whiskeySearchKeywordRepository.saveAll(buildKeywordDocuments(whiskeys));
    }
    @Transactional(readOnly = true)
    public WhiskeyKeywordCorrectionResponse correctKeyword(String q){
        if (q == null || q.isBlank()) {
            return WhiskeyKeywordCorrectionResponse.empty(q);
        }
        String originalKeyword = q.trim();

        NativeQuery query = NativeQuery.builder()
                .withQuery(queryBuilder -> queryBuilder
                        .fuzzy(fuzzy->fuzzy
                        .field("keyword")
                        .value(originalKeyword)
                        .fuzziness("AUTO")
                )
        )
        .withPageable(PageRequest.of(0, 1, Sort.by(Sort.Direction.DESC, "weight")))
                .build();

        return elasticsearchOperations.search(query,WhiskeySearchKeywordDocument.class)
                .stream()
                .map(SearchHit::getContent)
                .map(WhiskeySearchKeywordDocument::getKeyword)
                .filter(keyword -> !keyword.equals(originalKeyword))
                .findFirst()
                .map(correctedKeyword -> WhiskeyKeywordCorrectionResponse.of(originalKeyword, correctedKeyword))
                .orElseGet(() -> WhiskeyKeywordCorrectionResponse.empty(originalKeyword));
    }
    // 위스키 리스트에서 브랜드 키워드 추출 및 가중치 계산하여 Elasticsearch에 저장할 키워드 문서 리스트를 생성하는 메서드
    private List<WhiskeySearchKeywordDocument> buildKeywordDocuments(List<Whiskey> whiskeys) {
        Map<String, Integer> keywordCounts = new LinkedHashMap<>();

        for (Whiskey whiskey : whiskeys) {
            String keyword = extractKeyword(whiskey.getName());

            if (keyword == null) {
                continue;
            }

            keywordCounts.put(keyword, keywordCounts.getOrDefault(keyword, 0) + 1);
        }

        return keywordCounts.entrySet()
                .stream()
                .map(entry -> WhiskeySearchKeywordDocument.builder()
                        .id(entry.getKey())
                        .keyword(entry.getKey())
                        .weight(entry.getValue())
                        .build())
                .toList();
    }
    // 위스키 이름에서 브랜드 키워드를 추출하는 메서드
    private String extractKeyword(String whiskeyName){
        if (whiskeyName == null || whiskeyName.isBlank()) {
            return null;
        }

        String normalizedName = whiskeyName.trim();

        for(String brandKeyword : BRAND_KEYWORDS){
            if(normalizedName.startsWith(brandKeyword)){
                return brandKeyword;
            }
        }
        return normalizedName.split("\\s+")[0];
    }
}
