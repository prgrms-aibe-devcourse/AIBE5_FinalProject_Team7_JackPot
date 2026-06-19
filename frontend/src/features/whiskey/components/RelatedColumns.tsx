import { Link } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import type { RelatedColumnPost } from '../types';

interface RelatedColumnsProps {
  posts: RelatedColumnPost[];
  isLoading?: boolean;
}

export function RelatedColumns({ posts, isLoading }: RelatedColumnsProps) {
  return (
    <section className="wf-detail-columns wf-detail-panel" aria-label="관련 칼럼">
      <div className="wf-detail-section-head">
        <h2 className="wf-section-title">관련 칼럼</h2>
      </div>

      {isLoading ? (
        <ul className="wf-detail-columns__list" aria-label="관련 칼럼을 불러오는 중">
          {Array.from({ length: 3 }).map((_, index) => (
            <li key={index}>
              <div className="wf-detail-columns__item wf-box wf-box--solid wf-detail-columns__item--loading">
                <span />
                <span />
              </div>
            </li>
          ))}
        </ul>
      ) : posts.length === 0 ? (
        <div className="wf-detail-state">
          <p className="wf-card__title">연결된 칼럼 글이 아직 없습니다.</p>
          <p className="wf-card__meta">이 위스키를 다루는 커뮤니티 콘텐츠가 생기면 이곳에 표시됩니다.</p>
        </div>
      ) : (
        <ul className="wf-detail-columns__list">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                to={PATHS.COMMUNITY_POST.replace(':postId', String(post.id))}
                className="wf-detail-columns__item wf-box wf-box--solid"
              >
                <span className="wf-detail-columns__title">{post.title}</span>
                <span className="wf-detail-columns__stats">
                  ♥ {post.likeCount} · 댓글 {post.commentCount}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
