'use client';

import { cn } from '@/lib/utils';
import type { CalendarEvent } from './calendar-context';

type ApprovalStatus = NonNullable<CalendarEvent['approval_status']>;

const STYLES: Record<
  string,
  { label: string; short: string; className: string }
> = {
  pending: {
    label: 'Pending approval',
    short: 'Pending',
    className: 'bg-amber-100 text-amber-900 border-amber-200',
  },
  approved: {
    label: 'Approved',
    short: 'Approved',
    className: 'bg-emerald-100 text-emerald-900 border-emerald-200',
  },
  rejected: {
    label: 'Rejected',
    short: 'Rejected',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
  changes_requested: {
    label: 'Changes requested',
    short: 'Changes',
    className: 'bg-violet-100 text-violet-900 border-violet-200',
  },
  none_required: {
    label: 'Approval required',
    short: 'Approval',
    className: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  },
};

export function EventApprovalBadge({
  event,
  className,
  compact = false,
}: {
  event: Pick<CalendarEvent, 'type' | 'approval_required' | 'approval_status'>;
  className?: string;
  compact?: boolean;
}) {
  if ((event.type || '').toLowerCase() !== 'post') return null;

  const status = (event.approval_status || 'none') as ApprovalStatus;
  const required = !!event.approval_required;

  if (status === 'none' && !required) return null;

  const key =
    status !== 'none'
      ? status
      : required
        ? 'none_required'
        : 'none';

  if (key === 'none') return null;

  const cfg = STYLES[key] || STYLES.none_required;

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border font-bold tabular-nums tracking-wide',
        compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]',
        cfg.className,
        className
      )}
      title={cfg.label}
    >
      {compact ? cfg.short : cfg.label}
    </span>
  );
}
