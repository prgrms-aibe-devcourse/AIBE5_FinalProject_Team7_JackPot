package com.jackpot.whiskeynote.domain.collection.pick.service;

import com.jackpot.whiskeynote.domain.collection.pick.dto.PickResponse;
import com.jackpot.whiskeynote.domain.collection.pick.dto.PickStatusResponse;
import com.jackpot.whiskeynote.domain.collection.pick.entity.MyPick;
import com.jackpot.whiskeynote.domain.collection.pick.repository.PickRepository;
import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import com.jackpot.whiskeynote.domain.whiskey.entity.Whiskey;
import com.jackpot.whiskeynote.domain.whiskey.repository.WhiskeyRepository;
import com.jackpot.whiskeynote.global.exception.BannedUserException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class PickService {
    private final PickRepository pickRepository;
    private final UsersRepository usersRepository;
    private final WhiskeyRepository whiskeyRepository;

    // Pick 목록
    @Transactional(readOnly = true)
    public Page<PickResponse> findAllByUserId(Long userId, int page, int size) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));
        if (user.isBanned() || user.isDeleted()) {
            throw new BannedUserException();
        }

        PageRequest pageRequest = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        return pickRepository.findAllByUserIdOrderByCreatedAtDesc(userId, pageRequest)
                .map(PickResponse::from);
    }

    // Pick 등록
    @Transactional
    public PickResponse createPick(Long userId, Long whiskeyId) {
        // 유저 존재 확인
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        // 위스키 존재 확인
        // findById 대신 getReferenceById 사용 이유:
        // findById → Whiskey를 영속성 컨텍스트에 완전히 로드
        // → picks 저장 시 flush 발생 → Hibernate가 모든 영속 엔티티 dirty check
        // → Whiskey의 JSON 타입 필드(description, note)는 비교 불가 → 항상 dirty 판단
        // → 불필요한 UPDATE whiskeys 발생 → 동시 요청 시 같은 행 락 경합 → 데드락
        // getReferenceById → 프록시만 참조 (실제 로드 없음) → dirty check 대상 제외

//        Whiskey whiskey = whiskeyRepository.findById(whiskeyId)
//                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "위스키를 찾을 수 없습니다."));

        if (!whiskeyRepository.existsById(whiskeyId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "위스키를 찾을 수 없습니다.");
        }

        Whiskey whiskey = whiskeyRepository.getReferenceById(whiskeyId);

        // 중복 픽 방지
        if (pickRepository.existsByUserIdAndWhiskeyId(userId, whiskeyId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 픽한 위스키입니다.");
        }

        MyPick savePick = pickRepository.save(MyPick.create(user, whiskey));
        return PickResponse.from(savePick);
    }

    // Pick 삭제
    @Transactional
    public void deletePick(Long userId, Long whiskeyId) {
        MyPick pick = pickRepository.findByUserIdAndWhiskeyId(userId, whiskeyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "픽 목록에 없는 위스키입니다."));

        pickRepository.delete(pick);
    }

    // 픽 여부 조회
    @Transactional(readOnly = true)
    public PickStatusResponse getPickStatus(Long userId, Long whiskeyId) {
        boolean isPicked = pickRepository.existsByUserIdAndWhiskeyId(userId, whiskeyId);
        return PickStatusResponse.of(isPicked);
    }
}
