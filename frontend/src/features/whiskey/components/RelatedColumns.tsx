import { Link } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import type { RelatedColumnPost } from '../types';

interface RelatedColumnsProps {
  posts: RelatedColumnPost[];
  isLoading?: boolean;
}

export function RelatedColumns({ posts, isLoading }: RelatedColumnsProps) {
  return (
    <section className="wf-detail-columns" aria-label="관련 칼럼">
      <h2 className="wf-section-title">관련 칼럼</h2>

      {isLoading ? (
        <p className="wf-text-sm">관련 칼럼을 불러오는 중…</p>
      ) : posts.length === 0 ? (
        <p className="wf-text-sm">연결된 칼럼 글이 아직 없습니다.</p>
      ) : (
        <ul className="wf-detail-columns__list">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                to={PATHS.COMMUNITY_POST.replace(':postId', String(post.id))}
                className="wf-detail-columns__item wf-box wf-box--solid"
              >
                <span className="wf-detail-columns__title">{post.title}</span>
                {post.subtitle && (
                  <span className="wf-text-sm wf-detail-columns__subtitle">{post.subtitle}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
