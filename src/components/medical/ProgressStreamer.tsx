// ============================================================
// ProgressStreamer — Multi-step loader with real-time progress
// Streams backend states to the client as a visual pipeline
// ============================================================

'use client';

import { useMedicalStore } from '@/stores/medical-store';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProgressStreamer() {
  const { progressSteps, isProcessing } = useMedicalStore();

  if (!isProcessing && progressSteps.length === 0) return null;

  const maxPercentage = progressSteps.length > 0
    ? progressSteps[progressSteps.length - 1].percentage
    : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm animate-in slide-in-from-bottom-3 duration-500">
      {/* Overall progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-gray-600">Processing Your Medical Data</span>
          <span className="text-xs font-bold text-emerald-600">{maxPercentage}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${maxPercentage}%` }}
          />
        </div>
      </div>

      {/* Step list */}
      <div className="space-y-2">
        {progressSteps.map((step, index) => {
          const isLast = index === progressSteps.length - 1;
          const isCurrent = isLast && isProcessing;

          return (
            <div key={`${step.step}-${index}`} className="flex items-center gap-2.5">
              {isCurrent ? (
                <Loader2 className="w-4 h-4 text-emerald-500 animate-spin shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              )}
              <span
                className={cn(
                  'text-xs transition-colors duration-300',
                  isCurrent ? 'text-emerald-700 font-medium' : 'text-gray-500'
                )}
              >
                {step.label}
              </span>
              <span className={cn(
                'text-[10px] ml-auto font-mono',
                isCurrent ? 'text-emerald-500' : 'text-gray-400'
              )}>
                {step.percentage}%
              </span>
            </div>
          );
        })}

        {/* Pending steps indicator */}
        {isProcessing && (
          <div className="flex items-center gap-2.5 text-gray-300">
            <Circle className="w-4 h-4 shrink-0" />
            <span className="text-xs">Preparing your results...</span>
          </div>
        )}
      </div>
    </div>
  );
}
