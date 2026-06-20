import { z } from 'zod';

export const roles = [
  'SUPER_ADMIN',
  'ADMIN',
  'SALES',
  'WAREHOUSE',
  'DISTRIBUTION',
  'COURIER',
  'MANAGER',
  'CUSTOMER',
  'FINANCE',
  'SUPPORT',
] as const;

export type RoleCode = (typeof roles)[number];

export const loginSchema = z.object({
  email: z.email('Email tidak valid').transform((value) => value.toLowerCase()),
  password: z.string().min(8, 'Password minimal 8 karakter').max(128),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional().nullable(),
  isActive: z.boolean().default(true),
});

export const productSchema = z.object({
  sku: z
    .string()
    .trim()
    .min(3)
    .max(50)
    .regex(/^[A-Z0-9-_]+$/i),
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().max(2000).optional().nullable(),
  categoryId: z.uuid(),
  sellingPrice: z.number().int().nonnegative(),
  purchasePrice: z.number().int().nonnegative().optional().nullable(),
  minimumStock: z.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true),
});

export const customerSchema = z.object({
  code: z.string().trim().min(3).max(30),
  name: z.string().trim().min(2).max(150),
  email: z.email().optional().nullable(),
  phone: z.string().trim().min(8).max(20),
  segment: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR']).default('RETAIL'),
  creditLimit: z.number().int().nonnegative().default(0),
  address: z.string().trim().min(5).max(500),
  city: z.string().trim().min(2).max(100),
  province: z.string().trim().min(2).max(100),
});

export const warehouseSchema = z.object({
  code: z.string().trim().min(2).max(30),
  name: z.string().trim().min(2).max(150),
  address: z.string().trim().min(5).max(500),
  city: z.string().trim().min(2).max(100),
  isActive: z.boolean().default(true),
});

export const stockAdjustmentSchema = z.object({
  warehouseId: z.uuid(),
  productId: z.uuid(),
  quantity: z
    .number()
    .int()
    .refine((value) => value !== 0, 'Jumlah tidak boleh nol'),
  reason: z.string().trim().min(5).max(250),
});

export const salesOrderSchema = z.object({
  customerId: z.uuid(),
  warehouseId: z.uuid(),
  channel: z.enum(['WEB', 'SALES', 'MARKETPLACE', 'PHONE']).default('SALES'),
  discountAmount: z.number().int().nonnegative().default(0),
  taxRate: z.number().min(0).max(100).default(11),
  notes: z.string().trim().max(500).optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.uuid(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});

export const paymentSchema = z.object({
  invoiceId: z.uuid(),
  amount: z.number().int().positive(),
  method: z.enum(['BANK_TRANSFER', 'CASH', 'EWALLET']),
  reference: z.string().trim().min(3).max(100),
});

export const shipmentSchema = z.object({
  salesOrderId: z.uuid(),
  courierName: z.string().trim().min(2).max(150),
  trackingNumber: z.string().trim().min(3).max(100),
  scheduledAt: z.iso.datetime().optional().nullable(),
});

export const complaintSchema = z.object({
  salesOrderId: z.uuid(),
  subject: z.string().trim().min(5).max(200),
  message: z.string().trim().min(10).max(3000),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional(),
});

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiFailure = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
};
