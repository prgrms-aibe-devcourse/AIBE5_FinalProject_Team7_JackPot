export function PageLoader({ label }: { label?: string }) {
  return (
    <div className="page-loader" aria-busy="true">
      <p>{label ? `${label} 불러오는 중…` : '불러오는 중…'}</p>
    </div>
  );
}
