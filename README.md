# ClassChecking — ระบบเช็คชื่อนักศึกษา

Full-stack web app สำหรับเช็คชื่อนักศึกษา มี 2 role: อาจารย์และนักศึกษา

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router) + TypeScript + TailwindCSS |
| Backend | Node.js + Express 5 |
| Database | PostgreSQL + Prisma 5 |
| Auth | JWT + bcryptjs |

## Features

- อาจารย์สร้างวิชาพร้อมตารางเรียนรายวัน (หลาย session ต่อวันได้)
- Auto-generate คาบเรียนตลอด semester
- เพิ่มนักศึกษาด้วยรหัสนักศึกษา → สร้าง account อัตโนมัติ
- นักศึกษาเช็คชื่อผ่านเว็บในช่วง 20 นาทีแรกของคาบ
- ระบบคะแนน: เริ่ม 10 คะแนน, สาย 10–19 นาที −0.5, ขาด −1
- สถานะไม่มีสิทธิ์สอบเมื่อขาดเกิน 20% ของทั้งหมด

## Local Development

### Prerequisites
- Node.js 20+
- Docker (สำหรับ PostgreSQL)

### Setup

```bash
# 1. Start PostgreSQL
docker compose up -d

# 2. Backend
cd backend
cp .env.example .env   # แก้ไข JWT_SECRET
npm install
npx prisma migrate dev
npx prisma db seed     # สร้าง teacher1 / teacher123
npm run dev

# 3. Frontend
cd frontend
cp .env.example .env.local   # ปล่อยว่างไว้ถ้าใช้ localhost
npm install
npm run dev
```

เปิด http://localhost:3000 — login ด้วย `teacher1` / `teacher123`

## Deployment

### Backend → Railway

1. New Project → Deploy from GitHub repo → เลือก Root Directory: `backend`
2. Add PostgreSQL plugin
3. ตั้ง Environment Variables:
   - `DATABASE_URL` — copy จาก PostgreSQL plugin
   - `JWT_SECRET` — random string ยาวๆ
   - `FRONTEND_URL` — Vercel URL (ใส่ทีหลังได้)
4. Railway จะรัน `npx prisma migrate deploy && node src/index.js` อัตโนมัติ

### Frontend → Vercel

1. Import GitHub repo → Root Directory: `frontend`
2. ตั้ง Environment Variable:
   - `NEXT_PUBLIC_API_URL` = `https://your-backend.up.railway.app/api`
3. Deploy

### หลัง Deploy ครบ

อย่าลืมกลับไปตั้ง `FRONTEND_URL` ใน Railway ให้ตรงกับ Vercel URL เพื่อให้ CORS ทำงานถูกต้อง
