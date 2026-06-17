package com.jackpot.whiskeynote.domain.whiskey.search.service;

import com.jackpot.whiskeynote.domain.whiskey.dto.WhiskeyCardResponse;
import com.jackpot.whiskeynote.domain.whiskey.entity.Whiskey;
import com.jackpot.whiskeynote.domain.whiskey.repository.WhiskeyRepository;
import com.jackpot.whiskeynote.domain.whiskey.search.dto.WhiskeyKeywordCorrectionResponse;
import com.jackpot.whiskeynote.domain.whiskey.search.dto.WhiskeyKeywordSuggestResponse;
import com.jackpot.whiskeynote.domain.whiskey.search.entity.WhiskeyAlias;
import com.jackpot.whiskeynote.domain.whiskey.search.entity.WhiskeyDocument;
import com.jackpot.whiskeynote.domain.whiskey.search.entity.WhiskeySearchKeywordDocument;
import com.jackpot.whiskeynote.domain.whiskey.search.entity.WhiskeySearchMapper;
import com.jackpot.whiskeynote.domain.whiskey.search.repository.WhiskeyAliasRepository;
import com.jackpot.whiskeynote.domain.whiskey.search.repository.WhiskeySearchKeywordRepository;
import com.jackpot.whiskeynote.domain.whiskey.search.repository.WhiskeySearchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.context.annotation.Profile;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Profile("!test")
@RequiredArgsConstructor
public class WhiskeySearchService {
    private final WhiskeyRepository whiskeyRepository;
    private final WhiskeySearchRepository whiskeySearchRepository;
    private final WhiskeySearchKeywordRepository whiskeySearchKeywordRepository;
    private final ElasticsearchOperations elasticsearchOperations;
    private final WhiskeyAliasRepository whiskeyAliasRepository;

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
        // 키워드가 없는 경우 전체 검색 - Elasticsearch에 저장된 위스키 데이터가 없는 경우에도 JPA로 전체 검색하여 빈 페이지 반환
        if(keyword == null || keyword.isBlank()){
            return whiskeyRepository.findAll(pageRequest).map(WhiskeyCardResponse::from);
        }
        String normalizedKeyword = normalizeSearchKeyword(keyword);
        // name + aliases를 합쳐 색인한 searchText 필드를 edge_ngram 분석기로 검색한다.
        // 색인 analyzer(whiskey_index_analyzer)가 edge_ngram 토큰을 생성하므로,
        // 검색 analyzer(whiskey_search_analyzer)로 분석된 검색어가 접두어/부분 일치로 매칭된다.
        // (기존 leading-wildcard 방식 대비 성능·스코어링 개선)
        NativeQuery query = NativeQuery.builder()
                .withQuery(q -> q.match(m -> m
                        .field("searchText")
                        .query(normalizedKeyword)
                ))
                .withPageable(pageRequest)
                .build();
        // ElasticsearchOperations를 사용하여 쿼리를 실행하고 검색 결과를 가져온다.
        SearchHits<WhiskeyDocument> hits = elasticsearchOperations.search(query, WhiskeyDocument.class);

        List<WhiskeyCardResponse> content = hits.stream()
                .map(SearchHit::getContent)
                .map(WhiskeySearchMapper::toCardResponse)
                .toList();
        return new PageImpl<>(content, pageRequest, hits.getTotalHits());
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
        Long id = whiskey.getId();
         List<String> aliases = whiskeyAliasRepository.findByWhiskeyId(id)
                .stream()
                .map(WhiskeyAlias::getAlias)
                .toList();
        whiskeySearchRepository.save(WhiskeySearchMapper.fromEntity(whiskey, aliases));
    }
    @Transactional(readOnly = true)
    public void reindexAll(){
        List<Whiskey> whiskeys = whiskeyRepository.findAll();
        List<WhiskeyDocument> whiskeyDocuments = buildWhiskeyDocuments(whiskeys);

        // 기본 reindex:
        // WhiskeyDocument의 @Document(indexName = "...")에 설정된 인덱스로 저장한다.
        // 예: indexName이 "whiskeys_current"라면 현재 alias가 바라보는 인덱스에 저장된다.
        whiskeySearchRepository.saveAll(whiskeyDocuments);

        // 자동완성 키워드는 위스키 검색 인덱스와 별도 인덱스(whiskey_search_keywords)를 사용한다.
        // 따라서 버전 인덱스(whiskeys_v2 등)와 무관하게 기존 keyword repository로 갱신한다.
        whiskeySearchKeywordRepository.saveAll(buildKeywordDocuments(whiskeys));
    }

    @Transactional(readOnly = true)
    public void reindexAllTo(String indexName) {
        if (indexName == null || indexName.isBlank()) {
            throw new IllegalArgumentException("색인할 Elasticsearch 인덱스 이름이 필요합니다.");
        }

        List<Whiskey> whiskeys = whiskeyRepository.findAll();
        List<WhiskeyDocument> whiskeyDocuments = buildWhiskeyDocuments(whiskeys);

        // 버전 인덱스 reindex:
        // 운영에서 whiskeys_v2 같은 새 인덱스를 미리 만든 뒤, 그 인덱스로 직접 저장할 때 사용한다.
        // @Document(indexName = "...") 설정을 따르지 않고 indexName 파라미터에 지정한 인덱스에 저장한다.
        // 저장 완료 후 ES alias(예: whiskeys_current)를 새 인덱스로 전환하면 무중단에 가깝게 교체할 수 있다.
        IndexCoordinates targetIndex = IndexCoordinates.of(indexName.trim());
        elasticsearchOperations.save(whiskeyDocuments, targetIndex);

        // 자동완성 키워드 인덱스는 현재 버전 관리 대상이 아니므로 기존 방식으로 갱신한다.
        whiskeySearchKeywordRepository.saveAll(buildKeywordDocuments(whiskeys));
    }

    private List<WhiskeyDocument> buildWhiskeyDocuments(List<Whiskey> whiskeys) {
        List<Long> whiskeyIds = whiskeys.stream()
                .map(Whiskey::getId)
                .toList();

        Map<Long, List<String>> aliasMap = whiskeyAliasRepository.findByWhiskeyIdIn(whiskeyIds)
                .stream()
                .collect(Collectors.groupingBy(
                        WhiskeyAlias::getWhiskeyId,
                        Collectors.mapping(WhiskeyAlias::getAlias, Collectors.toList())
                ));

        return whiskeys.stream()
                .map(whiskey-> WhiskeySearchMapper.fromEntity(
                        whiskey,
                        aliasMap.getOrDefault(whiskey.getId(), List.of())
                ))
                .toList();
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

    private String normalizeSearchKeyword(String keyword) {
        return keyword.trim().replaceAll("\\s+", "");
    }
}
