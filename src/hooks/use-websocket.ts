// ============================================================
// WebSocket Hook — Real-time communication for Medical Co-Pilot
// Connects to the medical-ws mini service via socket.io
// ============================================================

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useMedicalStore } from '@/stores/medical-store';

export function useMedicalWebSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const {
    currentSessionId,
    setIsTyping,
    appendStreamingText,
    clearStreamingText,
    addMessage,
    addProgressStep,
    clearProgressSteps,
    setIsProcessing,
  } = useMedicalStore();

  useEffect(() => {
    // Connect to WebSocket service via Caddy gateway
    const socket = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[WS] Connected to Medical WebSocket service');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('[WS] Disconnected from Medical WebSocket service');
      setIsConnected(false);
    });

    // ── Progress Step Handler ──────────────────────────────
    socket.on('progress', (data: { step: number; label: string; percentage: number }) => {
      addProgressStep(data);
    });

    // ── Chat Token Streaming Handler ───────────────────────
    socket.on('chat-token', (data: { token: string; isLast: boolean; index: number; total: number }) => {
      if (data.index === 0) {
        clearStreamingText();
        setIsTyping(true);
      }
      appendStreamingText(data.token);

      if (data.isLast) {
        setIsTyping(false);
        // Add the complete message to chat
        const fullText = useMedicalStore.getState().streamingText;
        addMessage({
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: fullText,
          messageType: 'text',
          timestamp: new Date(),
        });
        clearStreamingText();
      }
    });

    // ── Consultation Complete Handler ──────────────────────
    socket.on('consultation-complete', (data: { sessionId: string; timestamp: string }) => {
      setIsProcessing(false);
      console.log('[WS] Consultation complete:', data);
    });

    // ── User Typing Handler ───────────────────────────────
    socket.on('user-typing', (data: { userId: string; isTyping: boolean }) => {
      setIsTyping(data.isTyping);
    });

    return () => {
      socket.disconnect();
    };
  }, [addProgressStep, clearProgressSteps, appendStreamingText, clearStreamingText, addMessage, setIsTyping, setIsProcessing]);

  // ── Join Session ────────────────────────────────────────
  const joinSession = useCallback((sessionId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join-session', { sessionId });
    }
  }, []);

  // ── Start Consultation ──────────────────────────────────
  const startConsultation = useCallback((data: {
    sessionId: string;
    type: 'text' | 'image' | 'pdf';
    message?: string;
  }) => {
    if (socketRef.current?.connected) {
      clearProgressSteps();
      setIsProcessing(true);
      socketRef.current.emit('start-consultation', data);
    }
  }, [clearProgressSteps, setIsProcessing]);

  // ── Send Typing Indicator ───────────────────────────────
  const sendTyping = useCallback((isTyping: boolean) => {
    if (socketRef.current?.connected && currentSessionId) {
      socketRef.current.emit('typing', { sessionId: currentSessionId, isTyping });
    }
  }, [currentSessionId]);

  // ── Authenticate ────────────────────────────────────────
  const authenticate = useCallback((userId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('auth', { userId });
    }
  }, []);

  return {
    joinSession,
    startConsultation,
    sendTyping,
    authenticate,
    isConnected,
  };
}
