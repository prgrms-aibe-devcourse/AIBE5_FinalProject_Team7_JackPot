interface PostFeedStats {
  likeCount: number;
  commentCount: number;
  viewCount: number;
  createdAt: string;
}

export function formatPostFeedMeta(post: PostFeedStats): string {
  const date = post.createdAt.slice(0, 10);
  return `좋아요 ${post.likeCount} · 댓글 ${post.commentCount} · 조회 ${post.viewCount} · ${date}`;
}
