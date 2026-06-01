package com.jackpot.whiskeynote.domain.taste.note.service;

import com.jackpot.whiskeynote.domain.member.entity.AuthProvider;
import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import com.jackpot.whiskeynote.domain.taste.note.dto.TastingNoteCreateRequest;
import com.jackpot.whiskeynote.domain.taste.note.dto.TastingNoteResponse;
import com.jackpot.whiskeynote.domain.taste.note.dto.TastingNoteUpdateRequest;
import com.jackpot.whiskeynote.domain.taste.tag.entity.Tag;
import com.jackpot.whiskeynote.domain.taste.note.entity.TastingNote;
import com.jackpot.whiskeynote.domain.taste.tag.repository.TagRepository;
import com.jackpot.whiskeynote.domain.taste.note.repository.TastingNoteRepository;
import com.jackpot.whiskeynote.domain.whiskey.entity.AvgWhiskeyTag;
import com.jackpot.whiskeynote.domain.whiskey.entity.Whiskey;
import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeysNoteCache;
import com.jackpot.whiskeynote.domain.whiskey.repository.WhiskeyRepository;
import com.jackpot.whiskeynote.domain.whiskey.repository.WhiskeysNoteCacheRepository;
import com.jackpot.whiskeynote.global.security.SecurityConfig;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.cors.CorsConfigurationSource;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class TastingNoteServiceTest {
    @MockitoBean private CorsConfigurationSource corsConfigurationSource;
    @MockitoBean private SecurityConfig securityConfig;

    @Autowired private TastingNoteService tastingNoteService;
    @Autowired private UsersRepository usersRepository;
    @Autowired private WhiskeyRepository whiskeyRepository;
    @Autowired private TagRepository tagRepository;
    @Autowired private TastingNoteRepository tastingNoteRepository;
    @Autowired private WhiskeysNoteCacheRepository whiskeysNoteCacheRepository;

    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private EntityManager entityManager;

    private List<Users> users;
    private Whiskey whiskey;
    private List<Tag> tags;

    @BeforeEach
    void setUp() {
        // user = usersRepository.save(Users.create("testUser"));
        // whiskey = whiskeyRepository.save(Whiskey.create("Glenfiddich"));
        // tags = tagRepository.saveAll(List.of(
        //     Tag.create("스모키"),
        //     Tag.create("달콤한"),
        //     Tag.create("과일향")
        // ));
        users = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            users.add(
                usersRepository.save(
                    Users.builder()
                        .email("test email " + i)
                        .passwordHash(passwordEncoder.encode("password"))
                        .authProvider(AuthProvider.LOCAL)
                        .nickname("test nickname " + i)
                        .birthday(LocalDate.now())
                        .build()
                )
            );
        }
        whiskey = whiskeyRepository.save(
            Whiskey.builder()
                .name("Glenfiddich")
                .build()
        );
        tags = tagRepository.saveAll(List.of(
            Tag.builder().name("스모키").build(),
            Tag.builder().name("달콤한").build(),
            Tag.builder().name("과일향").build()
        ));
    }

    // @AfterEach
    // void tearDown() {
    //     tastingNoteRepository.deleteAll();
    //     whiskeysNoteCacheRepository.deleteAll();
    //     tagRepository.deleteAll();
    //     whiskeyRepository.deleteAll();
    //     usersRepository.deleteAll();
    // }

    // ===== createTastingNote =====

    @Test
    @DisplayName("공개 노트 생성 시 캐시에 점수와 태그가 반영된다")
    void createTastingNote_published_appliesScoreAndTags() {
        // given
        Users user = users.get(0);
        TastingNoteCreateRequest request = new TastingNoteCreateRequest(
            whiskey.getId(),
            (short) 3, (short) 4, (short) 5, (short) 2, (short) 3,
            "테스트 메모",
            false,
            tags.stream().map(Tag::getId).toList()
        );

        // when
        TastingNoteResponse response = tastingNoteService.createTastingNote(user.getId(), request);

        // then
        TastingNote note = tastingNoteRepository.findById(response.id())
            .orElseThrow();
        assertThat(note.getIsDraft()).isFalse();
        assertThat(note.getNoteTags()).hasSize(3);

        WhiskeysNoteCache cache = whiskeysNoteCacheRepository.findByWhiskeyId(whiskey.getId())
            .orElseThrow();
        assertThat(cache.getCount()).isEqualTo(1); // 추가
        assertThat(cache.getBodyScore()).isEqualTo(3L);
        assertThat(cache.getFinishScore()).isEqualTo(4L);
        assertThat(cache.getSmokyScore()).isEqualTo(5L);
        assertThat(cache.getAvgWhiskeyTags()).hasSize(3);
        assertThat(cache.getAvgWhiskeyTags())
            .allMatch(avgTag -> avgTag.getCount() == 1);
    }

    @Test
    @DisplayName("임시저장 노트 생성 시 캐시에 반영되지 않는다")
    void createTastingNote_draft_doesNotApplyCache() {
        // given
        Users user = users.get(0);
        TastingNoteCreateRequest request = new TastingNoteCreateRequest(
            whiskey.getId(),
            (short) 3, (short) 4, (short) 5, (short) 2, (short) 3,
            "임시저장 메모",
            true,
            tags.stream().map(Tag::getId).toList()
        );

        // when
        tastingNoteService.createTastingNote(user.getId(), request);

        // then
        assertThat(whiskeysNoteCacheRepository.findByWhiskeyId(whiskey.getId())).isEmpty();
    }

    @Test
    @DisplayName("공개 노트를 여러 번 생성하면 캐시 점수가 누적된다")
    void createTastingNote_multipleTimes_accumulatesScore() {
        // given
        Users user1 = users.get(0);
        TastingNoteCreateRequest request1 = new TastingNoteCreateRequest(
            whiskey.getId(),
            (short) 3, (short) 4, (short) 5, (short) 2, (short) 3,
            "메모",
            false,
            tags.stream().map(Tag::getId).toList()
        );
        Users user2 = users.get(1);
        TastingNoteCreateRequest request2 = new TastingNoteCreateRequest(
            whiskey.getId(),
            (short) 4, (short) 2, (short) 5, (short) 2, (short) 3,
            "메모",
            false,
            tags.stream().map(Tag::getId).toList()
        );

        // when
        tastingNoteService.createTastingNote(user1.getId(), request1);
        tastingNoteService.createTastingNote(user2.getId(), request2);

        // then
        WhiskeysNoteCache cache = whiskeysNoteCacheRepository.findByWhiskeyId(whiskey.getId())
            .orElseThrow();
        assertThat(cache.getCount()).isEqualTo(2);
        assertThat(cache.getBodyScore()).isEqualTo(7L);   // 3 + 4
        assertThat(cache.getFinishScore()).isEqualTo(6L); // 4 + 2
        assertThat(cache.getAvgWhiskeyTags())
            .allMatch(avgTag -> avgTag.getCount() == 2);
    }

    @Test
    @DisplayName("존재하지 않는 유저로 노트 생성 시 예외가 발생한다")
    void createTastingNote_userNotFound_throwsException() {
        // given
        TastingNoteCreateRequest request = new TastingNoteCreateRequest(
            whiskey.getId(),
            (short) 3, (short) 4, (short) 5, (short) 2, (short) 3,
            "메모",
            false,
            tags.stream().map(Tag::getId).toList()
        );

        // when & then
        assertThatThrownBy(() -> tastingNoteService.createTastingNote(999L, request))
            .isInstanceOf(EntityNotFoundException.class)
            .hasMessage("User not found");
    }

    @Test
    @DisplayName("태그 없이 공개 노트 생성 시 캐시 점수만 반영된다")
    void createTastingNote_noTags_appliesOnlyScore() {
        // given
        Users user = users.get(0);
        TastingNoteCreateRequest request = new TastingNoteCreateRequest(
            whiskey.getId(),
            (short) 3, (short) 4, (short) 5, (short) 2, (short) 3,
            "메모",
            false,
            List.of()
        );

        // when
        tastingNoteService.createTastingNote(user.getId(), request);

        // then
        WhiskeysNoteCache cache = whiskeysNoteCacheRepository.findByWhiskeyId(whiskey.getId())
            .orElseThrow();
        assertThat(cache.getCount()).isEqualTo(1);
        assertThat(cache.getBodyScore()).isEqualTo(3L);
        assertThat(cache.getAvgWhiskeyTags()).isEmpty();
    }

    // ===== updateTastingNote =====

    @Test
    @DisplayName("공개 노트 수정 시 캐시에 기존 점수가 차감되고 새 점수가 반영된다")
    void updateTastingNote_published_to_published_updatesCache() {
        // given
        Users user = users.get(0);
        TastingNoteCreateRequest createRequest = new TastingNoteCreateRequest(
            whiskey.getId(), (short) 3, (short) 4, (short) 5, (short) 2, (short) 3, "메모", false,
            tags.stream().map(Tag::getId).toList()
        );
        TastingNoteResponse created = tastingNoteService.createTastingNote(user.getId(), createRequest);

        TastingNoteUpdateRequest updateRequest = new TastingNoteUpdateRequest(
            (short) 5, (short) 5, (short) 5, (short) 5, (short) 5, "수정 메모", false,
            tags.stream().map(Tag::getId).toList()
        );

        // when
        tastingNoteService.updateTastingNote(user.getId(), created.id(), updateRequest);

        // then
        WhiskeysNoteCache cache = whiskeysNoteCacheRepository.findByWhiskeyId(whiskey.getId())
            .orElseThrow();
        assertThat(cache.getBodyScore()).isEqualTo(5L);   // 3 차감 후 5 반영
        assertThat(cache.getFinishScore()).isEqualTo(5L); // 4 차감 후 5 반영
    }

    @Test
    @DisplayName("임시저장 노트를 공개로 전환하면 캐시에 점수와 태그가 반영된다")
    void updateTastingNote_draft_to_published_appliesCache() {
        // given
        Users user = users.get(0);
        TastingNoteCreateRequest createRequest = new TastingNoteCreateRequest(
            whiskey.getId(), (short) 3, (short) 4, (short) 5, (short) 2, (short) 3, "메모", true,
            tags.stream().map(Tag::getId).toList()
        );
        TastingNoteResponse created = tastingNoteService.createTastingNote(user.getId(), createRequest);

        TastingNoteUpdateRequest updateRequest = new TastingNoteUpdateRequest(
            (short) 3, (short) 4, (short) 5, (short) 2, (short) 3, "메모", false,
            tags.stream().map(Tag::getId).toList()
        );

        // when
        tastingNoteService.updateTastingNote(user.getId(), created.id(), updateRequest);

        // then
        WhiskeysNoteCache cache = whiskeysNoteCacheRepository.findByWhiskeyId(whiskey.getId())
            .orElseThrow();
        assertThat(cache.getCount()).isEqualTo(1);
        assertThat(cache.getBodyScore()).isEqualTo(3L);
        assertThat(cache.getAvgWhiskeyTags()).hasSize(3);
        assertThat(cache.getAvgWhiskeyTags())
            .allMatch(avgTag -> avgTag.getCount() == 1);
    }

    @Test
    @DisplayName("공개 노트를 임시저장으로 전환하면 캐시에서 점수와 태그가 차감된다")
    void updateTastingNote_published_to_draft_revertsCache() {
        // given
        Users user = users.get(0);
        TastingNoteCreateRequest createRequest = new TastingNoteCreateRequest(
            whiskey.getId(), (short) 3, (short) 4, (short) 5, (short) 2, (short) 3, "메모", false,
            tags.stream().map(Tag::getId).toList()
        );
        TastingNoteResponse created = tastingNoteService.createTastingNote(user.getId(), createRequest);

        TastingNoteUpdateRequest updateRequest = new TastingNoteUpdateRequest(
            (short) 3, (short) 4, (short) 5, (short) 2, (short) 3, "메모", true,
            tags.stream().map(Tag::getId).toList()
        );

        // when
        tastingNoteService.updateTastingNote(user.getId(), created.id(), updateRequest);

        // then
        WhiskeysNoteCache cache = whiskeysNoteCacheRepository.findByWhiskeyId(whiskey.getId())
            .orElseThrow();
        assertThat(cache.getCount()).isEqualTo(0);
        assertThat(cache.getBodyScore()).isEqualTo(0L);
        assertThat(cache.getAvgWhiskeyTags())
            .allMatch(avgTag -> avgTag.getCount() == 0);
    }

    @Test
    @DisplayName("임시저장 노트를 임시저장으로 수정해도 캐시에 반영되지 않는다")
    void updateTastingNote_draft_to_draft_doesNotApplyCache() {
        // given
        Users user = users.get(0);
        TastingNoteCreateRequest createRequest = new TastingNoteCreateRequest(
            whiskey.getId(), (short) 3, (short) 4, (short) 5, (short) 2, (short) 3, "메모", true,
            tags.stream().map(Tag::getId).toList()
        );
        TastingNoteResponse created = tastingNoteService.createTastingNote(user.getId(), createRequest);

        TastingNoteUpdateRequest updateRequest = new TastingNoteUpdateRequest(
            (short) 5, (short) 5, (short) 5, (short) 5, (short) 5, "수정 메모", true,
            tags.stream().map(Tag::getId).toList()
        );

        // when
        tastingNoteService.updateTastingNote(user.getId(), created.id(), updateRequest);

        // then
        assertThat(whiskeysNoteCacheRepository.findByWhiskeyId(whiskey.getId())).isEmpty();
    }

    @Test
    @DisplayName("공개 노트 수정 시 태그가 변경되면 캐시의 태그 카운트가 올바르게 반영된다")
    void updateTastingNote_published_tagChanged_updatesCacheTagCount() {
        // given — 태그 3개로 공개 노트 생성
        Users user = users.get(0);
        TastingNoteCreateRequest createRequest = new TastingNoteCreateRequest(
            whiskey.getId(), (short) 3, (short) 4, (short) 5, (short) 2, (short) 3, "메모", false,
            tags.stream().map(Tag::getId).toList()
        );
        TastingNoteResponse created = tastingNoteService.createTastingNote(user.getId(), createRequest);

        // when — 태그 1개만 남기고 수정
        List<Long> newTagIds = List.of(tags.get(0).getId());
        TastingNoteUpdateRequest updateRequest = new TastingNoteUpdateRequest(
            (short) 3, (short) 4, (short) 5, (short) 2, (short) 3, "메모", false, newTagIds
        );
        tastingNoteService.updateTastingNote(user.getId(), created.id(), updateRequest);

        // 1차 캐시 초기화
        entityManager.flush();
        entityManager.clear();

        // then
        WhiskeysNoteCache cache = whiskeysNoteCacheRepository.findByWhiskeyIdWithAvgTags(whiskey.getId())
            .orElseThrow();
        Map<Long, Integer> countByTagId = cache.getAvgWhiskeyTags().stream()
            .collect(Collectors.toMap(t -> t.getTag().getId(), AvgWhiskeyTag::getCount));

        assertThat(countByTagId.get(tags.get(0).getId())).isEqualTo(1); // 유지
        assertThat(countByTagId.get(tags.get(1).getId())).isNull(); // 삭제됨
        assertThat(countByTagId.get(tags.get(2).getId())).isNull(); // 삭제됨
    }

    @Test
    @DisplayName("존재하지 않는 노트 수정 시 예외가 발생한다")
    void updateTastingNote_noteNotFound_throwsException() {
        // given
        Users user = users.get(0);
        TastingNoteUpdateRequest updateRequest = new TastingNoteUpdateRequest(
            (short) 3, (short) 4, (short) 5, (short) 2, (short) 3, "메모", false,
            tags.stream().map(Tag::getId).toList()
        );

        // when & then
        assertThatThrownBy(() -> tastingNoteService.updateTastingNote(user.getId(), 999L, updateRequest))
            .isInstanceOf(EntityNotFoundException.class)
            .hasMessage("TastingNote not found");
    }

    // ===== deleteTastingNote =====

    @Test
    @DisplayName("공개 노트 삭제 시 캐시에서 점수와 태그가 차감된다")
    void deleteTastingNote_published_revertsCache() {
        // given
        Users user = users.get(0);
        TastingNoteCreateRequest createRequest = new TastingNoteCreateRequest(
            whiskey.getId(), (short) 3, (short) 4, (short) 5, (short) 2, (short) 3, "메모", false,
            tags.stream().map(Tag::getId).toList()
        );
        TastingNoteResponse created = tastingNoteService.createTastingNote(user.getId(), createRequest);

        // when
        tastingNoteService.deleteTastingNote(user.getId(), created.id());

        entityManager.flush();
        entityManager.clear();

        // then
        WhiskeysNoteCache cache = whiskeysNoteCacheRepository.findByWhiskeyId(whiskey.getId())
            .orElseThrow();
        assertThat(cache.getCount()).isEqualTo(0);
        assertThat(cache.getBodyScore()).isEqualTo(0L);
        assertThat(cache.getFinishScore()).isEqualTo(0L);
        assertThat(cache.getAvgWhiskeyTags()).isEmpty();
    }

    @Test
    @DisplayName("임시저장 노트 삭제 시 캐시에 영향을 주지 않는다")
    void deleteTastingNote_draft_doesNotRevertCache() {
        // given — 공개 노트를 먼저 만들어 캐시 생성
        Users user1 = users.get(0);
        TastingNoteCreateRequest publishedRequest = new TastingNoteCreateRequest(
            whiskey.getId(), (short) 3, (short) 4, (short) 5, (short) 2, (short) 3, "공개 메모", false,
            tags.stream().map(Tag::getId).toList()
        );
        tastingNoteService.createTastingNote(user1.getId(), publishedRequest);

        // 임시저장 노트 생성
        Users user2 = users.get(1);
        TastingNoteCreateRequest draftRequest = new TastingNoteCreateRequest(
            whiskey.getId(), (short) 5, (short) 5, (short) 5, (short) 5, (short) 5, "임시저장 메모", true,
            tags.stream().map(Tag::getId).toList()
        );
        TastingNoteResponse draft = tastingNoteService.createTastingNote(user2.getId(), draftRequest);

        // when
        tastingNoteService.deleteTastingNote(user2.getId(), draft.id());

        entityManager.flush();
        entityManager.clear();

        // then — 캐시는 공개 노트 기준 그대로
        WhiskeysNoteCache cache = whiskeysNoteCacheRepository.findByWhiskeyId(whiskey.getId())
            .orElseThrow();
        assertThat(cache.getCount()).isEqualTo(1);
        assertThat(cache.getBodyScore()).isEqualTo(3L);
        assertThat(cache.getAvgWhiskeyTags()).hasSize(3);
        assertThat(cache.getAvgWhiskeyTags())
            .allMatch(avgTag -> avgTag.getCount() == 1);
    }

    @Test
    @DisplayName("공개 노트 삭제 시 TastingNote와 TastingNoteTag가 함께 삭제된다")
    void deleteTastingNote_published_deletesNoteAndTags() {
        Users user = users.get(0);
        // given
        TastingNoteCreateRequest createRequest = new TastingNoteCreateRequest(
            whiskey.getId(), (short) 3, (short) 4, (short) 5, (short) 2, (short) 3, "메모", false,
            tags.stream().map(Tag::getId).toList()
        );
        TastingNoteResponse created = tastingNoteService.createTastingNote(user.getId(), createRequest);

        // when
        tastingNoteService.deleteTastingNote(user.getId(), created.id());

        entityManager.flush();
        entityManager.clear();

        // then
        assertThat(tastingNoteRepository.findById(created.id())).isEmpty();
    }

    @Test
    @DisplayName("존재하지 않는 노트 삭제 시 예외가 발생한다")
    void deleteTastingNote_noteNotFound_throwsException() {
        Users user = users.get(0);
        assertThatThrownBy(() -> tastingNoteService.deleteTastingNote(user.getId(), 999L))
            .isInstanceOf(EntityNotFoundException.class)
            .hasMessage("TastingNote not found");
    }

    @Test
    @DisplayName("공개 노트 삭제 후 count가 0인 태그는 캐시에서 제거된다")
    void deleteTastingNote_published_removesZeroCountTags() {
        Users user1 = users.get(0);
        Users user2 = users.get(1);
        // given — 노트 2개, 첫 번째 노트만 tag[0] 포함
        TastingNoteCreateRequest firstRequest = new TastingNoteCreateRequest(
            whiskey.getId(), (short) 3, (short) 4, (short) 5, (short) 2, (short) 3, "첫 번째", false,
            List.of(tags.get(0).getId())
        );
        TastingNoteCreateRequest secondRequest = new TastingNoteCreateRequest(
            whiskey.getId(), (short) 3, (short) 4, (short) 5, (short) 2, (short) 3, "두 번째", false,
            List.of(tags.get(1).getId(), tags.get(2).getId())
        );
        TastingNoteResponse first = tastingNoteService.createTastingNote(user1.getId(), firstRequest);
        tastingNoteService.createTastingNote(user2.getId(), secondRequest);

        // when — 첫 번째 노트 삭제
        tastingNoteService.deleteTastingNote(user1.getId(), first.id());

        entityManager.flush();
        entityManager.clear();

        // then — tag[0]은 count 0이므로 제거, tag[1], tag[2]는 유지
        WhiskeysNoteCache cache = whiskeysNoteCacheRepository.findByWhiskeyIdWithAvgTags(whiskey.getId())
            .orElseThrow();
        Map<Long, Integer> countByTagId = cache.getAvgWhiskeyTags().stream()
            .collect(Collectors.toMap(t -> t.getTag().getId(), AvgWhiskeyTag::getCount));

        assertThat(countByTagId.get(tags.get(0).getId())).isNull();  // 제거됨
        assertThat(countByTagId.get(tags.get(1).getId())).isEqualTo(1);
        assertThat(countByTagId.get(tags.get(2).getId())).isEqualTo(1);
    }
}