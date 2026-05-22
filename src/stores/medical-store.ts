// ============================================================
// Zustand State Management — Medical Co-Pilot Global Store
// ============================================================

import { create } from 'zustand';

// ── Types ────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'admin' | 'doctor' | 'patient';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  messageType: 'text' | 'image' | 'document' | 'system';
  attachments?: { type: string; name: string; size: number }[];
  timestamp: Date;
}

export interface LabMarker {
  name: string;
  value: number;
  unit: string;
  refLow: number;
  refHigh: number;
  status: 'low' | 'normal' | 'high' | 'critical';
}

export interface GradCamData {
  imageUrl: string;
  heatmapCoords: { x: number; y: number; width: number; height: number; intensity: number }[];
  classification: string;
  confidence: number;
}

export interface MedicalReportData {
  id: string;
  reportType: string;
  urgencyFlag: 'normal' | 'elevated' | 'urgent' | 'critical';
  recommendedSpecialty: string | null;
  labMarkers: LabMarker[];
  clinicalView: {
    summary: string;
    metrics: { name: string; value: string; reference: string; flag: string }[];
    latinTerms: string[];
    rawFindings: string;
  } | null;
  patientView: {
    summary: string;
    analogies: string[];
    urgencyLevel: string;
    recommendedAction: string;
    safetyNote: string;
    targetSpecialty: string;
  } | null;
  gradCamData: GradCamData | null;
  createdAt: string;
}

export interface ProgressStep {
  step: number;
  label: string;
  percentage: number;
}

// ── Store State ──────────────────────────────────────────────
interface MedicalStore {
  // Auth
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  // Chat
  chatMessages: ChatMessage[];
  currentSessionId: string | null;
  isTyping: boolean;
  streamingText: string;

  // Reports
  currentReport: MedicalReportData | null;
  reports: MedicalReportData[];
  activeReportTab: 'patient' | 'clinical';

  // Progress
  progressSteps: ProgressStep[];
  isProcessing: boolean;

  // UI
  activeView: 'chat' | 'report' | 'dashboard';
  sidebarOpen: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setTokens: (access: string, refresh: string) => void;
  logout: () => void;
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setCurrentSessionId: (id: string | null) => void;
  setIsTyping: (typing: boolean) => void;
  appendStreamingText: (token: string) => void;
  clearStreamingText: () => void;
  setCurrentReport: (report: MedicalReportData | null) => void;
  setReports: (reports: MedicalReportData[]) => void;
  setActiveReportTab: (tab: 'patient' | 'clinical') => void;
  addProgressStep: (step: ProgressStep) => void;
  clearProgressSteps: () => void;
  setIsProcessing: (processing: boolean) => void;
  setActiveView: (view: 'chat' | 'report' | 'dashboard') => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useMedicalStore = create<MedicalStore>((set) => ({
  // Auth initial state
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,

  // Chat initial state
  chatMessages: [],
  currentSessionId: null,
  isTyping: false,
  streamingText: '',

  // Reports initial state
  currentReport: null,
  reports: [],
  activeReportTab: 'patient',

  // Progress initial state
  progressSteps: [],
  isProcessing: false,

  // UI initial state
  activeView: 'chat',
  sidebarOpen: true,

  // ── Actions ────────────────────────────────────────────────
  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setTokens: (access, refresh) => set({ accessToken: access, refreshToken: refresh }),

  logout: () => set({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    chatMessages: [],
    currentSessionId: null,
    currentReport: null,
    reports: [],
    streamingText: '',
    progressSteps: [],
    isProcessing: false,
  }),

  addMessage: (message) => set((state) => ({
    chatMessages: [...state.chatMessages, message],
  })),

  setMessages: (messages) => set({ chatMessages: messages }),

  setCurrentSessionId: (id) => set({ currentSessionId: id }),

  setIsTyping: (typing) => set({ isTyping: typing }),

  appendStreamingText: (token) => set((state) => ({
    streamingText: state.streamingText + token,
  })),

  clearStreamingText: () => set({ streamingText: '' }),

  setCurrentReport: (report) => set({ currentReport: report, activeView: report ? 'report' : 'chat' }),

  setReports: (reports) => set({ reports }),

  setActiveReportTab: (tab) => set({ activeReportTab: tab }),

  addProgressStep: (step) => set((state) => ({
    progressSteps: [...state.progressSteps, step],
  })),

  clearProgressSteps: () => set({ progressSteps: [] }),

  setIsProcessing: (processing) => set({ isProcessing: processing }),

  setActiveView: (view) => set({ activeView: view }),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
