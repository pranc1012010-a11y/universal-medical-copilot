// ============================================================
// UrgencyBadge — Visual urgency indicator for medical reports
// Color-coded safety badges with recommended actions
// ============================================================

'use client';

import { cn } from '@/lib/utils';
import { ShieldCheck, AlertTriangle, AlertOctagon, Siren } from 'lucide-react';

interface UrgencyBadgeProps {
  level: 'normal' | 'elevated' | 'urgent' | 'critical';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const URGENCY_CONFIG = {
  normal: {
    label: 'Normal',
    icon: ShieldCheck,
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    iconColor: 'text-emerald-500',
    glow: '',
  },
  elevated: {
    label: 'Elevated',
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    iconColor: 'text-amber-500',
    glow: '',
  },
  urgent: {
    label: 'Urgent',
    icon: AlertOctagon,
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    iconColor: 'text-orange-500',
    glow: 'shadow-orange-200/50 shadow-md',
  },
  critical: {
    label: 'Critical',
    icon: Siren,
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    iconColor: 'text-red-500',
    glow: 'shadow-red-200/50 shadow-lg animate-pulse',
  },
};

export function UrgencyBadge({ level, size = 'md', showLabel = true }: UrgencyBadgeProps) {
  const config = URGENCY_CONFIG[level];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-3 py-1 text-xs gap-1.5',
    lg: 'px-4 py-1.5 text-sm gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border font-semibold transition-all',
        config.bg, config.text, config.border, config.glow,
        sizeClasses[size]
      )}
    >
      <Icon className={cn(iconSizes[size], config.iconColor)} />
      {showLabel && <span>{config.label}</span>}
    </div>
  );
}
