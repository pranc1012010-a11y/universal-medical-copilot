// ============================================================
// MedicalChat — REAL DOCTOR Consultation Experience
// Arabic-first, empathetic, step-by-step clinical flow
// Features: symptom picker, vital signs, file upload, camera
// ============================================================

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatBubble, TypingIndicator } from './ChatBubble';
import { ProgressStreamer } from './ProgressStreamer';
import { SymptomChecker } from './SymptomChecker';
import { useMedicalStore } from '@/stores/medical-store';
import { useMedicalWebSocket } from '@/hooks/use-websocket';
import { detectSymptomsFromText, SymptomProfile } from '@/lib/ai-pipeline-client';
import {
  Send, Paperclip, Camera, X, FileText, Image as ImageIcon,
  Loader2, Stethoscope, Heart, Shield, Mic, MicOff,
  Thermometer, Activity, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function MedicalChat() {
  const {
    user, chatMessages, currentSessionId, isTyping,
    streamingText, isProcessing,
    addMessage, setCurrentSessionId, setIsTyping,
    setCurrentReport,
  } = useMedicalStore();

  const { startConsultation, joinSession, authenticate } = useMedicalWebSocket();

  const [inputMessage, setInputMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'pdf' | 'image' | null>(null);
  const [showSymptomChecker, setShowSymptomChecker] = useState(false);
  const [detectedSymptom, setDetectedSymptom] = useState<SymptomProfile | null>(null);
  const [consultationPhase, setConsultationPhase] = useState<'greeting' | 'history' | 'examination' | 'assessment' | 'plan'>('greeting');

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, streamingText, isTyping]);

  // Authenticate WebSocket
  useEffect(() => {
    if (user) {
      authenticate(user.id);
    }
  }, [user, authenticate]);

  // ── Handle Symptom Selection ───────────────────────────
  const handleSymptomSelect = useCallback(async (profile: SymptomProfile) => {
    setShowSymptomChecker(false);
    setDetectedSymptom(profile);
    setConsultationPhase('history');

    // Add user message about symptom
    addMessage({
      id: `user-${Date.now()}`,
      role: 'user',
      content: `عندي ${profile.nameAr} (${profile.nameEn})`,
      messageType: 'text',
      timestamp: new Date(),
    });

    // Generate doctor response with symptom-specific questions
    setIsTyping(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useMedicalStore.getState().accessToken}`,
        },
        body: JSON.stringify({
          message: `عندي ${profile.nameAr} (${profile.nameEn})`,
          sessionId: currentSessionId || undefined,
          symptomId: profile.id,
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
    } catch {
      // Fallback: use symptom follow-up questions
      const firstQuestions = profile.followUpQuestions.slice(0, 3);
      addMessage({
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: `فاهم — خليني أسألك كام سؤال عشان أفهم أحسن:\n\n${firstQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\n⚠️ *دي توجيهات تعليمية — لو الأعراض شديدة، روح الطوارئ فوراً.*`,
        messageType: 'text',
        timestamp: new Date(),
      });
    } finally {
      setIsTyping(false);
    }
  }, [addMessage, setCurrentSessionId, setIsTyping, currentSessionId, authenticate]);

  // ── Send Message ───────────────────────────────────────
  const handleSend = useCallback(async () => {
    if ((!inputMessage.trim() && !selectedFile) || isProcessing) return;

    const sessionId = currentSessionId || `session-${Date.now()}`;
    if (!currentSessionId) {
      setCurrentSessionId(sessionId);
    }
    joinSession(sessionId);

    // Detect symptoms from text
    const detected = detectSymptomsFromText(inputMessage);
    if (detected.length > 0 && !detectedSymptom) {
      setDetectedSymptom(detected[0]);
      setConsultationPhase('history');
    }

    addMessage({
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputMessage || (selectedFile ? `Uploaded: ${selectedFile.name}` : ''),
      messageType: (selectedFile ? (fileType === 'pdf' ? 'document' : 'image') : 'text') as 'text' | 'document' | 'image',
      attachments: selectedFile ? [{ type: fileType || 'unknown', name: selectedFile.name, size: selectedFile.size }] : [],
      timestamp: new Date(),
    });

    const messageText = inputMessage;
    setInputMessage('');
    setSelectedFile(null);
    setFilePreview(null);
    setFileType(null);

    if (selectedFile) {
      try {
        const formData = new FormData();
        if (messageText) formData.append('message', messageText);
        formData.append('file', selectedFile);
        formData.append('fileType', fileType || 'image');
        if (currentSessionId) formData.append('sessionId', currentSessionId);
        if (detectedSymptom) formData.append('symptomId', detectedSymptom.id);

        const res = await fetch('/api/consult', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${useMedicalStore.getState().accessToken}` },
          body: formData,
        });

        const data = await res.json();
        if (res.ok) {
          if (data.sessionId && !currentSessionId) setCurrentSessionId(data.sessionId);
          addMessage({
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: data.aiResponse,
            messageType: 'text',
            timestamp: new Date(),
          });
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
      } catch {
        addMessage({
          id: `error-${Date.now()}`,
          role: 'system',
          content: 'خطأ في الاتصال — بياناتك في أمان، حاول تاني',
          messageType: 'system',
          timestamp: new Date(),
        });
      }
      startConsultation({ sessionId, type: fileType === 'pdf' ? 'pdf' : 'image', message: messageText });
    } else {
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
            symptomId: detectedSymptom?.id,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          if (data.sessionId && !currentSessionId) setCurrentSessionId(data.sessionId);
          addMessage({
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: data.aiResponse,
            messageType: 'text',
            timestamp: new Date(),
          });
        }
      } catch {
        startConsultation({ sessionId, type: 'text', message: messageText });
      }
    }
  }, [inputMessage, selectedFile, fileType, isProcessing, currentSessionId, detectedSymptom, addMessage, setCurrentSessionId, joinSession, startConsultation, setCurrentReport]);

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

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setFileType('image');
    const reader = new FileReader();
    reader.onload = (ev) => setFilePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Quick Action Buttons ───────────────────────────────
  const quickActions = [
    { label: '🤕 صداع', action: () => { const s = detectSymptomsFromText('صداع'); if (s[0]) handleSymptomSelect(s[0]); } },
    { label: '❤️‍🩹 ألم صدر', action: () => { const s = detectSymptomsFromText('ألم صدر'); if (s[0]) handleSymptomSelect(s[0]); } },
    { label: '😴 إرهاق', action: () => { const s = detectSymptomsFromText('إرهاق'); if (s[0]) handleSymptomSelect(s[0]); } },
    { label: '🤢 ألم بطن', action: () => { const s = detectSymptomsFromText('ألم بطن'); if (s[0]) handleSymptomSelect(s[0]); } },
    { label: '😮‍💨 ضيق نفس', action: () => { const s = detectSymptomsFromText('ضيق نفس'); if (s[0]) handleSymptomSelect(s[0]); } },
    { label: '🩹 طفح جلدي', action: () => { const s = detectSymptomsFromText('طفح جلدي'); if (s[0]) handleSymptomSelect(s[0]); } },
  ];

  return (
    <Card className="flex flex-col h-full border-0 shadow-none bg-transparent">
      {/* ── Chat Header — Doctor Identity ────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center ring-2 ring-emerald-200 ring-offset-2">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">د. المساعد الطبي</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-gray-500">أونلاين · طبيب ذكي متخصص</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {detectedSymptom && (
            <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
              {detectedSymptom.icon} {detectedSymptom.nameAr}
            </Badge>
          )}
          <Badge variant="outline" className="text-[10px] border-emerald-200 text-emerald-600">
            <Shield className="w-3 h-3 mr-1" />
            مشفر
          </Badge>
        </div>
      </div>

      {/* ── Messages Area ────────────────────────────────── */}
      <ScrollArea className="flex-1 px-4 py-4">
        <div ref={scrollRef} className="space-y-4">
          {/* Welcome — Doctor Greeting */}
          {chatMessages.length === 0 && !showSymptomChecker && (
            <div className="text-center py-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mx-auto mb-4 ring-4 ring-emerald-50">
                <Stethoscope className="w-12 h-12 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                أهلاً بيك في العيادة! 🏥
              </h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-2">
                أنا الدكتور المساعد بتاعك. هسألك أسئلة زي ما أي دكتور بيعمل في العيادة،
                وهساعدك تفهم تحاليلك وتقاريرك الطبية بلغة بسيطة.
              </p>
              <p className="text-xs text-gray-400 mb-6">
                اختار العرض اللي بتحس بيه، أو اكتب شكواك وأنا هبدأ أسألك
              </p>

              {/* Symptom Quick Actions */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {quickActions.map((action, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="rounded-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 text-xs"
                    onClick={action.action}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>

              {/* More Symptoms Button */}
              <Button
                variant="outline"
                className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                onClick={() => setShowSymptomChecker(true)}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                عرض كل الأعراض
              </Button>

              {/* What I Can Do */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto mt-8">
                {[
                  { icon: '🩺', label: 'أسئلة طبية ذكية', desc: 'زي الدكتور في العيادة' },
                  { icon: '📊', label: 'تحليل التحاليل', desc: 'أرقامك تبقى تشبيهات' },
                  { icon: '🔬', label: 'تحليل الصور', desc: 'آفات جلدية وأشعة' },
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-white rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-sm transition-all cursor-pointer">
                    <span className="text-2xl">{item.icon}</span>
                    <p className="text-xs font-semibold text-gray-700 mt-1">{item.label}</p>
                    <p className="text-[10px] text-gray-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Symptom Checker Overlay */}
          {showSymptomChecker && (
            <SymptomChecker
              onSelectSymptom={handleSymptomSelect}
              onClose={() => setShowSymptomChecker(false)}
            />
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
            <ChatBubble role="assistant" content={streamingText} isStreaming />
          )}

          {/* Typing indicator */}
          {isTyping && !streamingText && <TypingIndicator />}

          {/* Progress streamer */}
          {isProcessing && <ProgressStreamer />}
        </div>
      </ScrollArea>

      {/* ── File Preview ──────────────────────────────────── */}
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
              {(selectedFile.size / 1024).toFixed(1)} KB · {fileType === 'pdf' ? 'تقرير PDF' : 'صورة'}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { setSelectedFile(null); setFilePreview(null); setFileType(null); }}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* ── Input Area ────────────────────────────────────── */}
      <div className="px-4 py-3 border-t bg-white/90 backdrop-blur-sm rounded-b-xl">
        {/* Quick symptom pills (show during active chat) */}
        {chatMessages.length > 0 && (
          <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1">
            {quickActions.slice(0, 4).map((action, i) => (
              <button
                key={i}
                onClick={action.action}
                className="shrink-0 px-2.5 py-1 rounded-full text-[11px] bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
              >
                {action.label}
              </button>
            ))}
            <button
              onClick={() => setShowSymptomChecker(true)}
              className="shrink-0 px-2.5 py-1 rounded-full text-[11px] bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
            >
              المزيد...
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* File Upload */}
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 text-gray-400 hover:text-emerald-600"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
            <Paperclip className="w-5 h-5" />
          </Button>

          {/* Camera */}
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
              placeholder="اكتب شكواك أو أجب على سؤال الدكتور..."
              className="min-h-[40px] max-h-[120px] resize-none pr-3 text-sm border-gray-200 focus:border-emerald-300 focus:ring-emerald-200"
              rows={1}
              disabled={isProcessing}
            />
          </div>

          {/* Send */}
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
          ⚠️ ده توجيه تعليمي فقط — مش تشخيص ولا وصفة طبية. لو حالة طوارئ، روح المستشفى فوراً.
        </p>
      </div>

      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept=".pdf,image/*" className="hidden" onChange={handleFileSelect} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCameraCapture} />
    </Card>
  );
}
