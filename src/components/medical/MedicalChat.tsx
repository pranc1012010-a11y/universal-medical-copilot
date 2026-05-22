// ============================================================
// MedicalChat — Interactive Chat Container with AI Doctor
// Features: speech bubbles, inline image upload, camera trigger,
// typing indicators, and real-time progress streaming
// ============================================================

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ChatBubble, TypingIndicator } from './ChatBubble';
import { ProgressStreamer } from './ProgressStreamer';
import { useMedicalStore } from '@/stores/medical-store';
import { useMedicalWebSocket } from '@/hooks/use-websocket';
import {
  Send, Paperclip, Camera, X, FileText, Image as ImageIcon,
  Loader2, Bot, Stethoscope, Heart, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function MedicalChat() {
  const {
    user, chatMessages, currentSessionId, isTyping,
    streamingText, isProcessing, progressSteps,
    addMessage, setCurrentSessionId, setIsTyping,
    setCurrentReport,
  } = useMedicalStore();

  const { startConsultation, joinSession, authenticate } = useMedicalWebSocket();

  const [inputMessage, setInputMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'pdf' | 'image' | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, streamingText, isTyping]);

  // Authenticate WebSocket on mount
  useEffect(() => {
    if (user) {
      authenticate(user.id);
    }
  }, [user, authenticate]);

  // ── Send Message ───────────────────────────────────────
  const handleSend = useCallback(async () => {
    if ((!inputMessage.trim() && !selectedFile) || isProcessing) return;

    const sessionId = currentSessionId || `session-${Date.now()}`;
    if (!currentSessionId) {
      setCurrentSessionId(sessionId);
    }
    joinSession(sessionId);

    // Add user message immediately
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content: inputMessage || (selectedFile ? `Uploaded: ${selectedFile.name}` : ''),
      messageType: (selectedFile ? (fileType === 'pdf' ? 'document' : 'image') : 'text') as 'text' | 'document' | 'image',
      attachments: selectedFile ? [{ type: fileType || 'unknown', name: selectedFile.name, size: selectedFile.size }] : [],
      timestamp: new Date(),
    };
    addMessage(userMessage);

    const messageText = inputMessage;
    setInputMessage('');
    setSelectedFile(null);
    setFilePreview(null);
    setFileType(null);

    // If file attached, use the consult API for multimodal processing
    if (selectedFile) {
      try {
        const formData = new FormData();
        if (messageText) formData.append('message', messageText);
        formData.append('file', selectedFile);
        formData.append('fileType', fileType || 'image');
        if (currentSessionId) formData.append('sessionId', currentSessionId);

        const res = await fetch('/api/consult', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${useMedicalStore.getState().accessToken}`,
          },
          body: formData,
        });

        const data = await res.json();

        if (res.ok) {
          if (data.sessionId && !currentSessionId) {
            setCurrentSessionId(data.sessionId);
          }

          // Add AI response
          addMessage({
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: data.aiResponse,
            messageType: 'text',
            timestamp: new Date(),
          });

          // Set medical report if available
          if (data.medicalReport) {
            setCurrentReport({
              ...data.medicalReport,
              labMarkers: data.labMarkers || [],
              gradCamData: data.gradCamData || null,
              createdAt: new Date().toISOString(),
              reportType: data.gradCamData ? 'radiology' : 'lab',
            } as any);
          }
        }
      } catch (error) {
        console.error('Consult API error:', error);
        addMessage({
          id: `error-${Date.now()}`,
          role: 'system',
          content: 'Connection error. Your data is safe — please try again.',
          messageType: 'system',
          timestamp: new Date(),
        });
      }

      // Also trigger WebSocket for progress streaming
      startConsultation({
        sessionId,
        type: fileType === 'pdf' ? 'pdf' : 'image',
        message: messageText,
      });
    } else {
      // Text-only message — use chat API
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${useMedicalStore.getState().accessToken}`,
          },
          body: JSON.stringify({
            message: messageText,
            sessionId: currentSessionId || undefined,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          if (data.sessionId && !currentSessionId) {
            setCurrentSessionId(data.sessionId);
          }

          addMessage({
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: data.aiResponse,
            messageType: 'text',
            timestamp: new Date(),
          });
        }
      } catch (error) {
        console.error('Chat API error:', error);
        // Use WebSocket as fallback for streaming
        startConsultation({
          sessionId,
          type: 'text',
          message: messageText,
        });
      }
    }
  }, [inputMessage, selectedFile, fileType, isProcessing, currentSessionId, addMessage, setCurrentSessionId, joinSession, startConsultation, setCurrentReport, authenticate]);

  // ── File Selection Handler ─────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    if (file.type.startsWith('image/')) {
      setFileType('image');
      const reader = new FileReader();
      reader.onload = (ev) => setFilePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      setFileType('pdf');
      setFilePreview(null);
    }
  };

  // ── Camera Capture Handler ─────────────────────────────
  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setFileType('image');
    const reader = new FileReader();
    reader.onload = (ev) => setFilePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setShowCamera(false);
  };

  // ── Keyboard handler ───────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="flex flex-col h-full border-0 shadow-none bg-transparent">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white/80 backdrop-blur-sm rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Virtual Physician</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-gray-500">Online · Medical AI Assistant</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] border-emerald-200 text-emerald-600">
            <Shield className="w-3 h-3 mr-1" />
            HIPAA Compliant
          </Badge>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4 py-4">
        <div ref={scrollRef} className="space-y-4">
          {/* Welcome message */}
          {chatMessages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Welcome to Your Medical Co-Pilot
              </h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                I&apos;m your Virtual Physician assistant. I can help you understand medical reports,
                explain lab results, and guide you to the right specialist.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
                {[
                  { icon: '📝', label: 'Type your symptoms', desc: 'Describe how you feel' },
                  { icon: '📄', label: 'Upload a PDF report', desc: 'Lab results, blood work' },
                  { icon: '📸', label: 'Capture an image', desc: 'Skin conditions, rashes' },
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-white rounded-lg border border-gray-100 hover:border-emerald-200 hover:shadow-sm transition-all cursor-pointer">
                    <span className="text-xl">{item.icon}</span>
                    <p className="text-xs font-medium text-gray-700 mt-1">{item.label}</p>
                    <p className="text-[10px] text-gray-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat messages */}
          {chatMessages.map((msg) => (
            <ChatBubble
              key={msg.id}
              role={msg.role}
              content={msg.content}
              messageType={msg.messageType}
              timestamp={msg.timestamp}
            />
          ))}

          {/* Streaming text */}
          {streamingText && (
            <ChatBubble
              role="assistant"
              content={streamingText}
              isStreaming
            />
          )}

          {/* Typing indicator */}
          {isTyping && !streamingText && <TypingIndicator />}

          {/* Progress streamer */}
          {isProcessing && <ProgressStreamer />}
        </div>
      </ScrollArea>

      {/* File Preview */}
      {selectedFile && (
        <div className="px-4 py-2 border-t bg-gray-50 flex items-center gap-3">
          {filePreview ? (
            <img src={filePreview} alt="Preview" className="w-12 h-12 rounded-lg object-cover border" />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center border">
              <FileText className="w-6 h-6 text-red-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-700 truncate">{selectedFile.name}</p>
            <p className="text-[10px] text-gray-400">
              {(selectedFile.size / 1024).toFixed(1)} KB · {fileType === 'pdf' ? 'PDF Document' : 'Image'}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { setSelectedFile(null); setFilePreview(null); setFileType(null); }}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Input Area */}
      <div className="px-4 py-3 border-t bg-white/80 backdrop-blur-sm rounded-b-xl">
        <div className="flex items-end gap-2">
          {/* File Upload Button */}
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 text-gray-400 hover:text-emerald-600"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
            <Paperclip className="w-5 h-5" />
          </Button>

          {/* Camera Button */}
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 text-gray-400 hover:text-teal-600"
            onClick={() => cameraInputRef.current?.click()}
            disabled={isProcessing}
          >
            <Camera className="w-5 h-5" />
          </Button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your symptoms, ask about a report, or type a question..."
              className="min-h-[40px] max-h-[120px] resize-none pr-3 text-sm border-gray-200 focus:border-emerald-300 focus:ring-emerald-200"
              rows={1}
              disabled={isProcessing}
            />
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={isProcessing || (!inputMessage.trim() && !selectedFile)}
            className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3"
            size="sm"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Safety disclaimer */}
        <p className="text-[10px] text-gray-400 mt-2 text-center">
          This AI assistant provides educational information only. It does not diagnose, prescribe, or replace professional medical advice.
        </p>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleCameraCapture}
      />
    </Card>
  );
}
