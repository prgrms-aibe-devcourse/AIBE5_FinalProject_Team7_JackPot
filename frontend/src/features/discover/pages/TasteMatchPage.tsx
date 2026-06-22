import { useQuery } from '@tanstack/react-query';
import { PATHS } from '@/app/router/paths';
import { tasteMatchApi } from '@/features/discover/api/tasteMatchApi';
import { resolveMediaUrl } from '@/shared/lib/mediaUrl';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { Button } from '@/shared/components/ui/Button';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import '../../recommendation/recommendation.css';

export default function TasteMatchPage() {
  const {
    data: matches = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['taste-match', 'list'],
    queryFn: tasteMatchApi.getList,
    retry: false,
  });

  return (
    <WireframePage scroll>
      <p className="wf-breadcrumb">홈 / <strong>Taste Match</strong></p>
      <h1 className="wf-title">취향 비슷한 유저</h1>

      {isLoading ? (
        Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="wf-box wf-panel wf-taste-match-card" aria-hidden>
            <Skeleton width="50%" height={16} />
          </div>
        ))
      ) : isError ? (
        <div className="wf-box wf-panel">
          <p className="wf-text-sm">취향 설문을 먼저 완료하면 매칭 결과를 볼 수 있어요.</p>
          <Button to={PATHS.SURVEY} variant="ghost">설문하러 가기</Button>
        </div>
      ) : matches.length === 0 ? (
        <div className="wf-box wf-panel">
          <p className="wf-text-sm">아직 비슷한 취향의 유저를 찾지 못했어요.</p>
        </div>
      ) : (
        matches.map((user) => {
          const avatar = resolveMediaUrl(user.profileImageUrl);
          const profilePath = PATHS.USER_PROFILE.replace(':userId', String(user.userId));

          return (
            <div key={user.userId} className="wf-box wf-panel wf-taste-match-card">
              <div className="wf-taste-match-card__info">
                {avatar ? (
                  <img src={avatar} alt={user.nickname} className="wf-taste-match-card__avatar" />
                ) : (
                  <span className="wf-taste-match-card__avatar wf-taste-match-card__avatar--initial" aria-hidden>
                    {user.nickname.charAt(0)}
                  </span>
                )}
                <div>
                  <strong>{user.nickname}</strong>
                  <p className="wf-text-sm">매칭 {(user.similarity * 100).toFixed(2)}%</p>
                </div>
              </div>
              <Button to={profilePath} variant="ghost" className="wf-taste-match-profile-btn">
                프로필
              </Button>
            </div>
          );
        })
      )}
    </WireframePage>
  );
}
