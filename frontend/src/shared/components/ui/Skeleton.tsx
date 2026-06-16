import './Skeleton.css';

interface SkeletonProps {
  /** CSS width 값 (예: '100%', 120, '6rem') */
  width?: string | number;
  /** CSS height 값 */
  height?: string | number;
  /** border-radius 값 */
  radius?: string | number;
  /** 원형(아바타 등)으로 표시 */
  circle?: boolean;
  className?: string;
}

/**
 * 로딩 중 자리표시용 스켈레톤 블록.
 * 검색 결과 스켈레톤과 동일한 shimmer 톤을 재사용한다.
 */
export function Skeleton({ width, height, radius, circle = false, className }: SkeletonProps) {
  return (
    <span
      className={`wf-skeleton${circle ? ' wf-skeleton--circle' : ''}${className ? ` ${className}` : ''}`}
      style={{
        width,
        height,
        ...(radius != null ? { borderRadius: radius } : null),
      }}
      aria-hidden
    />
  );
}
