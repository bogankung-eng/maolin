import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Avatar } from '@/components/common/Avatar';
import { PetCard } from '@/components/profile/PetCard';
import { HealthRecordList } from '@/components/profile/HealthRecordList';

/** 我的：个人信息 / 统计 / 宠物 / 健康 / 动态九宫格 */
export function ProfilePage() {
  const navigate = useNavigate();
  const currentUser = useAppStore((s) => s.currentUser);
  const pets = useAppStore((s) => s.pets);
  const healthRecords = useAppStore((s) => s.healthRecords);
  const posts = useAppStore((s) => s.posts);
  const addPet = useAppStore((s) => s.addPet);
  const showToast = useAppStore((s) => s.showToast);

  const myPosts = posts.filter((p) => p.authorId === currentUser.id);

  const stats = [
    { label: '动态', value: currentUser.stats.posts },
    { label: '粉丝', value: currentUser.stats.fans },
    // V2：关注统计改为派生 followingIds.length（种子=2），不再硬编码 stats.following
    { label: '关注', value: (currentUser.followingIds ?? []).length },
    { label: '回答', value: currentUser.stats.answers },
  ];

  const handleAddPet = () => {
    const name = window.prompt('宠物昵称');
    if (!name) return;
    const species = window.prompt('品种（如 柯基）') || '未知';
    addPet({ name, species, emoji: '🐾', breedTag: species, healthReminder: '' });
    showToast('已添加宠物');
  };

  return (
    <div className="min-h-full">
      {/* 头部 */}
      <header className="bg-surface px-4 pb-4 pt-6">
        <div className="flex items-center gap-4">
          <Avatar emoji={currentUser.avatarEmoji} size={64} />
          <div className="flex flex-col">
            <span className="text-xl font-bold text-text">{currentUser.name}</span>
            <span className="mt-1 text-xs text-text-secondary">
              {currentUser.city} · 养宠 {currentUser.petYears} 年
            </span>
          </div>
        </div>

        {/* 统计 4 等分 */}
        <div className="mt-4 grid grid-cols-4 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-base font-semibold text-text">{s.value}</div>
              <div className="mt-0.5 text-xs text-text-secondary">{s.label}</div>
            </div>
          ))}
        </div>
      </header>

      {/* 我的宠物 */}
      <section className="mt-4 px-4">
        <h2 className="mb-2 text-sm font-semibold text-text">我的宠物</h2>
        <div className="flex flex-col gap-2">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} onClick={() => navigate(`/pet/${pet.id}`)} />
          ))}
          <button
            onClick={handleAddPet}
            className="transition-bg flex items-center justify-center gap-2 rounded-pet border border-dashed border-border py-4 text-sm text-text-secondary hover:border-brand"
          >
            ＋ 添加宠物
          </button>
        </div>
      </section>

      {/* 健康记录 */}
      <section className="mt-6 px-4">
        <h2 className="mb-2 text-sm font-semibold text-text">健康记录</h2>
        <HealthRecordList records={healthRecords} />
      </section>

      {/* 动态九宫格 */}
      <section className="mb-8 mt-6 px-4">
        <h2 className="mb-2 text-sm font-semibold text-text">我的动态</h2>
        {myPosts.length === 0 ? (
          <div className="text-sm text-text-tertiary">还没有动态，去发布一条吧～</div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {myPosts.slice(0, 9).map((p) => {
              const img = p.images[0];
              const isUrl = !!img && img.startsWith('http');
              return (
                <button
                  key={p.id}
                  onClick={() => navigate(`/post/${p.id}`)}
                  className="flex aspect-square items-center justify-center overflow-hidden rounded-button bg-bg"
                >
                  {isUrl ? (
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  ) : img ? (
                    <span className="text-3xl">{img}</span>
                  ) : (
                    <span className="line-clamp-2 px-1 text-center text-xs text-text-tertiary">
                      {p.content.slice(0, 12)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
