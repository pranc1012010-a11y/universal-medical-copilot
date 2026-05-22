// ============================================================
// MedicalGlossaryTooltip — Interactive Hover Glossary
// Underlines complex jargon; hover triggers plain-language tooltip
// ============================================================

'use client';

import { useState, useCallback } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { findGlossaryTermsInText, GlossaryEntry } from '@/lib/medical-glossary';
import { BookOpen, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MedicalGlossaryTooltipProps {
  text: string;
  className?: string;
}

interface TextSegment {
  type: 'text' | 'glossary';
  content: string;
  entry?: GlossaryEntry;
}

export function MedicalGlossaryTooltip({ text, className }: MedicalGlossaryTooltipProps) {
  const [hoveredTerm, setHoveredTerm] = useState<string | null>(null);

  // Find all glossary terms in the text and split into segments
  const segments = useCallback((): TextSegment[] => {
    const terms = findGlossaryTermsInText(text);
    if (terms.length === 0) return [{ type: 'text', content: text }];

    const result: TextSegment[] = [];
    let lastIndex = 0;

    // Deduplicate overlapping terms (keep the first occurrence)
    const seenPositions = new Set<number>();

    for (const { term, entry, index } of terms) {
      if (seenPositions.has(index)) continue;

      // Add text before this term
      if (index > lastIndex) {
        result.push({ type: 'text', content: text.slice(lastIndex, index) });
      }

      // Add the glossary term
      result.push({ type: 'glossary', content: text.slice(index, index + term.length), entry });
      seenPositions.add(index);

      // Mark all positions this term occupies as seen
      for (let i = index; i < index + term.length; i++) {
        seenPositions.add(i);
      }

      lastIndex = index + term.length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      result.push({ type: 'text', content: text.slice(lastIndex) });
    }

    return result;
  }, [text]);

  const getSeverityIcon = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      default:
        return <Info className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn('text-sm leading-relaxed', className)}>
        {segments().map((segment, i) => {
          if (segment.type === 'text') {
            return <span key={i}>{segment.content}</span>;
          }

          // Glossary term — interactive tooltip
          return (
            <Tooltip key={i} open={hoveredTerm === `${i}`} onOpenChange={(open) => {
              setHoveredTerm(open ? `${i}` : null);
            }}>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    'underline decoration-wavy decoration-2 cursor-help transition-colors duration-200',
                    segment.entry?.severity === 'critical'
                      ? 'decoration-red-400 text-red-700 hover:text-red-800 hover:bg-red-50'
                      : segment.entry?.severity === 'warning'
                      ? 'decoration-amber-400 text-amber-700 hover:text-amber-800 hover:bg-amber-50'
                      : 'decoration-emerald-400 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50',
                    'rounded-sm px-0.5'
                  )}
                >
                  {segment.content}
                </span>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-xs p-3 shadow-xl border-0"
                sideOffset={8}
              >
                {segment.entry && (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      {getSeverityIcon(segment.entry.severity)}
                      <div>
                        <p className="font-semibold text-xs text-gray-800 mb-1">
                          {segment.entry.term}
                        </p>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {segment.entry.plainLanguage}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 pt-1 border-t border-gray-100">
                      <BookOpen className="w-2.5 h-2.5" />
                      <span className="capitalize">{segment.entry.category}</span>
                      {segment.entry.severity && (
                        <span className={cn(
                          'ml-1 px-1.5 py-0.5 rounded font-bold',
                          segment.entry.severity === 'critical' ? 'bg-red-100 text-red-600' :
                          'bg-amber-100 text-amber-600'
                        )}>
                          {segment.entry.severity}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
