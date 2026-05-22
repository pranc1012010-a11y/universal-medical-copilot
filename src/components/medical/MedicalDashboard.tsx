// ============================================================
// MedicalDashboard — Unified Shell Container
// Orchestrates all views: Chat, Reports, and Navigation
// ============================================================

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MedicalChat } from './MedicalChat';
import { PatientReportViewer } from './PatientReportViewer';
import { UrgencyBadge } from './UrgencyBadge';
import { AuthForm } from './AuthForm';
import { useMedicalStore } from '@/stores/medical-store';
import {
  Heart, MessageSquare, FileText, LayoutDashboard,
  Settings, LogOut, Menu, X, Shield, Activity, Bell,
  ChevronRight, Clock, User
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function MedicalDashboard() {
  const {
    user, isAuthenticated, activeView, setActiveView,
    currentReport, reports, sidebarOpen, setSidebarOpen,
    logout,
  } = useMedicalStore();

  // ── Not authenticated: show login ──────────────────────
  if (!isAuthenticated) {
    return <AuthForm />;
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* ── Sidebar Navigation ──────────────────────────── */}
      <aside
        className={cn(
          'bg-white border-r border-gray-200 flex flex-col transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-16'
        )}
      >
        {/* Logo Area */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-gray-800 truncate">Medical Co-Pilot</h1>
                <p className="text-[10px] text-gray-400">AI-Powered Health Assistant</p>
              </div>
            )}
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-2 space-y-1">
          {[
            { id: 'chat' as const, icon: MessageSquare, label: 'AI Consultation', badge: null },
            { id: 'report' as const, icon: FileText, label: 'My Reports', badge: reports.length || null },
            { id: 'dashboard' as const, icon: LayoutDashboard, label: 'Dashboard', badge: null },
          ].map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                'w-full justify-start gap-3 h-10 text-sm',
                activeView === item.id
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
              onClick={() => {
                setActiveView(item.id);
                if (!sidebarOpen) setSidebarOpen(true);
              }}
            >
              <item.icon className={cn('w-4 h-4 shrink-0', activeView === item.id ? 'text-emerald-600' : 'text-gray-400')} />
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge !== null && (
                    <Badge variant="secondary" className="text-[10px] h-5">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-emerald-600" />
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700 truncate">{user?.name || user?.email}</p>
                <p className="text-[10px] text-gray-400 capitalize">{user?.role}</p>
              </div>
            )}
            {sidebarOpen && (
              <Button variant="ghost" size="sm" onClick={logout} className="text-gray-400 hover:text-red-500 shrink-0">
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-gray-400">Medical Co-Pilot</span>
              <ChevronRight className="w-3 h-3 text-gray-300" />
              <span className="font-medium text-gray-800">
                {activeView === 'chat' ? 'AI Consultation' :
                 activeView === 'report' ? 'Report Viewer' : 'Dashboard'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] border-emerald-200 text-emerald-600">
              <Shield className="w-3 h-3 mr-1" />
              Encrypted
            </Badge>
            <Button variant="ghost" size="sm" className="relative text-gray-400">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
          </div>
        </header>

        {/* Content Views */}
        <div className="flex-1 overflow-hidden">
          {activeView === 'chat' && (
            <Card className="h-full m-2 rounded-xl border-gray-200 shadow-sm">
              <MedicalChat />
            </Card>
          )}

          {activeView === 'report' && (
            currentReport ? (
              <PatientReportViewer />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-400">No Report Selected</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Upload a medical report in the chat to generate an analysis.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                    onClick={() => setActiveView('chat')}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Start a Consultation
                  </Button>
                </div>
              </div>
            )
          )}

          {activeView === 'dashboard' && (
            <DashboardView />
          )}
        </div>
      </main>
    </div>
  );
}

// ── Dashboard Overview Sub-Component ────────────────────────
function DashboardView() {
  const { reports, user } = useMedicalStore();

  const stats = [
    { label: 'Total Consultations', value: reports.length, icon: MessageSquare, color: 'text-emerald-500' },
    { label: 'Reports Analyzed', value: reports.length, icon: FileText, color: 'text-teal-500' },
    { label: 'Urgent Findings', value: reports.filter(r => r.urgencyFlag === 'urgent' || r.urgencyFlag === 'critical').length, icon: Activity, color: 'text-orange-500' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold">Welcome back, {user?.name || 'Patient'}</h2>
        <p className="text-emerald-100 mt-1 text-sm">
          Your health insights are secure and always available. How can I help you today?
        </p>
        <Button variant="secondary" className="mt-4 bg-white/20 hover:bg-white/30 text-white border-0">
          <MessageSquare className="w-4 h-4 mr-2" />
          Start New Consultation
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center bg-gray-50', stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Reports */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Recent Reports</h3>
        {reports.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No reports yet. Upload a medical document to get started.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {reports.slice(0, 5).map((report) => (
              <Card key={report.id} className="p-3 hover:shadow-sm transition-shadow cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {report.reportType === 'lab' ? 'Lab Report' :
                       report.reportType === 'radiology' ? 'Imaging Report' : 'Medical Report'}
                    </p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <UrgencyBadge level={report.urgencyFlag} size="sm" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Security Notice */}
      <Card className="p-4 bg-gray-50 border-gray-200">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-emerald-500 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-gray-700">Your Data is Protected</p>
            <p className="text-[11px] text-gray-500 mt-1">
              All uploaded files are encrypted with AES-256 at rest and securely purged after text extraction.
              JWT tokens rotate automatically. Your health data never leaves the secure environment.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
