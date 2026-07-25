import type { ReactNode } from 'react';

type Tone = 'resolved' | 'urgent' | 'open' | 'vet' | 'neutral';

const toneMap: Record<Tone, { bg: string; color: string }> = {
  resolved: { bg: 'var(--color-resolved-bg)', color: 'var(--color-resolved-text)' },
  urgent: { bg: 'var(--color-urgent-bg)', color: 'var(--color-urgent-text)' },
  open: { bg: 'var(--color-border)', color: 'var(--color-text-secondary)' },
  vet: { bg: 'var(--color-brand-light)', color: 'var(--color-brand-dark)' },
  neutral: { bg: 'var(--color-brand-light)', color: 'var(--color-brand-dark)' },
};

/** 状态徽章（已解决 / 紧急 / 待解答 / 兽医 / 通用） */
export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  const { bg, color } = toneMap[tone];
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-pill font-medium whitespace-nowrap"
      style={{ background: bg, color }}
    >
      {children}
    </span>
  );
}
