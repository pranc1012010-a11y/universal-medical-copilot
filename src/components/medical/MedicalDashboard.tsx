// ============================================================
// MedicalDashboard — Arabic-first Unified Shell
// Orchestrates: Chat (العيادة), Reports (التقارير), Dashboard
// ============================================================

'use client';

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
  LogOut, Menu, X, Shield, Activity, Bell,
  ChevronRight, Clock, User, Stethoscope, Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function MedicalDashboard() {
  const {
    user, isAuthenticated, activeView, setActiveView,
    currentReport, reports, sidebarOpen, setSidebarOpen,
    logout,
  } = useMedicalStore();

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* ── Sidebar ────────────────────────────────────── */}
      <aside
        className={cn(
          'bg-white border-r border-gray-200 flex flex-col transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-16'
        )}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-gray-800 truncate">المساعد الطبي</h1>
                <p className="text-[10px] text-gray-400">طبيبك الذكي</p>
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-1">
          {[
            { id: 'chat' as const, icon: Stethoscope, label: 'العيادة', desc: 'استشارة طبية', badge: null },
            { id: 'report' as const, icon: FileText, label: 'التقارير', desc: 'تقاريري', badge: reports.length || null },
            { id: 'dashboard' as const, icon: LayoutDashboard, label: 'لوحة التحكم', desc: 'نظرة عامة', badge: null },
          ].map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                'w-full justify-start gap-3 h-11 text-sm',
                activeView === item.id
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
              onClick={() => { setActiveView(item.id); if (!sidebarOpen) setSidebarOpen(true); }}
            >
              <item.icon className={cn('w-4 h-4 shrink-0', activeView === item.id ? 'text-emerald-600' : 'text-gray-400')} />
              {sidebarOpen && (
                <>
                  <div className="flex-1 text-left">
                    <span className="block">{item.label}</span>
                    <span className="block text-[10px] text-gray-400">{item.desc}</span>
                  </div>
                  {item.badge !== null && (
                    <Badge variant="secondary" className="text-[10px] h-5">{item.badge}</Badge>
                  )}
                </>
              )}
            </Button>
          ))}
        </nav>

        {/* Quick Stats */}
        {sidebarOpen && (
          <div className="px-3 py-2 border-t border-gray-100">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[11px] font-semibold text-emerald-700">إحصائيات سريعة</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center">
                  <p className="text-lg font-bold text-emerald-600">{reports.length}</p>
                  <p className="text-[9px] text-gray-500">تقرير</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-orange-500">
                    {reports.filter(r => r.urgencyFlag === 'urgent' || r.urgencyFlag === 'critical').length}
                  </p>
                  <p className="text-[9px] text-gray-500">عاجل</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User */}
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-emerald-600" />
            </div>
            {sidebarOpen && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">{user?.name || user?.email}</p>
                  <p className="text-[10px] text-gray-400">
                    {user?.role === 'doctor' ? '👨‍⚕️ طبيب' : user?.role === 'admin' ? '🔧 مدير' : '🧑 مريض'}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={logout} className="text-gray-400 hover:text-red-500 shrink-0">
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-gray-400 lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-gray-400">المساعد الطبي</span>
              <ChevronRight className="w-3 h-3 text-gray-300" />
              <span className="font-medium text-gray-800">
                {activeView === 'chat' ? '🏥 العيادة' :
                 activeView === 'report' ? '📋 التقارير' : '📊 لوحة التحكم'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] border-emerald-200 text-emerald-600">
              <Shield className="w-3 h-3 mr-1" />
              مشفّر
            </Badge>
          </div>
        </header>

        {/* Content */}
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
                  <h3 className="text-lg font-semibold text-gray-400">مفيش تقرير محدد</h3>
                  <p className="text-sm text-gray-400 mt-1">ارفع تقرير طبي في العيادة عشان يتتحلل</p>
                  <Button variant="outline" className="mt-4 border-emerald-200 text-emerald-600 hover:bg-emerald-50" onClick={() => setActiveView('chat')}>
                    <Stethoscope className="w-4 h-4 mr-2" />
                    ابدأ استشارة
                  </Button>
                </div>
              </div>
            )
          )}

          {activeView === 'dashboard' && <DashboardView />}
        </div>
      </main>
    </div>
  );
}

// ── Dashboard View ──────────────────────────────────────
function DashboardView() {
  const { reports, user } = useMedicalStore();

  const stats = [
    { label: 'الاستشارات', value: reports.length, icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'التقارير المحللة', value: reports.length, icon: FileText, color: 'text-teal-500', bg: 'bg-teal-50' },
    { label: 'نتائج عاجلة', value: reports.filter(r => r.urgencyFlag === 'urgent' || r.urgencyFlag === 'critical').length, icon: Activity, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold">أهلاً بيك يا {user?.name || 'دكتور'}! 👨‍⚕️</h2>
        <p className="text-emerald-100 mt-1 text-sm">
          صحتك في أمان — بياناتك مشفّرة وبتتسأل زي ما الدكتور بيسأل في العيادة
        </p>
        <Button variant="secondary" className="mt-4 bg-white/20 hover:bg-white/30 text-white border-0" onClick={() => useMedicalStore.getState().setActiveView('chat')}>
          <Stethoscope className="w-4 h-4 mr-2" />
          ابدأ استشارة جديدة
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', stat.bg, stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* How It Works */}
      <Card className="p-6">
        <h3 className="text-sm font-bold text-gray-800 mb-4">🩺 إزاي الدكتور الشاغي بيشتغل؟</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { step: '1', title: 'اختار العرض', desc: 'صداع، ألم صدر، طفح...' },
            { step: '2', title: 'أسئلة الدكتور', desc: 'أسئلة استكشافية زي العيادة' },
            { step: '3', title: 'التشخيص التفريقي', desc: 'احتمالات مبنية على إجاباتك' },
            { step: '4', title: 'التوجيه', desc: 'التخصص المناسب والخطوة الجاية' },
          ].map((item, i) => (
            <div key={i} className="text-center p-3 rounded-xl bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 font-bold text-sm flex items-center justify-center mx-auto mb-2">
                {item.step}
              </div>
              <p className="text-xs font-semibold text-gray-700">{item.title}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Reports */}
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-3">آخر التقارير</h3>
        {reports.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">لسه مفيش تقارير. ارفع مستند طبي عشان نبدأ.</p>
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
                      {report.reportType === 'lab' ? 'تقرير تحاليل' :
                       report.reportType === 'radiology' ? 'تقرير أشعة' : 'تقرير طبي'}
                    </p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(report.createdAt).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                  <UrgencyBadge level={report.urgencyFlag} size="sm" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Security */}
      <Card className="p-4 bg-gray-50 border-gray-200">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-emerald-500 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-gray-700">بياناتك محمية 🔒</p>
            <p className="text-[11px] text-gray-500 mt-1">
              كل الملفات المرفوعة بتتشفر بـ AES-256 وبتيجي تتسحب فوراً بعد استخراج النص.
              رموز JWT بتتغير تلقائي. بياناتك الصحية مابتعبرش البيئة الآمنة أبداً.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
