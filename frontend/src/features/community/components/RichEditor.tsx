import { useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { uploadImage } from '@/shared/api/mediaApi';

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

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
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  async function handleImageFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('이미지는 5MB 이하만 업로드 가능합니다.');
      return;
    }
    try {
      const { mediaUrl } = await uploadImage(file, 'POST');
      editor.chain().focus().setImage({ src: mediaUrl }).run();
    } catch {
      alert('이미지 업로드에 실패했습니다.');
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
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
        <button type="button" style={TOOLBAR_BTN} onClick={() => fileInputRef.current?.click()}>
          🖼 이미지
        </button>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
          style={{ display: 'none' }} onChange={handleFileChange} />
      </div>

      {/* 에디터 본문 */}
      <EditorContent
        editor={editor}
        style={{ minHeight: 300, padding: '12px 16px', fontSize: 15, lineHeight: 1.8 }}
      />

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
