# Work Order Dashboard 🚀

A modern, enterprise-grade Work Order & Task Management system built to handle real-time collaboration. This project demonstrates full-stack capabilities, premium UI/UX, and robust architecture.

![Dashboard Preview](https://via.placeholder.com/1200x600/0f172a/ffffff?text=Work+Order+Dashboard+Screenshot)

## 🌟 Features

- **Real-time Updates**: Powered by Socket.io for live Kanban board updates and activity logs.
- **Premium UI/UX**: Glassmorphism design system, smooth micro-animations, and dynamic gradient backgrounds.
- **Role-based Access Control**: Distinct ADMIN and MEMBER views with granular permissions.
- **Drag & Drop Kanban**: Intuitive task management using `@dnd-kit`.
- **Responsive Layout**: Seamlessly works across desktop and mobile devices.
- **Activity Tracking**: Comprehensive audit logging for all system events.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Database**: PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Real-time**: [Socket.io](https://socket.io/)
- **State/Drag**: React Dnd-kit
- **Authentication**: JWT & bcryptjs

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or newer)
- PostgreSQL running locally or remotely

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/work-order-dashboard.git
   cd work-order-dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Copy `.env.example` to `.env` and fill in your database credentials:
   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/work_order_db"
   JWT_SECRET="your-super-secret-key"
   ```

4. **Database Migration & Seeding:**
   ```bash
   npm run db:push
   npm run db:seed
   ```
   *The seed script creates default ADMIN and MEMBER accounts.*

5. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser.

## 📸 Demonstration

- **Admin Login:** `admin@gmf.com` / `password123`
- **Member Login:** `member@gmf.com` / `password123`
- Open two browsers (one Admin, one Member) to test the real-time websocket features seamlessly updating the task board.

---
*Built with ❤️ for a Google Internship Portfolio.*
