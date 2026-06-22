import { CabinetFeedEmpty } from '@/features/cabinet/components/CabinetFeedParts';
import type { WishlistFolder } from '@/features/cabinet/api/cabinetApi';
import { resolveMediaUrl } from '@/shared/lib/mediaUrl';

export interface WishFolderSummary {
  count: number;
  thumbnails: (string | null)[];
}

interface CabinetWishFolderListProps {
  folders: WishlistFolder[];
  summaries: Record<number, WishFolderSummary>;
  selectedFolderId: number | null;
  dragOverFolderId: number | null;
  showFolderInput: boolean;
  newFolderName: string;
  onToggleFolderInput: () => void;
  onNewFolderNameChange: (value: string) => void;
  onCreateFolder: () => void;
  onSelectFolder: (folderId: number) => void;
  onDeleteFolder: (folderId: number) => void;
  onDragStart: (folderId: number) => void;
  onDragOver: (event: React.DragEvent, folderId: number) => void;
  onDrop: (folderId: number) => void;
  onDragLeave: () => void;
}

function PlaylistThumb({ thumbnails, count }: { thumbnails: (string | null)[]; count: number }) {
  const cover = resolveMediaUrl(thumbnails[0] ?? null);

  return (
    <div className="wf-yt-playlist__media">
      <span className="wf-yt-playlist__stack wf-yt-playlist__stack--1" aria-hidden />
      <span className="wf-yt-playlist__stack wf-yt-playlist__stack--2" aria-hidden />
      <div className="wf-yt-playlist__thumb">
        {cover ? (
          <img src={cover} alt="" className="wf-yt-playlist__img" />
        ) : (
          <div className="wf-yt-playlist__img wf-yt-playlist__img--empty" aria-hidden />
        )}
        <span className="wf-yt-playlist__badge" aria-hidden>
          <svg viewBox="0 0 24 24" className="wf-yt-playlist__badge-icon">
            <path
              d="M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h10v2H4v-2Z"
              fill="currentColor"
            />
          </svg>
          {count}
        </span>
      </div>
    </div>
  );
}

export function CabinetWishFolderList({
  folders,
  summaries,
  selectedFolderId,
  dragOverFolderId,
  showFolderInput,
  newFolderName,
  onToggleFolderInput,
  onNewFolderNameChange,
  onCreateFolder,
  onSelectFolder,
  onDeleteFolder,
  onDragStart,
  onDragOver,
  onDrop,
  onDragLeave,
}: CabinetWishFolderListProps) {
  return (
    <aside className="wf-cabinet-wish-sidebar">
      <div className="wf-yt-playlist-panel">
        <div className="wf-yt-playlist-panel__header">
          <h3 className="wf-yt-playlist-panel__title">위시리스트</h3>
          <button type="button" className="wf-yt-playlist-panel__add" onClick={onToggleFolderInput}>
            {showFolderInput ? '취소' : '새로 만들기'}
          </button>
        </div>

        {showFolderInput ? (
          <div className="wf-yt-playlist-panel__create">
            <input
              type="text"
              placeholder="위시리스트 이름"
              value={newFolderName}
              onChange={(event) => onNewFolderNameChange(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && onCreateFolder()}
              autoFocus
              className="wf-yt-playlist-panel__input"
            />
            <button type="button" onClick={onCreateFolder} className="wf-yt-playlist-panel__create-btn">
              만들기
            </button>
          </div>
        ) : null}

        {folders.length === 0 ? (
          <CabinetFeedEmpty
            title="위시리스트가 없습니다."
            meta="위스키를 취향별로 모아볼 위시리스트를 만들어 보세요."
          />
        ) : (
          <ul className="wf-yt-playlist-list">
            {folders.map((folder) => {
              const summary = summaries[folder.folderId] ?? { count: 0, thumbnails: [] };
              const isActive = selectedFolderId === folder.folderId;
              const isDragOver = dragOverFolderId === folder.folderId;

              return (
                <li key={folder.folderId}>
                  <div
                    draggable
                    onDragStart={() => onDragStart(folder.folderId)}
                    onDragOver={(event) => onDragOver(event, folder.folderId)}
                    onDrop={() => onDrop(folder.folderId)}
                    onDragLeave={onDragLeave}
                    className={`wf-yt-playlist${isActive ? ' wf-yt-playlist--active' : ''}${isDragOver ? ' wf-yt-playlist--drag-over' : ''}`}
                  >
                    <button
                      type="button"
                      className="wf-yt-playlist__main"
                      onClick={() => onSelectFolder(folder.folderId)}
                    >
                      <PlaylistThumb thumbnails={summary.thumbnails} count={summary.count} />
                      <span className="wf-yt-playlist__body">
                        <strong className="wf-yt-playlist__name">{folder.name}</strong>
                        <span className="wf-yt-playlist__meta">
                          {summary.count > 0 ? `위스키 ${summary.count}개` : '비어 있음'}
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      className="wf-yt-playlist__menu"
                      aria-label={`${folder.name} 삭제`}
                      onClick={() => onDeleteFolder(folder.folderId)}
                    >
                      ⋮
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
