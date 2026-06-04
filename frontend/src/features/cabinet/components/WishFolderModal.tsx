import { useEffect, useState } from 'react';
import { cabinetApi, type WishlistFolder } from '@/features/cabinet/api/cabinetApi';
import { toast } from '@/shared/components/ui/Toast';

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
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: 'rgba(0,0,0,0.65)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 'min(400px, 100%)',
          background: '#1e1e26',
          border: '1px solid #2e2e38',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ color: '#ececf0', fontWeight: 600, fontSize: 15 }}>위시 폴더 관리</span>
            <p style={{ color: '#8b8b96', fontSize: 12, margin: '4px 0 0' }}>
              폴더를 클릭해서 추가하거나 제거할 수 있어요
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#8b8b96', fontSize: 18, cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* 폴더 목록 */}
        {loading ? (
          <p style={{ color: '#8b8b96', fontSize: 13 }}>불러오는 중...</p>
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
                  style={{
                    background: isWished ? 'rgba(201,162,39,0.1)' : '#16161c',
                    border: `1px solid ${isWished ? '#c9a227' : '#2e2e38'}`,
                    borderRadius: 10,
                    padding: '12px 16px',
                    color: '#ececf0',
                    fontSize: 14,
                    cursor: adding ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = isWished ? '#f87171' : '#c9a227';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = isWished ? '#c9a227' : '#2e2e38';
                  }}
                >
                  <span>📁 {folder.name}</span>
                  {isWished ? (
                    <span style={{ color: '#c9a227', fontSize: 12, fontWeight: 600 }}>
                      ♥ 등록됨 (클릭 시 제거)
                    </span>
                  ) : (
                    <span style={{ color: '#8b8b96', fontSize: 12 }}>+ 추가</span>
                  )}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              style={{
                background: 'none',
                border: '1px dashed #2e2e38',
                borderRadius: 10,
                padding: '10px 16px',
                color: '#8b8b96',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              + 새 폴더 만들기
            </button>
          </>
        ) : null}

        {/* 새 폴더 생성 */}
        {showCreate && (
          <>
            {folders.length === 0 && (
              <p style={{ color: '#8b8b96', fontSize: 13, margin: 0 }}>
                폴더가 없습니다. 새 폴더를 만들어주세요.
              </p>
            )}
            <input
              type="text"
              placeholder="폴더 이름 입력"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateAndAdd()}
              autoFocus
              style={{
                background: '#16161c',
                border: '1px solid #2e2e38',
                borderRadius: 10,
                padding: '10px 14px',
                color: '#ececf0',
                fontSize: 14,
                outline: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                disabled={adding}
                onClick={handleCreateAndAdd}
                style={{
                  flex: 1,
                  background: '#c9a227',
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px',
                  color: '#0c0c0f',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                {adding ? '처리 중...' : '만들고 추가'}
              </button>
              {folders.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  style={{
                    background: 'none',
                    border: '1px solid #2e2e38',
                    borderRadius: 10,
                    padding: '10px 14px',
                    color: '#8b8b96',
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
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
          style={{
            background: 'none',
            border: '1px solid #2e2e38',
            borderRadius: 10,
            padding: '10px',
            color: '#8b8b96',
            fontSize: 14,
            cursor: 'pointer',
            marginTop: 4,
          }}
        >
          닫기
        </button>
      </div>
    </div>
  );
}
