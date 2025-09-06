import { sql } from "drizzle-orm";
import { pgTable, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const paymentCounters = pgTable("payment_counters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().default("default"),
  count: integer("count").notNull().default(0),
});

export const insertPaymentCounterSchema = createInsertSchema(paymentCounters).pick({
  userId: true,
  count: true,
});

export const updatePaymentCounterSchema = z.object({
  count: z.number().min(0),
});

export type InsertPaymentCounter = z.infer<typeof insertPaymentCounterSchema>;
export type PaymentCounter = typeof paymentCounters.$inferSelect;
export type UpdatePaymentCounter = z.infer<typeof updatePaymentCounterSchema>;

// Payment processing schema
export const paymentRequestSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default("JPY"),
  paymentData: z.object({
    signature: z.string(),
    intermediateSigningKey: z.object({
      signedKey: z.string(),
      signatures: z.array(z.string()),
    }),
    protocolVersion: z.string(),
    signedMessage: z.string(),
  }),
});

export type PaymentRequest = z.infer<typeof paymentRequestSchema>;
