// ============================================================
// GradCamOverlay — Explainable AI Heat-Map Visualization
// Renders Grad-CAM heatmap on top of analyzed images
// ============================================================

'use client';

import { GradCamData } from '@/stores/medical-store';
import { cn } from '@/lib/utils';
import { Eye, Brain, BarChart3 } from 'lucide-react';

interface GradCamOverlayProps {
  data: GradCamData;
  className?: string;
}

export function GradCamOverlay({ data, className }: GradCamOverlayProps) {
  // Map intensity to color (green -> yellow -> red)
  const getHeatmapColor = (intensity: number): string => {
    if (intensity > 0.8) return 'rgba(239, 68, 68, 0.6)';   // Red
    if (intensity > 0.6) return 'rgba(245, 158, 11, 0.5)';   // Amber
    if (intensity > 0.4) return 'rgba(234, 179, 8, 0.4)';    // Yellow
    return 'rgba(34, 197, 94, 0.3)';                           // Green
  };

  return (
    <div className={cn('bg-white border border-gray-200 rounded-xl overflow-hidden', className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-teal-500" />
          <span className="text-sm font-semibold text-gray-700">Explainable AI — Grad-CAM Analysis</span>
        </div>
        <span className="text-xs text-gray-400">
          Confidence: {(data.confidence * 100).toFixed(1)}%
        </span>
      </div>

      {/* Heatmap Visualization */}
      <div className="relative aspect-square max-w-sm mx-auto bg-gray-50">
        {/* Placeholder image background */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
          <div className="text-center text-gray-400">
            <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-xs">Uploaded Image Preview</p>
          </div>
        </div>

        {/* Grad-CAM Heatmap overlay */}
        <div className="absolute inset-0">
          {data.heatmapCoords.map((coord, i) => (
            <div
              key={i}
              className="absolute transition-all duration-700 ease-out"
              style={{
                left: `${coord.x}%`,
                top: `${coord.y}%`,
                width: `${coord.width}%`,
                height: `${coord.height}%`,
                backgroundColor: getHeatmapColor(coord.intensity),
                borderRadius: '2px',
              }}
            />
          ))}
        </div>
      </div>

      {/* Classification Result */}
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-start gap-2">
          <BarChart3 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-800">{data.classification}</p>
            <p className="text-xs text-gray-500 mt-1">
              This heatmap highlights regions the AI model focused on for its classification.
              Warmer colors indicate higher attention areas.
            </p>
          </div>
        </div>

        {/* Confidence Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-gray-400 mb-1">
            <span>AI Confidence</span>
            <span>{(data.confidence * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-teal-400 to-emerald-500 h-full rounded-full transition-all duration-1000"
              style={{ width: `${data.confidence * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
