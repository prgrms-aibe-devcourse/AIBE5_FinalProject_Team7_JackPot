package com.jackpot.whiskeynote.domain.recommendation.service;

import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FlavorProfileCacheService {

    private final UsersRepository usersRepository;
    private final RecommendationScoreService recommendationScoreService;

    @Scheduled(cron = "0 0 * * * *")
    @Async
    public void refreshAll() {
        List<Users> users = usersRepository.findAll();
        for (Users user : users) {
            try {
                recommendationScoreService.calculateScoreByUser(user.getId());
                Thread.sleep(100);
            } catch (Exception e) {
                log.warn("캐시 생신 실패 userId={}", user.getId(), e);
            }
        }
    }
}
