# Work Order Dashboard

> **Internal Work Order & Task Management System**  
> Sistem manajemen work order dan task real-time yang dirancang untuk meningkatkan produktivitas tim dengan antarmuka yang modern dan intuitif.

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-4.16-2D3748?style=flat-square&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=flat-square&logo=postgresql)
![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?style=flat-square&logo=socket.io)

---

## 🎯 Fitur Utama

### 🔐 **Role-Based Access Control**
- **Admin**: Akses penuh untuk mengelola work orders, tasks, users, dan melihat activity logs
- **Member**: Akses terbatas untuk melihat dan mengupdate task yang ditugaskan

### 📊 **Dashboard Real-time**
- Statistik work order dan task yang update secara real-time
- Visualisasi progress dengan progress bars dan stat cards
- Activity log untuk audit trail (Admin only)
- Notifikasi untuk overdue tasks

### 📋 **Work Order Management**
- CRUD operations untuk work orders
- Priority levels (Low, Medium, High)
- Deadline tracking dengan visual indicators
- Task count per work order

### ✅ **Task Management**
- Kanban board dengan drag & drop functionality
- 4 status columns: To Do, In Progress, Done, Blocked
- Real-time synchronization antar users
- Filter by work order dan assignee
- Deadline tracking dengan overdue indicators

### 🔄 **Real-time Updates**
- Socket.io integration untuk live updates
- Connection status indicator
- Automatic UI refresh saat ada perubahan
- Multi-user collaboration support

### 👥 **User Management** (Admin Only)
- Activate/deactivate user accounts
- Role assignment (Admin/Member)
- User activity tracking

### 📝 **Activity Logging** (Admin Only)
- Comprehensive audit trail
- Grouped by date untuk easy navigation
- Action type categorization dengan visual icons

---

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 16.2** - React framework dengan App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **@dnd-kit** - Modern drag and drop toolkit
- **Socket.io Client** - Real-time communication
- **date-fns** - Date manipulation library
- **Sonner** - Toast notifications

### **Backend**
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Type-safe database client
- **PostgreSQL** - Relational database
- **Socket.io Server** - WebSocket server
- **Jose** - JWT authentication
- **bcryptjs** - Password hashing
- **Zod** - Schema validation

---

## 📁 Project Structure

```
work-order-dashboard/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Database seeding
│   └── migrations/            # Database migrations
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/              # API routes
│   │   ├── dashboard/        # Dashboard page
│   │   ├── board/            # Kanban board
│   │   ├── work-orders/      # Work order pages
│   │   ├── tasks/            # Task pages
│   │   ├── users/            # User management
│   │   ├── activity-log/     # Activity log
│   │   └── login/            # Login page
│   ├── components/           # React components
│   │   ├── board/           # Kanban components
│   │   ├── shared/          # Shared components
│   │   ├── task/            # Task components
│   │   └── work-order/      # Work order components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility libraries
│   ├── providers/           # React context providers
│   ├── services/            # Business logic layer
│   └── types/               # TypeScript type definitions
├── public/                  # Static assets
└── server.mjs              # Custom server dengan Socket.io
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.x atau lebih tinggi
- **PostgreSQL** 14.x atau lebih tinggi
- **npm** atau **yarn**

### Installation

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd work-order-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   
   Buat file `.env` di root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/work_order_db"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   ```

4. **Setup database**
   ```bash
   # Generate Prisma Client
   npm run db:generate
   
   # Run migrations
   npm run db:migrate
   
   # Seed database dengan data awal
   npm run db:seed
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Default Credentials

Setelah seeding, gunakan credentials berikut untuk login:

**Admin Account:**
- Email: `admin@gmf.id`
- Password: `Admin123!`

**Member Account:**
- Email: `member@gmf.id`
- Password: `Member123!`

---

## 📜 Available Scripts

```bash
# Development
npm run dev              # Start development server dengan Socket.io

# Build
npm run build            # Build production bundle
npm start                # Start production server

# Database
npm run db:generate      # Generate Prisma Client
npm run db:migrate       # Run database migrations
npm run db:push          # Push schema changes tanpa migration
npm run db:seed          # Seed database dengan data awal
npm run db:studio        # Open Prisma Studio (database GUI)

# Code Quality
npm run lint             # Run ESLint
```

---

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6)
- **Success**: Emerald (#10B981)
- **Warning**: Amber (#F59E0B)
- **Danger**: Rose (#F43F5E)
- **Neutral**: Slate (#64748B)

### Typography
- **Font Family**: Inter, system-ui
- **Heading**: Semibold, tracking-tight
- **Body**: Regular, leading-6

### Components
- **Rounded corners**: 2rem (32px) untuk cards utama
- **Shadows**: Soft shadows dengan slate-900/5
- **Transitions**: Smooth transitions (150-300ms)
- **Spacing**: Consistent 4px grid system

---

## 🔒 Security Features

- **JWT Authentication** dengan secure HTTP-only cookies
- **Password Hashing** menggunakan bcryptjs
- **Role-Based Authorization** di API routes
- **Input Validation** dengan Zod schemas
- **SQL Injection Protection** via Prisma ORM
- **XSS Protection** via React's built-in escaping

---

## 📊 Database Schema

### Models

**User**
- Authentication & authorization
- Role-based access (ADMIN/MEMBER)
- Account status (active/inactive)

**WorkOrder**
- Title, description, priority
- Deadline tracking
- Task relationship

**Task**
- Title, description, status
- Assignee relationship
- Work order relationship
- Deadline tracking

**ActivityLog**
- Audit trail untuk semua actions
- User, work order, dan task references
- Timestamp tracking

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Work Orders
- `GET /api/work-orders` - List work orders
- `POST /api/work-orders` - Create work order (Admin)
- `GET /api/work-orders/[id]` - Get work order detail
- `PATCH /api/work-orders/[id]` - Update work order (Admin)
- `DELETE /api/work-orders/[id]` - Delete work order (Admin)

### Tasks
- `POST /api/work-orders/[id]/tasks` - Create task (Admin)
- `PATCH /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task (Admin)

### Users
- `GET /api/users` - List users (Admin)
- `POST /api/users` - Create user (Admin)
- `PATCH /api/users/[id]` - Update user (Admin)
- `GET /api/users/members` - List active members

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Activity Log
- `GET /api/activity-logs` - Get activity logs (Admin)

### Board
- `GET /api/board` - Get kanban board data

---

## 🔄 Real-time Events

### Socket.io Events

**Task Events:**
- `task:created` - New task created
- `task:updated` - Task updated
- `task:deleted` - Task deleted

**Work Order Events:**
- `workorder:created` - New work order created
- `workorder:updated` - Work order updated
- `workorder:deleted` - Work order deleted

---

## 🎯 Best Practices Implemented

### Code Quality
- ✅ TypeScript untuk type safety
- ✅ ESLint untuk code linting
- ✅ Consistent code formatting
- ✅ Component composition pattern
- ✅ Custom hooks untuk reusable logic

### Performance
- ✅ Server-side rendering (SSR)
- ✅ Optimistic UI updates
- ✅ Efficient re-rendering dengan React hooks
- ✅ Database query optimization dengan Prisma
- ✅ Connection pooling

### Security
- ✅ Environment variables untuk secrets
- ✅ Secure authentication flow
- ✅ Authorization checks di setiap endpoint
- ✅ Input validation dan sanitization
- ✅ SQL injection protection

### UX/UI
- ✅ Responsive design (mobile-first)
- ✅ Loading states dan error handling
- ✅ Toast notifications untuk feedback
- ✅ Smooth animations dan transitions
- ✅ Accessibility considerations

---

## 📝 Future Enhancements

- [ ] Email notifications untuk deadline reminders
- [ ] File attachments untuk work orders dan tasks
- [ ] Comments/discussion threads per task
- [ ] Advanced filtering dan search
- [ ] Export data ke Excel/PDF
- [ ] Mobile app (React Native)
- [ ] Task templates
- [ ] Time tracking per task
- [ ] Gantt chart view
- [ ] Custom fields untuk work orders

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Your Name**  
Portfolio Project - Internal Work Order Dashboard

---

## 🙏 Acknowledgments

- Next.js team untuk amazing framework
- Prisma team untuk excellent ORM
- Tailwind CSS untuk utility-first CSS
- Socket.io untuk real-time capabilities
- Vercel untuk deployment platform

---

**Built with ❤️ using Next.js, TypeScript, and PostgreSQL**
