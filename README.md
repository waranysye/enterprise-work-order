# Enterprise Work Order Dashboard

> **Internal Work Order & Task Management System**  
> Sistem manajemen work order dan task real-time yang dirancang untuk meningkatkan produktivitas tim dengan antarmuka yang modern dan intuitif.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-4.16-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?style=flat-square&logo=socket.io)](https://socket.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Deployed on Railway](https://img.shields.io/badge/Deployed%20on-Railway-7B2FBE?style=flat-square&logo=railway)](https://railway.app)

---

## 🌐 Live Demo

**URL:** [https://enterprise-work-order-production.up.railway.app](https://enterprise-work-order-production.up.railway.app)

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Administrator** | `admin@gmf.id` | `Admin123!` |
| **Member** | `budi@gmf.id` | `Member123!` |

> Login page menggunakan simulasi SSO — cukup pilih role yang ingin dicoba.

---

## ✨ Fitur Utama

### 🔐 Role-Based Access Control
- **Admin** — akses penuh: kelola work orders, tasks, users, dan activity logs
- **Member** — akses terbatas: lihat dan update task yang ditugaskan

### 📊 Dashboard Real-time
- Statistik work order dan task yang update secara live via Socket.io
- Progress bars distribusi task per status
- Activity log untuk audit trail (Admin only)
- Indikator overdue tasks dengan highlight visual

### 📋 Work Order Management
- CRUD operations lengkap (Admin)
- Priority levels: Low, Medium, High
- Deadline tracking dengan indikator visual
- Search dan filter berdasarkan prioritas

### 🗂️ Kanban Board
- Drag & drop antar kolom status (To Do → In Progress → Done → Blocked)
- Real-time sync antar user via Socket.io
- Filter by work order dan assignee
- Permission: Member hanya bisa drag task miliknya sendiri

### 🔄 Real-time Collaboration
- Socket.io WebSocket untuk live updates
- Optimistic UI updates dengan rollback otomatis jika gagal
- Connection status indicator
- Toast notifications untuk setiap perubahan

### 👥 User Management (Admin Only)
- Activate / deactivate user accounts
- Role management (Admin / Member)

### 📝 Activity Log (Admin Only)
- Audit trail lengkap semua aksi sistem
- Dikelompokkan per tanggal
- Kategorisasi action type dengan icon visual

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16.2 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **Database** | PostgreSQL |
| **ORM** | Prisma 4 |
| **Real-time** | Socket.io 4.8 |
| **Auth** | JWT via Jose + HTTP-only cookies |
| **Drag & Drop** | @dnd-kit |
| **Validation** | Zod |
| **Notifications** | Sonner |
| **Date** | date-fns |
| **Deployment** | Railway |

---

## 📁 Project Structure

```
work-order-dashboard/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Database seeding
│   └── migrations/            # Database migrations
├── src/
│   ├── app/
│   │   ├── api/               # API routes (auth, work-orders, tasks, users, board)
│   │   ├── dashboard/         # Dashboard page
│   │   ├── board/             # Kanban board
│   │   ├── work-orders/       # Work order list & detail
│   │   ├── tasks/             # Task detail & edit
│   │   ├── users/             # User management
│   │   ├── activity-log/      # Activity log
│   │   └── login/             # Login page
│   ├── components/
│   │   ├── board/             # KanbanBoard, KanbanColumn, TaskCard
│   │   ├── shared/            # AppShell, Sidebar, ConnectionStatus
│   │   ├── task/              # TaskForm
│   │   └── work-order/        # WorkOrderForm, TaskCreateForm
│   ├── hooks/                 # useSocket custom hook
│   ├── lib/                   # session, prisma, api-helpers, validations
│   ├── providers/             # SocketProvider
│   ├── services/              # userService, workOrderService, taskService
│   └── types/                 # TypeScript type definitions
└── server.mjs                 # Custom Node.js server + Socket.io
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 20.9.0
- **PostgreSQL** 14+
- **npm**

### Installation

1. **Clone repository**
   ```bash
   git clone https://github.com/waranysye/enterprise-work-order.git
   cd enterprise-work-order
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**

   Buat file `.env` berdasarkan `.env.example`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/workorder_db"
   SESSION_SECRET="your-secret-key-minimum-32-characters-long"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   NODE_ENV="development"
   ```

4. **Setup database**
   ```bash
   npm run db:generate   # Generate Prisma Client
   npm run db:migrate    # Run migrations
   npm run db:seed       # Seed data awal
   ```

5. **Jalankan development server**
   ```bash
   npm run dev
   ```

6. Buka [http://localhost:3000](http://localhost:3000)

### Default Credentials (setelah seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@gmf.id` | `Admin123!` |
| Member | `budi@gmf.id` | `Member123!` |
| Member | `siti@gmf.id` | `Member123!` |
| Member | `andi@gmf.id` | `Member123!` |

---

## 📜 Available Scripts

```bash
npm run dev           # Development server (Next.js + Socket.io)
npm run build         # Production build
npm start             # Production server

npm run db:generate   # Generate Prisma Client
npm run db:migrate    # Run migrations (dev)
npm run db:push       # Push schema tanpa migration
npm run db:seed       # Seed database
npm run db:studio     # Buka Prisma Studio

npm run lint          # ESLint
```

---

## 🔒 Security

- JWT authentication dengan HTTP-only cookies (tidak accessible via JavaScript)
- Password hashing dengan bcryptjs (salt rounds: 10)
- Role-based authorization di setiap API route
- Input validation dengan Zod di semua endpoint
- SQL injection protection via Prisma ORM
- CSRF protection via SameSite cookie policy

---

## 🌐 API Endpoints

### Auth
```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### Work Orders
```
GET    /api/work-orders
POST   /api/work-orders          (Admin)
GET    /api/work-orders/:id
PATCH  /api/work-orders/:id      (Admin)
DELETE /api/work-orders/:id      (Admin)
POST   /api/work-orders/:id/tasks (Admin)
```

### Tasks
```
PATCH  /api/tasks/:id
DELETE /api/tasks/:id            (Admin)
```

### Users
```
GET    /api/users                (Admin)
POST   /api/users                (Admin)
PATCH  /api/users/:id            (Admin)
GET    /api/users/members
```

### Other
```
GET    /api/dashboard/stats
GET    /api/activity-logs        (Admin)
GET    /api/board
```

---

## 🔄 Socket.io Events

```
task:created      → Board & dashboard update otomatis
task:updated      → Status/assignee change sync real-time
task:deleted      → Task removal sync real-time
```

---

## 📄 License

MIT License — bebas digunakan untuk keperluan pembelajaran dan portofolio.

---

## 👨‍💻 Author

Dibuat sebagai portofolio project — Enterprise Work Order Dashboard  
Deployed di [Railway](https://railway.app) · Source di [GitHub](https://github.com/waranysye/enterprise-work-order)
