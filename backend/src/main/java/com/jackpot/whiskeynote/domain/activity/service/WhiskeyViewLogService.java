package com.jackpot.whiskeynote.domain.activity.service;

import com.jackpot.whiskeynote.domain.activity.entity.WhiskeyViewLog;
import com.jackpot.whiskeynote.domain.activity.repository.WhiskeyViewLogRepository;
import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import com.jackpot.whiskeynote.domain.whiskey.entity.Whiskey;
import com.jackpot.whiskeynote.domain.whiskey.repository.WhiskeyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class WhiskeyViewLogService {

    private final WhiskeyViewLogRepository whiskeyViewLogRepository;
    private final UsersRepository usersRepository;
    private final WhiskeyRepository whiskeyRepository;

    @Transactional
    public void createWhiskeyViewLog(Long userId, Long whiskeyId) {
        Users user = usersRepository.findById(userId).orElse(null);
        Whiskey whiskey = whiskeyRepository.findById(whiskeyId).orElse(null);
        // 굳이 검증까지는 가지 않고, 문제 발견 시, DB에 넣지 않는 방향으로 접근.
        // 이는 추후 프론트에서의 활동이 에러를 일으키는 상황을 막기 위함
        if (user == null || whiskey == null) { return; }

        // 10분 내에 해당 페이지에 대한 로그를 남겼다면, 추가로 더 남기지 않음
        if (whiskeyViewLogRepository.existsRecentView(
            userId, whiskeyId, LocalDateTime.now().minusMinutes(10))
        ) return;

        WhiskeyViewLog log = WhiskeyViewLog.builder()
            .user(user)
            .whiskey(whiskey)
            .build();
        whiskeyViewLogRepository.save(log);
    }
}
