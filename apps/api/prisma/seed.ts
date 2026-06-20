import { PrismaClient } from '@prisma/client';
import { hash } from 'argon2';

const prisma = new PrismaClient();

const roleDefinitions: Record<string, string[]> = {
  SUPER_ADMIN: ['*'],
  ADMIN: [
    'users.manage',
    'catalog.manage',
    'customers.manage',
    'inventory.manage',
    'orders.manage',
    'payments.verify',
    'shipments.manage',
    'support.manage',
    'reports.read',
  ],
  SALES: ['catalog.read', 'customers.manage', 'orders.manage', 'payments.create'],
  WAREHOUSE: ['catalog.read', 'inventory.manage', 'orders.read'],
  DISTRIBUTION: ['orders.read', 'shipments.manage'],
  COURIER: ['shipments.update'],
  MANAGER: ['reports.read', 'catalog.read', 'inventory.read', 'orders.read'],
  CUSTOMER: ['orders.own', 'shipments.own', 'support.own'],
  FINANCE: ['payments.verify', 'payments.refund', 'reports.read'],
  SUPPORT: ['customers.read', 'orders.read', 'support.manage'],
};

async function main() {
  for (const code of new Set(Object.values(roleDefinitions).flat())) {
    await prisma.permission.upsert({
      where: { code },
      update: {},
      create: { code, description: `Permission ${code}` },
    });
  }

  for (const [code, permissionCodes] of Object.entries(roleDefinitions)) {
    const role = await prisma.role.upsert({
      where: { code },
      update: { name: code.replaceAll('_', ' ') },
      create: { code, name: code.replaceAll('_', ' ') },
    });
    const permissions = await prisma.permission.findMany({
      where: { code: { in: permissionCodes } },
    });
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.rolePermission.createMany({
      data: permissions.map((permission) => ({ roleId: role.id, permissionId: permission.id })),
      skipDuplicates: true,
    });
  }

  const adminRole = await prisma.role.findUniqueOrThrow({ where: { code: 'SUPER_ADMIN' } });
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@smpd.local';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!';
  const admin = await prisma.user.upsert({
    where: { email },
    update: { name: 'Super Admin', status: 'ACTIVE' },
    create: {
      email,
      name: 'Super Admin',
      passwordHash: await hash(password),
    },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
    update: {},
    create: { userId: admin.id, roleId: adminRole.id },
  });

  const category = await prisma.category.upsert({
    where: { name: 'Minuman' },
    update: {},
    create: { name: 'Minuman', description: 'Produk minuman siap distribusi' },
  });
  const warehouse = await prisma.warehouse.upsert({
    where: { code: 'WH-JKT-01' },
    update: {},
    create: {
      code: 'WH-JKT-01',
      name: 'Gudang Utama Jakarta',
      address: 'Jl. Distribusi No. 1',
      city: 'Jakarta',
    },
  });
  const product = await prisma.product.upsert({
    where: { sku: 'MNM-001' },
    update: {},
    create: {
      sku: 'MNM-001',
      name: 'Air Mineral 600ml',
      categoryId: category.id,
      sellingPrice: 5_000,
      purchasePrice: 3_000,
      minimumStock: 20,
      prices: { create: { price: 5_000, changedBy: admin.id } },
    },
  });
  await prisma.inventoryBalance.upsert({
    where: { warehouseId_productId: { warehouseId: warehouse.id, productId: product.id } },
    update: {},
    create: { warehouseId: warehouse.id, productId: product.id, quantity: 100 },
  });
  await prisma.customer.upsert({
    where: { code: 'CUST-001' },
    update: {},
    create: {
      code: 'CUST-001',
      name: 'Toko Sejahtera',
      email: 'owner@tokosejahtera.test',
      phone: '081234567890',
      segment: 'RETAIL',
      creditLimit: 5_000_000,
      addresses: {
        create: {
          label: 'Toko',
          address: 'Jl. Niaga No. 10',
          city: 'Jakarta',
          province: 'DKI Jakarta',
        },
      },
    },
  });

  console.log(`Seed selesai. Login demo: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
