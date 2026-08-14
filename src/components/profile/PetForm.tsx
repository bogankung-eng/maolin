import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { BottomSheet } from '@/components/common/BottomSheet';
import { Button } from '@/components/common/Button';

/**
 * 添加宠物表单弹层（工程 E4）：替换 window.prompt。
 * 昵称必填、品种选填；提交 → addPet + toast「已添加宠物」。
 */
export function PetForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addPet = useAppStore((s) => s.addPet);
  const showToast = useAppStore((s) => s.showToast);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');

  const reset = () => {
    setName('');
    setSpecies('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    const n = name.trim();
    if (!n) {
      showToast('请输入宠物昵称');
      return;
    }
    const sp = species.trim() || '未知';
    addPet({ name: n, species: sp, emoji: '🐾', breedTag: sp, healthReminder: '' });
    showToast('已添加宠物');
    reset();
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={handleClose} title="添加宠物">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={20}
        placeholder="宠物昵称（必填）"
        className="transition-bg w-full rounded-button border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-brand"
      />
      <input
        value={species}
        onChange={(e) => setSpecies(e.target.value)}
        maxLength={20}
        placeholder="品种（选填，如 柯基）"
        className="transition-bg mt-3 w-full rounded-button border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-brand"
      />
      <div className="mt-6 flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={handleClose}>
          取消
        </Button>
        <Button className="flex-1" onClick={handleSubmit}>
          添加
        </Button>
      </div>
    </BottomSheet>
  );
}
