package com.jackpot.whiskeynote.domain.taste.note.controller;

import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import com.jackpot.whiskeynote.domain.taste.note.dto.AiNoteAnalyzeRequest;
import com.jackpot.whiskeynote.domain.taste.note.dto.AiNoteAnalyzeResponse;
import com.jackpot.whiskeynote.global.response.ApiResponse;
import com.jackpot.whiskeynote.domain.taste.note.service.AnthropicService;
import com.jackpot.whiskeynote.domain.taste.note.dto.TastingNoteCreateRequest;
import com.jackpot.whiskeynote.domain.taste.note.dto.TastingNoteResponse;
import com.jackpot.whiskeynote.domain.taste.note.dto.TastingNoteTagResponse;
import com.jackpot.whiskeynote.domain.taste.note.dto.TastingNoteUpdateRequest;
import com.jackpot.whiskeynote.domain.taste.note.entity.TastingNote;
import com.jackpot.whiskeynote.domain.taste.note.repository.TastingNoteRepository;
import com.jackpot.whiskeynote.domain.taste.note.repository.TastingNoteTagRepository;
import com.jackpot.whiskeynote.domain.taste.note.service.TastingNoteService;
import com.jackpot.whiskeynote.domain.whiskey.repository.WhiskeyRepository;
import com.jackpot.whiskeynote.global.security.JwtUserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequiredArgsConstructor
public class TastingNoteController {

    private final TastingNoteRepository tastingNoteRepository;
    private final TastingNoteTagRepository tastingNoteTagRepository;
    private final UsersRepository usersRepository;
    private final WhiskeyRepository whiskeyRepository;
    private final TastingNoteService tastingNoteService;
    private final AnthropicService anthropicService;
    // 리뷰 작성 시, 특정 위스키에 대해 내가 작성한 공개 시음 노트 조회
    @GetMapping("/api/v1/whiskeys/{whiskeyId}/notes/my")
    public ResponseEntity<TastingNoteResponse> getMyNoteForReview(
            @PathVariable Long whiskeyId,
            @AuthenticationPrincipal JwtUserPrincipal principal
    ) {
        if (!usersRepository.existsById(principal.userId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다.");
        }

        if (!whiskeyRepository.existsById(whiskeyId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "위스키를 찾을 수 없습니다.");
        }

        return tastingNoteRepository
                .findFirstByUserIdAndWhiskeyIdAndIsDraftFalseOrderByUpdatedAtDesc(principal.userId(), whiskeyId)
                .map(this::toResponse)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }
    // 첨부된 시음 노트 상세 조회
    @GetMapping("/api/v1/tasting-notes/{noteId}")
    public TastingNoteResponse getTastingNote(
            @PathVariable Long noteId,
            @AuthenticationPrincipal JwtUserPrincipal principal
    ) {
        Long userId = principal != null ? principal.userId() : null;
        return tastingNoteService.getTastingNoteForView(userId, noteId);
    }
    // AI 테이스팅 노트 분석
    @PostMapping("/api/v1/tasting-notes/analyze")
    public ApiResponse<AiNoteAnalyzeResponse> analyzeTastingNote(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @Valid @RequestBody AiNoteAnalyzeRequest request
    ) {
        return ApiResponse.ok(anthropicService.analyze(request.memo()));
    }

    // 시음 노트 생성
    @PostMapping("/api/v1/tasting-notes")
    @ResponseStatus(HttpStatus.CREATED)
    public TastingNoteResponse createTastingNote(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @Valid@RequestBody TastingNoteCreateRequest request){
        return tastingNoteService.createTastingNote(principal.userId(),request);
    }
    // 시음 노트 수정
    @PatchMapping("/api/v1/tasting-notes/{noteId}")
    public TastingNoteResponse updateTastingNote(
            @PathVariable Long noteId,
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @Valid@RequestBody TastingNoteUpdateRequest request){
        return tastingNoteService.updateTastingNote(principal.userId(), noteId, request);
    }
    private TastingNoteResponse toResponse(TastingNote note) {
        return TastingNoteResponse.from(
                note,
                tastingNoteTagRepository.findByNote_IdOrderByTag_DisplayOrderAsc(note.getId())
                        .stream()
                        .map(noteTag -> TastingNoteTagResponse.from(noteTag.getTag()))
                        .toList()
        );
    }
    // 시음 노트 삭제
    @DeleteMapping("/api/v1/tasting-notes/{noteId}")
    public void deleteTastingNote(
        @PathVariable Long noteId,
        @AuthenticationPrincipal JwtUserPrincipal principal) {
        tastingNoteService.deleteTastingNote(principal.userId(), noteId);
    }
    // 내 시음 노트 리스트 조회 (페이징)
    @GetMapping("/api/v1/tasting-notes/my")
    public Page<TastingNoteResponse> getMyTastingNotes(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return tastingNoteService.getMyTastingNotes(principal.userId(), page, size);
    }

    // 타인 공개 시음 노트 리스트 조회 (isDraft=false만, 페이징)
    @GetMapping("/api/v1/users/{userId}/tasting-notes")
    public Page<TastingNoteResponse> getUserTastingNotes(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return tastingNoteService.getUserPublicTastingNotes(userId, page, size);
    }
}
