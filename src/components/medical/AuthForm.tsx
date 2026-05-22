// ============================================================
// AuthForm — Login & Registration (Arabic-first UI)
// Bulletproof JWT-based authentication
// ============================================================

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMedicalStore } from '@/stores/medical-store';
import { Shield, User, Stethoscope, Heart, AlertCircle, Loader2 } from 'lucide-react';

export function AuthForm() {
  const { setUser, setTokens } = useMedicalStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'patient' | 'doctor'>('patient');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'فشل تسجيل الدخول'); return; }
      setUser(data.user);
      setTokens(data.accessToken, data.refreshToken);
    } catch { setError('خطأ في الاتصال. حاول تاني.'); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail, password: regPassword, name: regName, role: regRole }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'فشل إنشاء الحساب'); return; }
      setUser(data.user);
      setTokens(data.accessToken, data.refreshToken);
    } catch { setError('خطأ في الاتصال. حاول تاني.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 mb-4 ring-4 ring-emerald-50">
            <Heart className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">المساعد الطبي الشامل</h1>
          <p className="text-gray-500 mt-1">طبيبك الذكي — مترجم التقارير والمستشار الصحي</p>
        </div>

        <Card className="shadow-xl border-0 ring-1 ring-gray-200/50">
          <Tabs value={mode} onValueChange={(v) => { setMode(v as 'login' | 'register'); setError(''); }}>
            <TabsList className="grid w-full grid-cols-2 rounded-none border-b h-12">
              <TabsTrigger value="login" className="text-sm">تسجيل دخول</TabsTrigger>
              <TabsTrigger value="register" className="text-sm">حساب جديد</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="m-0">
              <form onSubmit={handleLogin}>
                <CardContent className="pt-6 space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="login-email">البريد الإلكتروني</Label>
                    <Input id="login-email" type="email" placeholder="doctor@hospital.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">كلمة المرور</Label>
                    <Input id="login-password" type="password" placeholder="أدخل كلمة المرور" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
                    دخول بأمان
                  </Button>
                </CardContent>
              </form>
            </TabsContent>

            <TabsContent value="register" className="m-0">
              <form onSubmit={handleRegister}>
                <CardContent className="pt-6 space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">الاسم الكامل</Label>
                    <Input id="reg-name" placeholder="د. أحمد محمد" value={regName} onChange={(e) => setRegName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">البريد الإلكتروني</Label>
                    <Input id="reg-email" type="email" placeholder="you@hospital.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">كلمة المرور (8 حروف على الأقل)</Label>
                    <Input id="reg-password" type="password" placeholder="كلمة مرور قوية" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required minLength={8} />
                  </div>
                  <div className="space-y-2">
                    <Label>الدور</Label>
                    <Select value={regRole} onValueChange={(v) => setRegRole(v as 'patient' | 'doctor')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="patient">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            مريض — عرض التقارير المترجمة
                          </div>
                        </SelectItem>
                        <SelectItem value="doctor">
                          <div className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4" />
                            طبيب — وصول سريري كامل
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
                    إنشاء حساب
                  </Button>
                </CardContent>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
          <Shield className="w-3 h-3" />
          تشفير AES-256 · رموز JWT متجددة · تصميم متوافق مع HIPAA
        </p>
      </div>
    </div>
  );
}
