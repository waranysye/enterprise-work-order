import { PrismaClient, Priority, TaskStatus, ActionType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean up
  await prisma.activityLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const memberPassword = await bcrypt.hash("Member123!", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@gmf.id",
      name: "Admin GMF",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const budi = await prisma.user.create({
    data: {
      email: "budi@gmf.id",
      name: "Budi Santoso",
      password: memberPassword,
      role: "MEMBER",
    },
  });

  const siti = await prisma.user.create({
    data: {
      email: "siti@gmf.id",
      name: "Siti Rahayu",
      password: memberPassword,
      role: "MEMBER",
    },
  });

  const andi = await prisma.user.create({
    data: {
      email: "andi@gmf.id",
      name: "Andi Wijaya",
      password: memberPassword,
      role: "MEMBER",
    },
  });

  console.log("✅ Users created");

  // Create work orders
  const wo1 = await prisma.workOrder.create({
    data: {
      title: "Maintenance Pesawat A320 - PK-GFA",
      description:
        "Pemeriksaan rutin 6 bulanan untuk pesawat Airbus A320 registrasi PK-GFA. Meliputi pengecekan sistem hydraulic, avionik, dan struktur airframe.",
      priority: Priority.HIGH,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const wo2 = await prisma.workOrder.create({
    data: {
      title: "Overhaul Engine CFM56-5B",
      description:
        "Overhaul lengkap engine CFM56-5B nomor seri 123456. Termasuk penggantian komponen aus dan pengujian performa.",
      priority: Priority.HIGH,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  const wo3 = await prisma.workOrder.create({
    data: {
      title: "Upgrade Sistem Avionik B737",
      description:
        "Pemasangan sistem avionik generasi terbaru pada armada Boeing 737-800. Meliputi FMS, TCAS, dan ACARS.",
      priority: Priority.MEDIUM,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("✅ Work orders created");

  // Create tasks for WO1
  const task1 = await prisma.task.create({
    data: {
      title: "Inspeksi Sistem Hydraulic",
      description: "Periksa tekanan dan kebocoran pada sistem hydraulic utama dan backup.",
      status: TaskStatus.IN_PROGRESS,
      workOrderId: wo1.id,
      assigneeId: budi.id,
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.task.create({
    data: {
      title: "Cek Landing Gear",
      description: "Pemeriksaan visual dan fungsional landing gear utama dan nose gear.",
      status: TaskStatus.TODO,
      workOrderId: wo1.id,
      assigneeId: siti.id,
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: "Inspeksi Airframe",
      description: "Pemeriksaan visual struktur airframe untuk mendeteksi korosi dan keretakan.",
      status: TaskStatus.DONE,
      workOrderId: wo1.id,
      assigneeId: andi.id,
    },
  });

  // Create tasks for WO2
  await prisma.task.create({
    data: {
      title: "Disassembly Engine",
      description: "Pembongkaran engine secara sistematis sesuai AMM Chapter 72.",
      status: TaskStatus.IN_PROGRESS,
      workOrderId: wo2.id,
      assigneeId: budi.id,
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  });

  const task5 = await prisma.task.create({
    data: {
      title: "Inspeksi Turbine Blade",
      description: "Pemeriksaan detail setiap turbine blade menggunakan borescope.",
      status: TaskStatus.BLOCKED,
      workOrderId: wo2.id,
      assigneeId: siti.id,
      deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.task.create({
    data: {
      title: "Penggantian Seal & Gasket",
      description: "Ganti semua seal dan gasket sesuai parts list yang telah disetujui.",
      status: TaskStatus.TODO,
      workOrderId: wo2.id,
      assigneeId: andi.id,
    },
  });

  // Create tasks for WO3
  await prisma.task.create({
    data: {
      title: "Instalasi FMS Baru",
      description: "Pemasangan Flight Management System generasi terbaru.",
      status: TaskStatus.TODO,
      workOrderId: wo3.id,
      assigneeId: budi.id,
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    },
  });

  const task8 = await prisma.task.create({
    data: {
      title: "Konfigurasi ACARS",
      description: "Setup dan konfigurasi sistem ACARS untuk komunikasi data.",
      status: TaskStatus.TODO,
      workOrderId: wo3.id,
      assigneeId: siti.id,
    },
  });

  console.log("✅ Tasks created");

  // Create activity logs
  const logs = [
    {
      actionType: ActionType.WORK_ORDER_CREATED,
      description: `Admin GMF membuat work order 'Maintenance Pesawat A320 - PK-GFA'`,
      performedBy: admin.name,
      userId: admin.id,
      workOrderId: wo1.id,
    },
    {
      actionType: ActionType.TASK_CREATED,
      description: `Admin GMF membuat task 'Inspeksi Sistem Hydraulic' dan menugaskan ke Budi Santoso`,
      performedBy: admin.name,
      userId: admin.id,
      workOrderId: wo1.id,
      taskId: task1.id,
    },
    {
      actionType: ActionType.TASK_STATUS_CHANGED,
      description: `Budi Santoso mengubah status task 'Inspeksi Sistem Hydraulic' dari TODO ke IN_PROGRESS`,
      performedBy: budi.name,
      userId: budi.id,
      workOrderId: wo1.id,
      taskId: task1.id,
    },
    {
      actionType: ActionType.TASK_STATUS_CHANGED,
      description: `Andi Wijaya mengubah status task 'Inspeksi Airframe' dari IN_PROGRESS ke DONE`,
      performedBy: andi.name,
      userId: andi.id,
      workOrderId: wo1.id,
      taskId: task3.id,
    },
    {
      actionType: ActionType.WORK_ORDER_CREATED,
      description: `Admin GMF membuat work order 'Overhaul Engine CFM56-5B'`,
      performedBy: admin.name,
      userId: admin.id,
      workOrderId: wo2.id,
    },
    {
      actionType: ActionType.TASK_STATUS_CHANGED,
      description: `Siti Rahayu mengubah status task 'Inspeksi Turbine Blade' dari IN_PROGRESS ke BLOCKED`,
      performedBy: siti.name,
      userId: siti.id,
      workOrderId: wo2.id,
      taskId: task5.id,
    },
    {
      actionType: ActionType.WORK_ORDER_CREATED,
      description: `Admin GMF membuat work order 'Upgrade Sistem Avionik B737'`,
      performedBy: admin.name,
      userId: admin.id,
      workOrderId: wo3.id,
    },
    {
      actionType: ActionType.TASK_ASSIGNEE_CHANGED,
      description: `Admin GMF mengubah assignee task 'Konfigurasi ACARS' dari Andi Wijaya ke Siti Rahayu`,
      performedBy: admin.name,
      userId: admin.id,
      workOrderId: wo3.id,
      taskId: task8.id,
    },
  ];

  for (const log of logs) {
    await prisma.activityLog.create({ data: log });
  }

  console.log("✅ Activity logs created");
  console.log("\n🎉 Seed complete!");
  console.log("\n📋 Login credentials:");
  console.log("  Admin : admin@gmf.id / Admin123!");
  console.log("  Member: budi@gmf.id  / Member123!");
  console.log("  Member: siti@gmf.id  / Member123!");
  console.log("  Member: andi@gmf.id  / Member123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
