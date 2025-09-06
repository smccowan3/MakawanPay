import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { updatePaymentCounterSchema, paymentRequestSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get payment counter
  app.get("/api/payment-counter/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const counter = await storage.getPaymentCounter(userId);
      
      if (!counter) {
        return res.status(404).json({ message: "Payment counter not found" });
      }
      
      res.json(counter);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payment counter" });
    }
  });

  // Add payment (increment counter)
  app.post("/api/payment-counter/:userId/add", async (req, res) => {
    try {
      const { userId } = req.params;
      const updatedCounter = await storage.incrementPaymentCounter(userId);
      
      if (!updatedCounter) {
        return res.status(404).json({ message: "Payment counter not found" });
      }
      
      res.json(updatedCounter);
    } catch (error) {
      res.status(500).json({ message: "Failed to add payment" });
    }
  });

  // Process payment (decrement counter)
  app.post("/api/payment-counter/:userId/pay", async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Validate payment data
      const validatedPayment = paymentRequestSchema.parse(req.body);
      
      // Get current counter
      const currentCounter = await storage.getPaymentCounter(userId);
      if (!currentCounter || currentCounter.count <= 0) {
        return res.status(400).json({ message: "No payments remaining" });
      }

      // TODO: Process payment with Google Pay API
      // This would integrate with Google Pay's backend APIs
      // For now, we'll simulate a successful payment
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Decrement counter on successful payment
      const updatedCounter = await storage.decrementPaymentCounter(userId);
      
      if (!updatedCounter) {
        return res.status(500).json({ message: "Failed to process payment" });
      }
      
      res.json({ 
        success: true,
        counter: updatedCounter,
        paymentId: `pay_${Date.now()}`,
        message: "Payment processed successfully"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid payment data", errors: error.errors });
      }
      res.status(500).json({ message: "Payment processing failed" });
    }
  });

  // Update payment counter manually
  app.patch("/api/payment-counter/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const validatedUpdate = updatePaymentCounterSchema.parse(req.body);
      
      const updatedCounter = await storage.updatePaymentCounter(userId, validatedUpdate);
      
      if (!updatedCounter) {
        return res.status(404).json({ message: "Payment counter not found" });
      }
      
      res.json(updatedCounter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid update data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update payment counter" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
