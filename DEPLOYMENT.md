# 🚀 Deployment Guide - Vercel + PostgreSQL

## مرحباً! دليل كامل للـ Deploy على Vercel

---

## **الخطوة 1️⃣: إنشاء PostgreSQL Database**

اختر واحد من الخيارات:

### **Option A: Vercel Postgres** (الأسهل والأفضل)
```bash
1. روح https://vercel.com/dashboard
2. اذهب إلى "Storage" tab
3. اضغط "Create Database"
4. اختر "Postgres"
5. اختر Region (مثل us-east-1)
6. اضغط Create
7. انسخ CONNECTION STRING (راح تكون في Format)
```

### **Option B: Supabase** (مجاني وقوي)
```bash
1. روح https://supabase.com
2. اضغط "New Project"
3. ملء البيانات
4. انتظر 2 دقايق
5. روح Settings → Database → Connection String
6. انسخ postgresql://... URL
```

### **Option C: Neon** (مجاني)
```bash
1. روح https://neon.tech
2. Sign Up
3. Create Project
4. Copy Connection String
```

### **Option D: Railway** (سهل جداً)
```bash
1. روح https://railway.app
2. Sign Up with GitHub
3. New Project → PostgreSQL
4. Copy DATABASE_URL
```

---

## **الخطوة 2️⃣: حضّر Git Repository**

```bash
cd universal-medical-copilot
git add .
git commit -m "chore: prepare for Vercel deployment with PostgreSQL"
git push origin main
```

---

## **الخطوة 3️⃣: Deploy على Vercel**

### **أ. اذهب إلى Vercel**
```
https://vercel.com
```

### **ب. اضغط "Add New" → "Project"**

### **ج. اختر Repository**
```
Select: pranc1012010-a11y/universal-medical-copilot
```

### **د. في صفحة Configuration, أضف Environment Variables**

```
Key                  | Value
==================== | ========================================
DATABASE_URL         | postgresql://user:pass@host/db
JWT_SECRET           | your-super-secret-key-min-32-chars
JWT_REFRESH_SECRET   | your-refresh-secret-key-min-32-chars
ENCRYPTION_KEY       | your-aes-256-key-32-bytes
NEXT_PUBLIC_APP_URL  | https://[project-name].vercel.app
NODE_ENV             | production
```

### **هـ. اضغط "Deploy"** ✅

---

## **الخطوة 4️⃣: انتظر البناء (Build)**

```
Vercel يعمل على:
✅ Install dependencies
✅ Generate Prisma Client
✅ Run database migrations
✅ Build Next.js app
✅ Deploy!
```

الوقت: **3-5 دقايق**

---

## **الخطوة 5️⃣: تحقق من النتيجة**

بعد ما الـ Build يخلص:

```
🎉 Your site is live at:
https://[your-project-name].vercel.app
```

---

## **🔑 قائمة المتغيرات (Environment Variables)**

### **DATABASE_URL**
- من Vercel Postgres / Supabase / Neon / Railway
- Format: `postgresql://user:password@host:5432/dbname`

### **JWT_SECRET** & **JWT_REFRESH_SECRET**
- استخدم مفاتيح عشوائية قوية
- الحد الأدنى: 32 حرف

توليد مفتاح عشوائي:
```bash
# في Terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### **ENCRYPTION_KEY**
- 32 bytes مشفرة
- استخدم نفس الأمر أعلاه

### **NEXT_PUBLIC_APP_URL**
- يجب أن تكون `https://[your-vercel-domain].vercel.app`
- هذا يُستخدم للـ Front-end للـ API calls

---

## **❌ Troubleshooting**

### **Error: "DATABASE_URL is not set"**
```
✅ تأكد أنك أضفت DATABASE_URL في Vercel Environment Variables
✅ أعد Deployment بعد الإضافة
```

### **Error: "Prisma migration failed"**
```
✅ تأكد أن PostgreSQL database مفعّل وشغّال
✅ جرّب إعادة Create Database وإضافة CONNECTION STRING جديد
```

### **Error: "Build failed"**
```
✅ انقر على Build Logs في Vercel Dashboard
✅ شوف الـ Error الكامل
✅ اعمل fix في Local ثم push مرة أخرى
```

### **App loads but can't login**
```
✅ تأكد من JWT_SECRET و JWT_REFRESH_SECRET
✅ اعد Deployment
```

---

## **🚀 بعد ما تخلص:**

1. **قم بـ Test اللـ App**
   ```
   https://[your-app].vercel.app
   ```

2. **جرّب Sign Up & Login**
   - استخدم بريد اختباري

3. **تحقق من Database**
   - روح Vercel/Supabase Dashboard
   - شوف الـ Users في Database

4. **شارك اللينك**
   ```
   https://[your-app].vercel.app
   ```

---

## **📝 ملاحظات مهمة**

- ✅ **SSL/HTTPS** تفعّل تلقائياً على Vercel
- ✅ **Custom Domain** ممكن تضيفه لاحقاً
- ✅ **Free tier** يدعم التطبيق بدون مشاكل
- ✅ **Auto Deployment** يشتغل كل مرة تعمل push للـ GitHub

---

## **🆘 محتاج مساعدة؟**

- Vercel Docs: https://vercel.com/docs
- Prisma Docs: https://www.prisma.io/docs
- PostgreSQL Guides: https://www.postgresql.org/docs

**Good luck! 🎉**
