/** Tiptap(RichEditor) HTML — block 태그가 있으면 HTML 렌더링 */
export function isRichEditorHtml(context: string): boolean {
  return /<(p|h[1-6]|ul|ol|blockquote|div)\b/i.test(context);
}

/** 마이그레이션 칼럼 본문 앞에 붙은 `<img>`를 마크다운 이미지 문법으로 변환 */
export function htmlImgsToMarkdown(context: string): string {
  return context.replace(
    /<img\s+[^>]*?\bsrc=["']([^"']+)["'][^>]*?(?:\balt=["']([^"']*)["'])?[^>]*\/?>/gi,
    (_, src, alt) => `![${alt ?? ''}](${src})\n\n`,
  );
}
