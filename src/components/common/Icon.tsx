import { Icons } from '@/lib/icons';

type IconName = keyof typeof Icons;

/** 统一 emoji 图标组件 */
export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      {Icons[name]}
    </span>
  );
}
