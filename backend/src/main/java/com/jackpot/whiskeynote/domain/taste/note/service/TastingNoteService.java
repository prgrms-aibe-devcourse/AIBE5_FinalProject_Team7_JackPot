package com.jackpot.whiskeynote.domain.taste.note.service;

import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import com.jackpot.whiskeynote.domain.taste.note.dto.TastingNoteCreateRequest;
import com.jackpot.whiskeynote.domain.taste.note.dto.TastingNoteResponse;
import com.jackpot.whiskeynote.domain.taste.note.dto.TastingNoteUpdateRequest;
import com.jackpot.whiskeynote.domain.taste.note.dto.TastingNoteTagResponse;
import com.jackpot.whiskeynote.domain.taste.tag.entity.Tag;
import com.jackpot.whiskeynote.domain.taste.note.entity.TastingNote;
import com.jackpot.whiskeynote.domain.taste.note.entity.TastingNoteTag;
import com.jackpot.whiskeynote.domain.taste.tag.repository.TagRepository;
import com.jackpot.whiskeynote.domain.taste.note.repository.TastingNoteRepository;
import com.jackpot.whiskeynote.domain.taste.note.vo.WhiskeyScoreVo;
import com.jackpot.whiskeynote.domain.whiskey.entity.Whiskey;
import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeysNoteCache;
import com.jackpot.whiskeynote.domain.taste.review.repository.ReviewRepository;
import com.jackpot.whiskeynote.domain.whiskey.repository.WhiskeyRepository;
import com.jackpot.whiskeynote.domain.whiskey.repository.WhiskeysNoteCacheRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class TastingNoteService {
    private final TastingNoteRepository tastingNoteRepository;
    private final WhiskeysNoteCacheRepository whiskeysNoteCacheRepository;
    private final WhiskeyRepository whiskeyRepository;
    private final UsersRepository usersRepository;
    private final TagRepository tagRepository;
    private final ReviewRepository reviewRepository;

    /**
     * 테이스팅 노트를 새로 생성합니다.
     *
     * <p>처리 흐름:
     * <ol>
     *   <li>유저 및 위스키 엔티티 조회</li>
     *   <li>TastingNote 생성 및 태그 설정 후 저장 (TastingNoteTag는 cascade로 함께 저장)</li>
     *   <li>공개 노트인 경우 WhiskeysNoteCache에 점수 및 태그 카운트 반영</li>
     * </ol>
     *
     * <p>임시저장(isDraft=true)인 경우 WhiskeysNoteCache에 반영되지 않습니다.
     *
     * @param userId  노트를 작성하는 유저의 ID (컨트롤러에서 인증 정보로 주입)
     * @param request 노트 생성 요청 DTO (위스키 ID, 점수, 태그 목록, 임시저장 여부 포함)
     * @return 생성된 노트의 응답 DTO
     * @throws EntityNotFoundException 유저, 위스키가 존재하지 않을 경우
     */
    public TastingNoteResponse createTastingNote(Long userId, TastingNoteCreateRequest request) {
        // 1. 유저 및 위스키 엔티티 조회
        Users user = usersRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found"));
        Whiskey whiskey = whiskeyRepository.findById(request.whiskeyId())
            .orElseThrow(() -> new EntityNotFoundException("Whiskey not found"));

        // 2. TastingNote 생성 및 태그 설정
        WhiskeyScoreVo scoreVo = WhiskeyScoreVo.from(request);
        TastingNote note = TastingNote.create(user, whiskey, scoreVo, request.memo(), request.isDraft());
        List<Tag> tags = tagRepository.findAllById(request.tagIds());
        note.updateTags(tags);
        tastingNoteRepository.save(note);

        // 3. 공개 노트인 경우 캐시에 점수 및 태그 반영
        if (!Boolean.TRUE.equals(request.isDraft())) {
            WhiskeysNoteCache cache = whiskeysNoteCacheRepository.findByWhiskeyIdWithAvgTags(whiskey.getId())
                .orElseGet(() -> WhiskeysNoteCache.init(whiskey));
            cache.applyScore(scoreVo);
            cache.applyTags(tags);
            whiskeysNoteCacheRepository.save(cache);
        }

        List<TastingNoteTagResponse> tagResponses = tags.stream()
            .map(TastingNoteTagResponse::from)
            .toList();
        return TastingNoteResponse.from(note, tagResponses);
    }

    /**
     * 테이스팅 노트를 수정합니다.
     *
     * <p>처리 흐름:
     * <ol>
     *   <li>노트 조회 및 수정 전 상태 저장 (점수, 태그, 공개 여부)</li>
     *   <li>노트 태그 및 점수 수정 후 저장 (TastingNoteTag는 cascade로 함께 저장)</li>
     *   <li>공개 상태 변화에 따라 WhiskeysNoteCache에 점수 및 태그 차감/반영</li>
     * </ol>
     *
     * <p>캐시 반영 기준:
     * <ul>
     *   <li>수정 전 공개 상태였다면 기존 점수 및 태그 카운트 차감</li>
     *   <li>수정 후 공개 상태라면 새 점수 및 태그 카운트 반영</li>
     *   <li>임시저장 → 임시저장인 경우 캐시에 반영하지 않음</li>
     * </ul>
     *
     * @param userId  노트를 수정하는 유저의 ID (컨트롤러에서 인증 정보로 주입)
     * @param noteId  수정할 노트의 ID
     * @param request 노트 수정 요청 DTO (점수, 태그 목록, 임시저장 여부 포함)
     * @return 수정된 노트의 응답 DTO
     * @throws EntityNotFoundException 노트 또는 캐시가 존재하지 않을 경우
     */
    public TastingNoteResponse updateTastingNote(Long userId, Long noteId, TastingNoteUpdateRequest request) {
        // 1. 노트 조회
        TastingNote note = tastingNoteRepository.findByIdWithTags(noteId)
            .orElseThrow(() -> new EntityNotFoundException("TastingNote not found"));

        validateOwner(note, userId, "본인의 시음 노트만 수정할 수 있습니다.");
        boolean wasPublished = !Boolean.TRUE.equals(note.getIsDraft());
        // TODO: 검증 - (wasPublished == true && request.isDraft == false) -> 작성 완료된 노트를 작성 중으로 되돌릴 수 없습니다.
        WhiskeyScoreVo oldScoreVo = note.getScoreVo();
        List<Tag> oldTags = note.getNoteTags().stream()
            .map(TastingNoteTag::getTag)
            .toList();

        // 2. 노트 태그 및 점수 수정
        List<Tag> newTags = tagRepository.findAllById(request.tagIds());
        note.updateTags(newTags);
        WhiskeyScoreVo newScoreVo = WhiskeyScoreVo.from(request);
        note.update(newScoreVo, request.memo(), request.isDraft());
        tastingNoteRepository.save(note);

        // 3. 공개 상태 변화에 따라 캐시에 점수 및 태그 차감/반영
        if (wasPublished || !Boolean.TRUE.equals(request.isDraft())) {
            WhiskeysNoteCache cache = whiskeysNoteCacheRepository.findByWhiskeyIdWithAvgTags(note.getWhiskey().getId())
                .orElseGet(() -> WhiskeysNoteCache.init(note.getWhiskey()));

            // 3-1. 공개 상태였다면 기존 점수 및 태그 차감
            if (wasPublished) {
                cache.revertScore(oldScoreVo);
                cache.revertTags(oldTags);
            }
            // 3-2. 공개 상태로 저장한다면 새 점수 및 태그 반영
            if (!Boolean.TRUE.equals(request.isDraft())) {
                cache.applyScore(newScoreVo);
                cache.applyTags(newTags);
            }

            cache.removeZeroCountTags();
            whiskeysNoteCacheRepository.save(cache);
        }

        List<TastingNoteTagResponse> tagResponses = newTags.stream()
            .map(TastingNoteTagResponse::from)
            .toList();
        return TastingNoteResponse.from(note, tagResponses);
    }

    /**
     * 테이스팅 노트를 삭제합니다.
     *
     * <p>처리 흐름:
     * <ol>
     *   <li>노트 조회 (TastingNoteTag 포함)</li>
     *   <li>공개 노트인 경우 WhiskeysNoteCache에서 점수 및 태그 카운트 차감</li>
     *   <li>노트 삭제 (TastingNoteTag는 cascade로 함께 삭제)</li>
     * </ol>
     *
     * <p>임시저장 노트는 캐시에 반영되지 않았으므로 캐시 차감 없이 삭제됩니다.
     *
     * @param userId 노트를 삭제하는 유저의 ID (컨트롤러에서 인증 정보로 주입)
     * @param noteId 삭제할 노트의 ID
     * @throws EntityNotFoundException 노트 또는 캐시가 존재하지 않을 경우
     */
    public void deleteTastingNote(Long userId, Long noteId) {
        // 1. 노트 조회
        TastingNote note = tastingNoteRepository.findByIdWithTags(noteId)
            .orElseThrow(() -> new EntityNotFoundException("TastingNote not found"));

        validateOwner(note, userId, "본인의 시음 노트만 삭제할 수 있습니다.");

        // 2. 공개 노트인 경우 캐시에서 점수 및 태그 차감
        if (!Boolean.TRUE.equals(note.getIsDraft())) {
            WhiskeysNoteCache cache = whiskeysNoteCacheRepository.findByWhiskeyIdWithAvgTags(note.getWhiskey().getId())
                .orElseThrow(() -> new EntityNotFoundException("NoteCache not found"));
            WhiskeyScoreVo scoreVo = note.getScoreVo();
            cache.revertScore(scoreVo);
            cache.revertTags(note.getNoteTags().stream()
                .map(TastingNoteTag::getTag)
                .toList());
            cache.removeZeroCountTags();
            whiskeysNoteCacheRepository.save(cache);
        }

        // 3. 노트 삭제
        tastingNoteRepository.delete(note);
    }

    // 내 노트 목록 조회
    @Transactional(readOnly = true)
    public Page<TastingNoteResponse> getMyTastingNotes(Long userId, int page, int size) {
        if (!usersRepository.existsById(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다.");
        }
        PageRequest pageRequest = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "updatedAt")
        );
        return tastingNoteRepository.findByUserIdOrderByUpdatedAtDesc(userId, pageRequest)
                .map(note -> {
                    List<TastingNoteTagResponse> tagResponses = note.getNoteTags().stream()
                            .map(noteTag -> TastingNoteTagResponse.from(noteTag.getTag()))
                            .toList();
                    return TastingNoteResponse.from(note, tagResponses);
                });
    }

    // 시음 노트 단건 조회 — 본인 노트 또는 리뷰에 첨부된 공개 노트
    @Transactional(readOnly = true)
    public TastingNoteResponse getTastingNoteForView(Long viewerUserId, Long noteId) {
        TastingNote note = tastingNoteRepository.findByIdWithTags(noteId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "시음 노트를 찾을 수 없습니다."
                ));

        boolean isOwner = viewerUserId != null && note.getUser().getId().equals(viewerUserId);
        if (!isOwner) {
            if (Boolean.TRUE.equals(note.getIsDraft())) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "시음 노트를 찾을 수 없습니다.");
            }
            if (!reviewRepository.existsByAttachedNoteId(noteId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "조회할 수 없는 시음 노트입니다.");
            }
        }

        return toResponse(note);
    }

    // 내 노트 단건 조회 (본인 전용 편집 화면 등)
    @Transactional(readOnly = true)
    public TastingNoteResponse getMyTastingNote(Long userId, Long noteId) {
        return getTastingNoteForView(userId, noteId);
    }

    private TastingNoteResponse toResponse(TastingNote note) {
        List<TastingNoteTagResponse> tagResponses = note.getNoteTags().stream()
                .map(noteTag -> TastingNoteTagResponse.from(noteTag.getTag()))
                .toList();
        return TastingNoteResponse.from(note, tagResponses);
    }

    // 타인 공개 노트 목록 조회
    @Transactional(readOnly = true)
    public Page<TastingNoteResponse> getUserPublicTastingNotes(Long targetUserId, int page, int size) {
        if (!usersRepository.existsById(targetUserId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다.");
        }
        PageRequest pageRequest = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "updatedAt")
        );
        return tastingNoteRepository.findByUserIdAndIsDraftFalseOrderByUpdatedAtDesc(targetUserId, pageRequest)
                .map(note -> {
                    List<TastingNoteTagResponse> tagResponses = note.getNoteTags().stream()
                            .map(noteTag -> TastingNoteTagResponse.from(noteTag.getTag()))
                            .toList();
                    return TastingNoteResponse.from(note, tagResponses);
                });
    }

    private void validateOwner(TastingNote note, Long userId, String message) {
        if (!note.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, message);
        }
    }
}
