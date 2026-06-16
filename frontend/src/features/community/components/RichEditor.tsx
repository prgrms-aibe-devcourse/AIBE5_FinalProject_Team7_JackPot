// WYSIWYG 리치 에디터 컴포넌트 — Tiptap 기반으로 칼럼 작성 시 HTML 본문을 생성
import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { uploadImage } from '@/shared/api/mediaApi';
import { toast } from '@/shared/components/ui/Toast';

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

// 활성/비활성 상태를 토글하는 툴바 버튼 스타일을 상수로 분리해 JSX를 간결하게 유지
const TOOLBAR_BTN: React.CSSProperties = {
  padding: '4px 8px',
  fontSize: 13,
  border: '1px solid #ddd',
  borderRadius: 3,
  background: '#fff',
  cursor: 'pointer',
};

const TOOLBAR_BTN_ON: React.CSSProperties = {
  ...TOOLBAR_BTN,
  background: '#222',
  color: '#fff',
  borderColor: '#222',
};

export function RichEditor({ value, onChange, placeholder = '내용을 입력하세요' }: RichEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      // allowBase64: false — base64 이미지를 본문에 직접 embed하면 DB 크기가 폭증하므로 반드시 URL 방식만 허용
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    // 에디터 내용이 바뀔 때마다 HTML을 상위 상태로 올려 제출 시 최신 HTML이 사용되도록 함
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // 편집 페이지에서 value prop이 비동기로 채워지면(usePost 로딩 완료 후) 에디터에 반영
  // synced 플래그로 한 번만 동기화하여 사용자 입력을 덮어쓰지 않음
  const synced = useRef(false);
  useEffect(() => {
    if (!editor) return;
    if (!synced.current && value && editor.isEmpty) {
      editor.commands.setContent(value, { emitUpdate: false });
      synced.current = true;
    }
  }, [editor, value]);

  // 에디터가 아직 초기화되지 않은 SSR/hydration 구간에서는 null 반환
  if (!editor) return null;

  async function handleImageFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    // 클라이언트 측 크기 제한으로 불필요한 업로드 요청 차단
    if (file.size > 5 * 1024 * 1024) {
      toast('이미지는 5MB 이하만 업로드 가능합니다.', 'warning');
      return;
    }
    try {
      const { mediaUrl } = await uploadImage(file, 'POST');
      // 업로드 후 에디터 커서 위치에 이미지 노드를 삽입
      editor.chain().focus().setImage({ src: mediaUrl }).run();
    } catch {
      toast('이미지 업로드에 실패했습니다.', 'error');
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
    // 동일 파일을 다시 선택할 수 있도록 input value 초기화
    e.target.value = '';
  }

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: 4, overflow: 'hidden' }}>
      {/* 툴바 */}
      <div style={{ display: 'flex', gap: 4, padding: '6px 8px', borderBottom: '1px solid #ddd', flexWrap: 'wrap', background: '#fafafa' }}>
        <button type="button" style={editor.isActive('bold') ? TOOLBAR_BTN_ON : TOOLBAR_BTN}
          onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
        <button type="button" style={{ ...TOOLBAR_BTN, fontStyle: 'italic', ...(editor.isActive('italic') ? { background: '#222', color: '#fff', borderColor: '#222' } : {}) }}
          onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
        <button type="button" style={editor.isActive('heading', { level: 2 }) ? TOOLBAR_BTN_ON : TOOLBAR_BTN}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
        <button type="button" style={editor.isActive('heading', { level: 3 }) ? TOOLBAR_BTN_ON : TOOLBAR_BTN}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
        <button type="button" style={editor.isActive('bulletList') ? TOOLBAR_BTN_ON : TOOLBAR_BTN}
          onClick={() => editor.chain().focus().toggleBulletList().run()}>• 목록</button>
        <button type="button" style={editor.isActive('blockquote') ? TOOLBAR_BTN_ON : TOOLBAR_BTN}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}>인용</button>
        <div style={{ width: 1, background: '#ddd', margin: '0 4px' }} />
        {/* 이미지 버튼은 숨겨진 input[file]을 프로그래밍적으로 트리거 */}
        <button type="button" style={TOOLBAR_BTN} onClick={() => fileInputRef.current?.click()}>
          🖼 이미지
        </button>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
          style={{ display: 'none' }} onChange={handleFileChange} />
      </div>

      {/* 에디터 본문 영역 */}
      <EditorContent
        editor={editor}
        style={{ minHeight: 300, padding: '12px 16px', fontSize: 15, lineHeight: 1.8 }}
      />

      {/* Tiptap이 생성하는 .tiptap 클래스에 대한 커스텀 스타일
          컴포넌트 스코프에서 주입해 전역 CSS 오염을 방지 */}
      <style>{`
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #aaa;
          pointer-events: none;
          height: 0;
        }
        .tiptap img { max-width: 100%; border-radius: 4px; margin: 8px 0; }
        .tiptap h2 { font-size: 1.4em; font-weight: bold; margin: 16px 0 8px; }
        .tiptap h3 { font-size: 1.2em; font-weight: bold; margin: 12px 0 6px; }
        .tiptap blockquote { border-left: 3px solid #ddd; padding-left: 12px; color: #666; margin: 8px 0; }
        .tiptap ul { padding-left: 20px; }
        .tiptap p { margin: 6px 0; }
      `}</style>
    </div>
  );
}
