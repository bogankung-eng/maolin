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
    { label: '关注', value: currentUser.stats.following },
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
      <header className="bg-surface px-4 pt-6 pb-4">
        <div className="flex items-center gap-4">
          <Avatar emoji={currentUser.avatarEmoji} size={64} />
          <div className="flex flex-col">
            <span className="text-xl font-bold text-text">{currentUser.name}</span>
            <span className="text-xs text-text-secondary mt-1">
              {currentUser.city} · 养宠 {currentUser.petYears} 年
            </span>
          </div>
        </div>

        {/* 统计 4 等分 */}
        <div className="grid grid-cols-4 mt-4 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-base font-semibold text-text">{s.value}</div>
              <div className="text-xs text-text-secondary mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </header>

      {/* 我的宠物 */}
      <section className="px-4 mt-4">
        <h2 className="text-sm font-semibold text-text mb-2">我的宠物</h2>
        <div className="flex flex-col gap-2">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
          <button
            onClick={handleAddPet}
            className="flex items-center justify-center gap-2 border border-dashed border-border rounded-pet py-4 text-text-secondary text-sm transition-bg hover:border-brand"
          >
            ＋ 添加宠物
          </button>
        </div>
      </section>

      {/* 健康记录 */}
      <section className="px-4 mt-6">
        <h2 className="text-sm font-semibold text-text mb-2">健康记录</h2>
        <HealthRecordList records={healthRecords} />
      </section>

      {/* 动态九宫格 */}
      <section className="px-4 mt-6 mb-8">
        <h2 className="text-sm font-semibold text-text mb-2">我的动态</h2>
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
                  className="aspect-square bg-bg rounded-button overflow-hidden flex items-center justify-center"
                >
                  {isUrl ? (
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  ) : img ? (
                    <span className="text-3xl">{img}</span>
                  ) : (
                    <span className="text-xs text-text-tertiary px-1 text-center line-clamp-2">
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
