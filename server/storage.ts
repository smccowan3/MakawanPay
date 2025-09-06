import { type PaymentCounter, type InsertPaymentCounter, type UpdatePaymentCounter } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getPaymentCounter(userId: string): Promise<PaymentCounter | undefined>;
  createPaymentCounter(counter: InsertPaymentCounter): Promise<PaymentCounter>;
  updatePaymentCounter(userId: string, update: UpdatePaymentCounter): Promise<PaymentCounter | undefined>;
  incrementPaymentCounter(userId: string): Promise<PaymentCounter | undefined>;
  decrementPaymentCounter(userId: string): Promise<PaymentCounter | undefined>;
}

export class MemStorage implements IStorage {
  private paymentCounters: Map<string, PaymentCounter>;

  constructor() {
    this.paymentCounters = new Map();
    // Initialize with default counter
    const defaultCounter: PaymentCounter = {
      id: randomUUID(),
      userId: "default",
      count: 5
    };
    this.paymentCounters.set("default", defaultCounter);
  }

  async getPaymentCounter(userId: string): Promise<PaymentCounter | undefined> {
    return this.paymentCounters.get(userId);
  }

  async createPaymentCounter(insertCounter: InsertPaymentCounter): Promise<PaymentCounter> {
    const id = randomUUID();
    const counter: PaymentCounter = { 
      id,
      userId: insertCounter.userId || "default",
      count: insertCounter.count || 0
    };
    this.paymentCounters.set(counter.userId, counter);
    return counter;
  }

  async updatePaymentCounter(userId: string, update: UpdatePaymentCounter): Promise<PaymentCounter | undefined> {
    const existing = this.paymentCounters.get(userId);
    if (!existing) return undefined;

    const updated: PaymentCounter = { ...existing, ...update };
    this.paymentCounters.set(userId, updated);
    return updated;
  }

  async incrementPaymentCounter(userId: string): Promise<PaymentCounter | undefined> {
    const existing = this.paymentCounters.get(userId);
    if (!existing) return undefined;

    const updated: PaymentCounter = { ...existing, count: existing.count + 1 };
    this.paymentCounters.set(userId, updated);
    return updated;
  }

  async decrementPaymentCounter(userId: string): Promise<PaymentCounter | undefined> {
    const existing = this.paymentCounters.get(userId);
    if (!existing || existing.count <= 0) return undefined;

    const updated: PaymentCounter = { ...existing, count: existing.count - 1 };
    this.paymentCounters.set(userId, updated);
    return updated;
  }
}

export const storage = new MemStorage();
