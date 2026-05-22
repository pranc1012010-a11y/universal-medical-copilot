// ============================================================
// MedicalGauge — Interactive Horizontal Slider Gauge
// Shows patient's value against healthy reference ranges
// Red = Low/High, Green = Normal, with animated indicator
// ============================================================

'use client';

import { cn } from '@/lib/utils';
import { TrendingDown, TrendingUp, CheckCircle2, AlertTriangle } from 'lucide-react';

interface MedicalGaugeProps {
  name: string;
  value: number;
  unit: string;
  refLow: number;
  refHigh: number;
  status: 'low' | 'normal' | 'high' | 'critical';
}

export function MedicalGauge({ name, value, unit, refLow, refHigh, status }: MedicalGaugeProps) {
  // Calculate the range for the gauge
  const range = refHigh - refLow;
  const extendedLow = refLow - range * 0.5;
  const extendedHigh = refHigh + range * 0.5;
  const totalRange = extendedHigh - extendedLow;

  // Position calculations (as percentages)
  const normalStart = ((refLow - extendedLow) / totalRange) * 100;
  const normalWidth = ((refHigh - refLow) / totalRange) * 100;
  const valuePosition = Math.max(0, Math.min(100, ((value - extendedLow) / totalRange) * 100));

  const statusColors = {
    low: { bg: 'bg-amber-500', text: 'text-amber-600', label: 'Below Normal' },
    normal: { bg: 'bg-emerald-500', text: 'text-emerald-600', label: 'Normal' },
    high: { bg: 'bg-orange-500', text: 'text-orange-600', label: 'Above Normal' },
    critical: { bg: 'bg-red-500', text: 'text-red-600', label: 'Critical' },
  };

  const statusStyle = statusColors[status];

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-sm font-semibold text-gray-800">{name}</h4>
          <p className="text-xs text-gray-400 mt-0.5">
            Reference: {refLow} – {refHigh} {unit}
          </p>
        </div>
        <div className={cn(
          'flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold',
          status === 'normal' ? 'bg-emerald-50 text-emerald-600' :
          status === 'critical' ? 'bg-red-50 text-red-600' :
          'bg-amber-50 text-amber-600'
        )}>
          {status === 'normal' ? (
            <CheckCircle2 className="w-3 h-3" />
          ) : (
            <AlertTriangle className="w-3 h-3" />
          )}
          {statusStyle.label}
        </div>
      </div>

      {/* Value Display */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className={cn('text-2xl font-bold', statusStyle.text)}>
          {value}
        </span>
        <span className="text-xs text-gray-400">{unit}</span>
        {(status === 'low' || status === 'critical') && value < refLow && (
          <TrendingDown className="w-4 h-4 text-amber-500 ml-1" />
        )}
        {(status === 'high' || status === 'critical') && value > refHigh && (
          <TrendingUp className="w-4 h-4 text-orange-500 ml-1" />
        )}
      </div>

      {/* Gauge Bar */}
      <div className="relative h-3 rounded-full overflow-hidden bg-gray-100">
        {/* Low zone (left of normal) */}
        <div
          className="absolute top-0 left-0 h-full bg-amber-100"
          style={{ width: `${normalStart}%` }}
        />
        {/* Normal zone */}
        <div
          className="absolute top-0 h-full bg-emerald-200"
          style={{ left: `${normalStart}%`, width: `${normalWidth}%` }}
        />
        {/* High zone (right of normal) */}
        <div
          className="absolute top-0 right-0 h-full bg-amber-100"
          style={{ width: `${100 - normalStart - normalWidth}%` }}
        />

        {/* Value indicator pin */}
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all duration-1000 ease-out z-10',
            statusStyle.bg
          )}
          style={{ left: `calc(${valuePosition}% - 8px)` }}
        >
          {/* Pin inner dot */}
          <div className="w-full h-full rounded-full bg-white/30" />
        </div>
      </div>

      {/* Scale labels */}
      <div className="flex justify-between mt-1.5 text-[9px] text-gray-400">
        <span>{extendedLow.toFixed(0)}</span>
        <span className="text-emerald-500 font-medium">{refLow}</span>
        <span className="text-emerald-500 font-medium">{refHigh}</span>
        <span>{extendedHigh.toFixed(0)}</span>
      </div>
    </div>
  );
}
