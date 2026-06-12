import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { cabinetApi, type WishlistFolder } from '@/features/cabinet/api/cabinetApi';
import { toast } from '@/shared/components/ui/Toast';
import '@/features/community/community.css';
import '@/features/cabinet/cabinet.css';

interface WishFolderModalProps {
  whiskeyId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function WishFolderModal({ whiskeyId, onClose, onSuccess }: WishFolderModalProps) {
  const [folders, setFolders] = useState<WishlistFolder[]>([]);
  const [wishedItemMap, setWishedItemMap] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [lastAction, setLastAction] = useState<'added' | 'removed' | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    Promise.all([
      cabinetApi.getWishFolders(),
      token ? cabinetApi.getWishedFolderIds(whiskeyId) : Promise.resolve({ data: { data: [] } }),
    ])
      .then(async ([folderRes, wishedRes]) => {
        const list: WishlistFolder[] = folderRes.data.data ?? [];
        setFolders(list);
        if (list.length === 0) setShowCreate(true);

        const wishedFolderIds: number[] = (wishedRes.data.data ?? []) as number[];
        if (wishedFolderIds.length > 0) {
          const itemMap: Record<number, number> = {};
          for (const folderId of wishedFolderIds) {
            const itemRes = await cabinetApi.getWishItems(folderId);
            const items = itemRes.data.data ?? [];
            const found = items.find((item: { whiskey: { id: number }; itemId: number }) =>
              item.whiskey.id === whiskeyId
            );
            if (found) itemMap[folderId] = found.itemId;
          }
          setWishedItemMap(itemMap);
        }
      })
      .catch(() => toast('폴더 목록을 불러오지 못했습니다.', 'error'))
      .finally(() => setLoading(false));
  }, [whiskeyId]);

  const handleFolderClick = async (folderId: number) => {
    const existingItemId = wishedItemMap[folderId];

    if (existingItemId !== undefined) {
      setAdding(true);
      try {
        await cabinetApi.removeWish(existingItemId, folderId);
        setWishedItemMap((prev) => {
          const next = { ...prev };
          delete next[folderId];
          return next;
        });
        toast('위시리스트에서 제거되었습니다.', 'info');
        setLastAction('removed');
        onSuccess();
      } catch {
        toast('위시 제거에 실패했습니다.', 'error');
      } finally {
        setAdding(false);
      }
    } else {
      setAdding(true);
      try {
        await cabinetApi.addWish(whiskeyId, folderId);
        const itemRes = await cabinetApi.getWishItems(folderId);
        const items = itemRes.data.data ?? [];
        const found = items.find((item: { whiskey: { id: number }; itemId: number }) =>
          item.whiskey.id === whiskeyId
        );
        if (found) {
          setWishedItemMap((prev) => ({ ...prev, [folderId]: found.itemId }));
        }
        toast('위시리스트에 추가되었습니다.', 'success');
        setLastAction('added');
        onSuccess();
      } catch {
        toast('위시 추가에 실패했습니다.', 'error');
      } finally {
        setAdding(false);
      }
    }
  };

  const handleCreateAndAdd = async () => {
    if (!newFolderName.trim()) {
      toast('폴더 이름을 입력해주세요.', 'warning');
      return;
    }
    setAdding(true);
    try {
      const res = await cabinetApi.createWishFolder(newFolderName.trim());
      const created: WishlistFolder[] = res.data.data ?? [];
      setFolders(created);
      setNewFolderName('');
      setShowCreate(false);
      const newFolder = created.find((f) => f.name === newFolderName.trim());
      if (newFolder) await handleFolderClick(newFolder.folderId);
    } catch {
      toast('폴더 생성에 실패했습니다.', 'error');
      setAdding(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="위시 폴더 관리"
      className="wf-modal-overlay wf-modal-overlay--wish"
      onClick={onClose}
    >
      <div
        className="wf-modal-panel wf-modal-panel--wish"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="wf-modal-header">
          <div>
            <p className="wf-modal-kicker">Save to cabinet</p>
            <span className="wf-modal-title">위시 폴더 관리</span>
            <p className="wf-modal-subtitle">폴더를 클릭해서 추가하거나 제거할 수 있어요</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="wf-modal-close-btn"
          >
            ✕
          </button>
        </div>

        {/* 폴더 목록 */}
        {loading ? (
          <p className="wf-modal-muted">불러오는 중...</p>
        ) : folders.length > 0 && !showCreate ? (
          <>
            {folders.map((folder) => {
              const isWished = wishedItemMap[folder.folderId] !== undefined;
              return (
                <button
                  key={folder.folderId}
                  type="button"
                  disabled={adding}
                  onClick={() => handleFolderClick(folder.folderId)}
                  className={`wf-wish-folder-opt${isWished ? ' wf-wish-folder-opt--on' : ''}`}
                >
                  <span className="wf-wish-folder-name">
                    <span className="wf-wish-folder-icon" aria-hidden="true" />
                    {folder.name}
                  </span>
                  {isWished ? (
                    <span className="wf-wish-folder-status--on">♥ 등록됨 (클릭 시 제거)</span>
                  ) : (
                    <span className="wf-wish-folder-status--off">+ 추가</span>
                  )}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="wf-wish-create-btn"
            >
              + 새 폴더 만들기
            </button>
          </>
        ) : null}

        {lastAction && (
          <div className={`wf-wish-flow-notice wf-wish-flow-notice--${lastAction}`}>
            <div>
              <strong>
                {lastAction === 'added' ? '캐비넷에 저장됐어요.' : '위시에서 제거됐어요.'}
              </strong>
              <span>
                {lastAction === 'added'
                  ? '위시 탭에서 폴더별로 다시 확인할 수 있어요.'
                  : '다시 담고 싶다면 폴더를 한 번 더 선택해주세요.'}
              </span>
            </div>
            {lastAction === 'added' && (
              <Link
                to={`${PATHS.CABINET}?section=bar&tab=wish`}
                onClick={onClose}
                className="wf-wish-flow-link"
              >
                캐비넷 보기
              </Link>
            )}
          </div>
        )}

        {/* 새 폴더 생성 */}
        {showCreate && (
          <>
            {folders.length === 0 && (
              <p className="wf-modal-muted">폴더가 없습니다. 새 폴더를 만들어주세요.</p>
            )}
            <input
              type="text"
              placeholder="폴더 이름 입력"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateAndAdd()}
              autoFocus
              className="wf-wish-modal-input"
            />
            <div className="wf-modal-footer">
              <button
                type="button"
                disabled={adding}
                onClick={handleCreateAndAdd}
                className="wf-modal-submit-btn"
              >
                {adding ? '처리 중...' : '만들고 추가'}
              </button>
              {folders.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="wf-modal-cancel-btn"
                >
                  취소
                </button>
              )}
            </div>
          </>
        )}

        {/* 닫기 버튼 */}
        <button
          type="button"
          onClick={onClose}
          className="wf-modal-cancel-btn"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
