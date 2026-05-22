// ============================================================
// ChatBubble — Distinct speech bubbles for User vs AI Doctor
// Features animated typing dots and markdown-style formatting
// ============================================================

'use client';

import { cn } from '@/lib/utils';
import { Bot, User as UserIcon, FileText, Image as ImageIcon, AlertTriangle, Shield } from 'lucide-react';

interface ChatBubbleProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  messageType?: 'text' | 'image' | 'document' | 'system';
  isStreaming?: boolean;
  timestamp?: Date;
}

export function ChatBubble({
  role,
  content,
  messageType = 'text',
  isStreaming = false,
  timestamp,
}: ChatBubbleProps) {
  const isUser = role === 'user';
  const isSystem = role === 'system';

  // Format content with basic markdown-like rendering
  const formatContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Bold text
      let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
      // Italic text
      formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
      // Bullet points
      if (formatted.startsWith('• ') || formatted.startsWith('- ')) {
        formatted = `<span class="flex gap-2"><span class="text-emerald-500 shrink-0">•</span><span>${formatted.slice(2)}</span></span>`;
      }
      // Numbered lists
      if (/^\d+\.\s/.test(formatted)) {
        const num = formatted.match(/^(\d+)\./)?.[1];
        formatted = `<span class="flex gap-2"><span class="text-emerald-600 font-medium shrink-0">${num}.</span><span>${formatted.replace(/^\d+\.\s/, '')}</span></span>`;
      }
      // Warning emoji (replace ⚠️ with icon reference)
      formatted = formatted.replace(/⚠️/g, '<span class="text-amber-500">⚠</span>');

      return (
        <span
          key={i}
          className={cn(
            line.trim() === '' ? 'h-2 block' : 'block',
            isUser ? 'text-white' : 'text-gray-800'
          )}
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
      );
    });
  };

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-gray-100 text-gray-500 text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <Shield className="w-3 h-3" />
          {content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex gap-3 max-w-[85%] animate-in slide-in-from-bottom-2 duration-300',
        isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1',
          isUser
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
        )}
      >
        {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Bubble */}
      <div className="flex flex-col gap-1">
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'bg-emerald-600 text-white rounded-br-md'
              : 'bg-white border border-gray-200 shadow-sm rounded-bl-md',
            isStreaming && 'ring-2 ring-emerald-200 ring-offset-1'
          )}
        >
          {/* File attachment indicator */}
          {messageType === 'document' && !isUser && (
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
              <FileText className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-emerald-600 font-medium">Medical Report Analyzed</span>
            </div>
          )}
          {messageType === 'image' && !isUser && (
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
              <ImageIcon className="w-4 h-4 text-teal-500" />
              <span className="text-xs text-teal-600 font-medium">Image Analysis Complete</span>
            </div>
          )}

          {/* Content */}
          <div className="space-y-0.5">
            {formatContent(content)}
          </div>

          {/* Streaming cursor */}
          {isStreaming && (
            <span className="inline-block w-2 h-4 bg-emerald-500 animate-pulse ml-0.5 rounded-sm" />
          )}
        </div>

        {/* Timestamp */}
        {timestamp && (
          <span className={cn(
            'text-[10px] text-gray-400 px-1',
            isUser ? 'text-right' : 'text-left'
          )}>
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Typing Indicator with Animated Dots ──────────────────────
export function TypingIndicator() {
  return (
    <div className="flex gap-3 max-w-[85%] mr-auto animate-in slide-in-from-bottom-2 duration-300">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white border border-gray-200 shadow-sm rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0ms]" />
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:150ms]" />
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
