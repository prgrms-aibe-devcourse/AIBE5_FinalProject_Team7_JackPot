package com.jackpot.whiskeynote.domain.taste.note.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jackpot.whiskeynote.domain.taste.note.dto.AiNoteAnalyzeResponse;
import com.jackpot.whiskeynote.domain.taste.tag.entity.Tag;
import com.jackpot.whiskeynote.domain.taste.tag.entity.TagCategory;
import com.jackpot.whiskeynote.domain.taste.tag.repository.TagRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Anthropic Claude API를 호출해 테이스팅 메모를 분석하는 서비스
 *
 * 흐름:
 * 1. 서버 시작 시 prompts/tasting-note-analyze.md 파일에서 프롬프트 로드
 * 2. 사용자 메모 → Claude API 호출
 * 3. JSON 응답 파싱 (scores, nose_tags, palate_tags)
 * 4. 영문 태그명 → 한글 DB 태그명 변환
 * 5. 한글 태그명 → DB Tag ID 조회
 * 6. AiNoteAnalyzeResponse 반환
 *
 * 프롬프트 수정: src/main/resources/prompts/tasting-note-analyze.md
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AnthropicService {

    private static final String ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
    /*
     * 혹시나 모델을 변경 할 경우
     * https://platform.claude.com/docs/en/about-claude/models/overview 으로 가서
     * 'Claude API ID' 를 확인
     * claude-sonnet-4-6 or claude-opus-4-8
     */
    private static final String MODEL = "claude-haiku-4-5-20251001";
    private static final String API_VERSION = "2023-06-01";

    @Value("${anthropic.api-key:}")
    private String apiKey;

    private final TagRepository tagRepository;

    // ObjectMapper — Bean 미등록이므로 직접 생성
    private final ObjectMapper objectMapper = new ObjectMapper();

    // 서버 시작 시 md 파일에서 프롬프트 로드
    private String systemPrompt;

    @PostConstruct
    public void loadPrompt() {
        try {
            ClassPathResource resource = new ClassPathResource("prompts/tasting-note-analyze.md");
            systemPrompt = resource.getContentAsString(StandardCharsets.UTF_8);
            log.info("AI 테이스팅 노트 분석 프롬프트 로드 완료 ({} chars)", systemPrompt.length());
        } catch (Exception e) {
            log.error("프롬프트 파일 로드 실패: {}", e.getMessage());
            throw new IllegalStateException("prompts/tasting-note-analyze.md 파일을 찾을 수 없습니다.", e);
        }
    }

    // ── 영문 TAG LIST → 한글 DB 태그명 매핑 ──────────────
    private static final Map<String, String> TAG_MAP = Map.ofEntries(
            Map.entry("Citrus",            "시트러스"),
            Map.entry("Orchard Fruit",     "베리류"),
            Map.entry("Stone Fruit",       "베리류"),
            Map.entry("Red Berry",         "베리류"),
            Map.entry("Dark Berry",        "베리류"),
            Map.entry("Dried Fruit",       "베리류"),
            Map.entry("Cooked Fruit",      "베리류"),
            Map.entry("Banana",            "베리류"),
            Map.entry("Floral",            "꽃"),
            Map.entry("Green & Leafy",     "허브"),
            Map.entry("Baking Spice",      "계피"),
            Map.entry("Pepper",            "후추"),
            Map.entry("Herbal",            "허브"),
            Map.entry("Vanilla",           "바닐라"),
            Map.entry("Fresh Oak",         "우디(나무, 오크)"),
            Map.entry("Old Wood",          "우디(나무, 오크)"),
            Map.entry("Honey",             "꿀"),
            Map.entry("Caramel",           "캐러멜"),
            Map.entry("Chocolate & Cocoa", "초콜릿"),
            Map.entry("Nutty",             "견과류"),
            Map.entry("Grain",             "곡물"),
            Map.entry("Peat Smoke",        "피트"),
            Map.entry("Medicinal",         "약품"),
            Map.entry("Coastal",           "흙"),
            Map.entry("Bonfire",           "피트"),
            Map.entry("Leather",           "가죽"),
            Map.entry("Tobacco",           "가죽"),
            Map.entry("Coffee",            "커피")
    );

    /**
     * 테이스팅 메모를 분석해서 점수와 태그 ID를 반환합니다.
     */
    public AiNoteAnalyzeResponse analyze(String memo) {
        // API 키 미설정 시 예외
        if (apiKey == null || apiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "AI 분석 서비스가 설정되지 않았습니다. (application-local.yaml에 anthropic.api-key 추가 필요)");
        }

        // Anthropic API 호출
        String rawJson = callAnthropicApi(memo);

        // 응답 파싱
        return parseResponse(rawJson);
    }

    // ── Anthropic API 호출 ────────────────────────────
    private String callAnthropicApi(String memo) {
        try {
            RestClient client = RestClient.builder()
                    .baseUrl(ANTHROPIC_API_URL)
                    .defaultHeader("x-api-key", apiKey)
                    .defaultHeader("anthropic-version", API_VERSION)
                    .defaultHeader("content-type", "application/json")
                    .build();

            // 요청 바디 구성
            Map<String, Object> requestBody = Map.of(
                    "model", MODEL,
                    "max_tokens", 1024,
                    "system", systemPrompt,
                    "messages", List.of(
                            Map.of("role", "user", "content", memo)
                    )
            );

            // 요청 바디 로그 (디버깅용)
            log.info("Anthropic 요청 - model: {}, memo 길이: {}", MODEL, memo.length());

            // API 호출
            String response = client.post()
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            log.info("Anthropic 응답 수신 완료 - 길이: {}", response != null ? response.length() : 0);

            // content[0].text 추출
            JsonNode root = objectMapper.readTree(response);

            // content[0].text 추출 + 마크다운 코드펜스 제거 (Haiku가 간혹 붙임)
            String rawText = root.path("content").get(0).path("text").asText();
            return stripCodeFence(rawText);

        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("Anthropic API 호출 실패: {} - {}", e.getClass().getSimpleName(), e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI 분석 요청에 실패했습니다: " + e.getMessage());
        }
    }

    // ── 응답 JSON 파싱 ────────────────────────────────
    private AiNoteAnalyzeResponse parseResponse(String rawJson) {
        try {
            JsonNode root = objectMapper.readTree(rawJson);

            // 점수 파싱 (null 허용)
            JsonNode scoresNode = root.path("scores");
            AiNoteAnalyzeResponse.Scores scores = new AiNoteAnalyzeResponse.Scores(
                    parseShort(scoresNode, "body"),
                    parseShort(scoresNode, "finish"),
                    parseShort(scoresNode, "smoky"),
                    parseShort(scoresNode, "spicy"),
                    parseShort(scoresNode, "sweet")
            );

            // nose 태그 파싱 → DB ID 변환
            List<String> noseTagNames = parseTagNames(root.path("nose_tags"));
            List<Long> noseTagIds = resolveTagIds(noseTagNames, TagCategory.nose);

            // palate 태그 파싱 → DB ID 변환
            List<String> palateTagNames = parseTagNames(root.path("palate_tags"));
            List<Long> palateTagIds = resolveTagIds(palateTagNames, TagCategory.taste);

            return new AiNoteAnalyzeResponse(scores, noseTagIds, palateTagIds);

        } catch (Exception e) {
            log.error("AI 응답 파싱 실패 - rawJson: {}, error: {}", rawJson, e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "AI 응답 분석에 실패했습니다: " + e.getMessage());
        }
    }

    // 마크다운 코드펜스 제거 (```json ... ``` 또는 ``` ... ```)
    private String stripCodeFence(String text) {
        if (text == null) return text;
        String trimmed = text.trim();
        // ```json 또는 ``` 로 시작하는 경우 제거
        if (trimmed.startsWith("```")) {
            int firstNewline = trimmed.indexOf('\n');
            if (firstNewline != -1) {
                trimmed = trimmed.substring(firstNewline + 1);
            }
            // 끝의 ``` 제거
            if (trimmed.endsWith("```")) {
                trimmed = trimmed.substring(0, trimmed.lastIndexOf("```")).trim();
            }
        }
        return trimmed;
    }

    // Short 값 파싱 (null 허용)
    private Short parseShort(JsonNode node, String field) {
        JsonNode value = node.path(field);
        return (value.isNull() || value.isMissingNode()) ? null : (short) value.asInt();
    }

    // 태그명 배열 파싱
    private List<String> parseTagNames(JsonNode arrayNode) {
        List<String> names = new ArrayList<>();
        if (arrayNode.isArray()) {
            for (JsonNode item : arrayNode) {
                names.add(item.asText());
            }
        }
        return names;
    }

    // 영문 태그명 → 한글 DB 태그명 → DB Tag ID 변환
    private List<Long> resolveTagIds(List<String> englishNames, TagCategory category) {
        if (englishNames.isEmpty()) return List.of();

        // 영문 → 한글 변환 (중복 제거)
        List<String> koreanNames = englishNames.stream()
                .map(TAG_MAP::get)
                .filter(name -> name != null)
                .distinct()
                .toList();

        if (koreanNames.isEmpty()) return List.of();

        // DB에서 태그 조회
        return tagRepository.findByNameInAndCategory(koreanNames, category)
                .stream()
                .map(Tag::getId)
                .toList();
    }
}
