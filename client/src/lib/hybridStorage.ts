// Hybrid storage service that tries server first, falls back to localStorage

import { localStorageService } from './localStorage';
import { apiRequest } from './queryClient';

interface HybridStorageService {
  getPaymentCount(): Promise<number>;
  setPaymentCount(count: number): Promise<void>;
  incrementPaymentCount(): Promise<number>;
  decrementPaymentCount(): Promise<number>;
  getAudioSettings(): Promise<{ addPaymentAudioUrl?: string; paymentSuccessAudioUrl?: string; }>;
  setAddPaymentAudio(audioUrl: string): Promise<void>;
  setPaymentSuccessAudio(audioUrl: string): Promise<void>;
}

class HybridStorage implements HybridStorageService {
  private serverAvailable: boolean | null = null;
  private lastServerCheck: number = 0;
  private readonly SERVER_CHECK_INTERVAL = 30000; // 30 seconds

  private async checkServerAvailability(): Promise<boolean> {
    const now = Date.now();
    
    // Use cached result if recent
    if (this.serverAvailable !== null && (now - this.lastServerCheck) < this.SERVER_CHECK_INTERVAL) {
      return this.serverAvailable;
    }

    try {
      const response = await fetch('/api/payment-counter/default', {
        method: 'GET',
        credentials: 'include',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      
      this.serverAvailable = response.ok;
      this.lastServerCheck = now;
      return this.serverAvailable;
    } catch (error) {
      console.log('Server unavailable, using localStorage:', error);
      this.serverAvailable = false;
      this.lastServerCheck = now;
      return false;
    }
  }

  async getPaymentCount(): Promise<number> {
    const isServerAvailable = await this.checkServerAvailability();
    
    if (isServerAvailable) {
      try {
        const response = await apiRequest('GET', '/api/payment-counter/default');
        const data = await response.json();
        
        // Sync with localStorage for offline fallback
        localStorageService.setPaymentCount(data.count);
        return data.count;
      } catch (error) {
        console.log('Server request failed, using localStorage:', error);
        this.serverAvailable = false;
      }
    }
    
    // Fallback to localStorage
    return localStorageService.getPaymentCount();
  }

  async setPaymentCount(count: number): Promise<void> {
    const isServerAvailable = await this.checkServerAvailability();
    
    if (isServerAvailable) {
      try {
        await apiRequest('PATCH', '/api/payment-counter/default', { count });
        
        // Also update localStorage for consistency
        localStorageService.setPaymentCount(count);
        return;
      } catch (error) {
        console.log('Server update failed, using localStorage:', error);
        this.serverAvailable = false;
      }
    }
    
    // Fallback to localStorage
    localStorageService.setPaymentCount(count);
  }

  async incrementPaymentCount(): Promise<number> {
    const isServerAvailable = await this.checkServerAvailability();
    
    if (isServerAvailable) {
      try {
        const response = await apiRequest('POST', '/api/payment-counter/default/add');
        const data = await response.json();
        
        // Sync with localStorage
        localStorageService.setPaymentCount(data.count);
        return data.count;
      } catch (error) {
        console.log('Server increment failed, using localStorage:', error);
        this.serverAvailable = false;
      }
    }
    
    // Fallback to localStorage
    return localStorageService.incrementPaymentCount();
  }

  async decrementPaymentCount(): Promise<number> {
    const currentCount = await this.getPaymentCount();
    if (currentCount <= 0) return currentCount;

    const isServerAvailable = await this.checkServerAvailability();
    
    if (isServerAvailable) {
      try {
        // For decrement, we simulate the payment through the pay endpoint
        const mockPaymentData = {
          signature: 'local_signature_' + Date.now(),
          intermediateSigningKey: {
            signedKey: 'local_signed_key',
            signatures: ['local_sig_1', 'local_sig_2'],
          },
          protocolVersion: 'ECv2',
          signedMessage: 'local_signed_message_' + Date.now(),
        };

        const response = await apiRequest('POST', '/api/payment-counter/default/pay', {
          amount: 100,
          currency: 'JPY',
          paymentData: mockPaymentData,
        });
        const data = await response.json();
        
        // Sync with localStorage
        localStorageService.setPaymentCount(data.counter.count);
        return data.counter.count;
      } catch (error) {
        console.log('Server decrement failed, using localStorage:', error);
        this.serverAvailable = false;
      }
    }
    
    // Fallback to localStorage
    return localStorageService.decrementPaymentCount();
  }

  async getAudioSettings(): Promise<{ addPaymentAudioUrl?: string; paymentSuccessAudioUrl?: string; }> {
    // Audio settings are always stored locally since they're user-specific
    return localStorageService.getAudioSettings();
  }

  async setAddPaymentAudio(audioUrl: string): Promise<void> {
    localStorageService.setAddPaymentAudio(audioUrl);
  }

  async setPaymentSuccessAudio(audioUrl: string): Promise<void> {
    localStorageService.setPaymentSuccessAudio(audioUrl);
  }

  // Method to check current server status (for UI indicators)
  async isServerOnline(): Promise<boolean> {
    return await this.checkServerAvailability();
  }

  // Method to force sync localStorage data to server when it comes back online
  async syncToServer(): Promise<boolean> {
    const isServerAvailable = await this.checkServerAvailability();
    if (!isServerAvailable) return false;

    try {
      const localCount = localStorageService.getPaymentCount();
      await apiRequest('PATCH', '/api/payment-counter/default', { count: localCount });
      return true;
    } catch (error) {
      console.log('Failed to sync to server:', error);
      return false;
    }
  }
}

export const hybridStorageService = new HybridStorage();