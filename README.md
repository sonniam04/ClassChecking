# ClassChecking — ระบบเช็คชื่อนักศึกษา

ระบบเช็คชื่อนักศึกษาผ่านเว็บ รองรับ 2 role: **อาจารย์** และ **นักศึกษา**

## Features

**อาจารย์**
- สร้างรายวิชาพร้อมตารางเรียนรายวัน (หลาย session ต่อวันได้)
- ระบบ auto-generate คาบเรียนตลอด semester
- เพิ่มนักศึกษาด้วยรหัสนักศึกษา → สร้าง account อัตโนมัติ
- ปิด/เปิด session ก่อนครบเวลาได้
- ดูสถิติการเข้าเรียนและคะแนนของนักศึกษาแต่ละคน

**นักศึกษา**
- เช็คชื่อผ่านเว็บในช่วง 20 นาทีแรกของคาบ
- หน้าจอ refresh อัตโนมัติทุก 30 วินาที
- ดูประวัติการเข้าเรียนทั้งหมด

**ระบบคะแนน**
- เริ่มต้น 10 คะแนนต่อวิชา
- มาสาย 10–19 นาที หัก 0.5 คะแนน
- ขาดเรียน หัก 1 คะแนน
- ขาดเกิน 20% ของทั้งหมด → ติดสถานะ **ไม่มีสิทธิ์สอบ**

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 |
| Backend | Node.js + Express 5 |
| Database | PostgreSQL + Prisma 5 |
| Auth | JWT + bcryptjs |
| Hosting | Vercel (frontend) + Railway (backend + database) |

## Getting Started

### Prerequisites
- Node.js 20+
- Docker

### Installation

```bash
# Clone repo
git clone https://github.com/sonniam04/ClassChecking.git
cd ClassChecking

# Start PostgreSQL
docker compose up -d

# Backend
cd backend
cp .env.example .env        # แก้ไข JWT_SECRET
npm install
npx prisma migrate dev
npx prisma db seed          # สร้าง teacher1 / teacher123
npm run dev                 # รันที่ port 4000

# Frontend (terminal ใหม่)
cd frontend
cp .env.example .env.local  # ปล่อยว่างได้ถ้าใช้ localhost
npm install
npm run dev                 # รันที่ port 3000
```

เปิด [http://localhost:3000](http://localhost:3000) แล้ว login ด้วย `teacher1` / `teacher123`

## Environment Variables

**Backend** (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key สำหรับ sign JWT |
| `PORT` | Port ที่ backend รัน (default: 4000) |
| `FRONTEND_URL` | URL ของ frontend สำหรับ CORS |

**Frontend** (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL ของ backend API เช่น `https://xxx.railway.app/api` |

## Deployment

### Backend → Railway
1. New Project → Deploy from GitHub → Root Directory: `backend`
2. Add PostgreSQL plugin
3. ตั้ง Environment Variables: `DATABASE_URL`, `JWT_SECRET`, `PORT=4000`, `FRONTEND_URL`
4. Railway รัน migrate + seed อัตโนมัติตอน deploy

### Frontend → Vercel
1. Import GitHub repo → Root Directory: `frontend`
2. ตั้ง Environment Variable: `NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api`
3. Deploy

## Default Account

| Role | Username | Password |
|------|----------|----------|
| อาจารย์ | `teacher1` | `teacher123` |

นักศึกษา: username = `u{รหัสนักศึกษา}`, password = `{รหัสนักศึกษา}`  
เช่น รหัส `660710586` → username `u660710586` / password `660710586`
