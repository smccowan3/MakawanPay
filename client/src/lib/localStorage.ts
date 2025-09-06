// Local storage utilities for マカワンペイ

interface PaymentData {
  count: number;
  lastUpdated: string;
}

interface AudioSettings {
  addPaymentAudioUrl?: string;
  paymentSuccessAudioUrl?: string;
}

const PAYMENT_DATA_KEY = 'makawan-pay-counter';
const AUDIO_SETTINGS_KEY = 'makawan-pay-audio';

// Default values
const DEFAULT_COUNT = 5;
const DEFAULT_ADD_PAYMENT_AUDIO = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvGIcAz2N2e/eYyAAPU0cXILH7dmYOggaXLLl76dTFApIo9/v2XwwBSB9yO/ddygFK3nF796OPAkUY7Pm46tXUwo=";
const DEFAULT_PAYMENT_SUCCESS_AUDIO = "data:audio/wav;base64,UklGRhQEAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YfADAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvGIcAz2N2e/ecSOBXwMAXYTF9N6OOQgQb7Dn46pYNAk=";

export const localStorageService = {
  // Payment counter methods
  getPaymentCount(): number {
    try {
      const data = localStorage.getItem(PAYMENT_DATA_KEY);
      if (data) {
        const parsed: PaymentData = JSON.parse(data);
        return parsed.count;
      }
    } catch (error) {
      console.warn('Failed to load payment count from localStorage:', error);
    }
    return DEFAULT_COUNT;
  },

  setPaymentCount(count: number): void {
    try {
      const data: PaymentData = {
        count,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(PAYMENT_DATA_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save payment count to localStorage:', error);
    }
  },

  incrementPaymentCount(): number {
    const currentCount = this.getPaymentCount();
    const newCount = currentCount + 1;
    this.setPaymentCount(newCount);
    return newCount;
  },

  decrementPaymentCount(): number {
    const currentCount = this.getPaymentCount();
    if (currentCount <= 0) return currentCount;
    const newCount = currentCount - 1;
    this.setPaymentCount(newCount);
    return newCount;
  },

  // Audio settings methods
  getAudioSettings(): AudioSettings {
    try {
      const data = localStorage.getItem(AUDIO_SETTINGS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn('Failed to load audio settings from localStorage:', error);
    }
    return {
      addPaymentAudioUrl: DEFAULT_ADD_PAYMENT_AUDIO,
      paymentSuccessAudioUrl: DEFAULT_PAYMENT_SUCCESS_AUDIO,
    };
  },

  setAudioSettings(settings: AudioSettings): void {
    try {
      localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save audio settings to localStorage:', error);
    }
  },

  setAddPaymentAudio(audioUrl: string): void {
    const current = this.getAudioSettings();
    this.setAudioSettings({
      ...current,
      addPaymentAudioUrl: audioUrl,
    });
  },

  setPaymentSuccessAudio(audioUrl: string): void {
    const current = this.getAudioSettings();
    this.setAudioSettings({
      ...current,
      paymentSuccessAudioUrl: audioUrl,
    });
  },

  // Reset methods
  resetAll(): void {
    try {
      localStorage.removeItem(PAYMENT_DATA_KEY);
      localStorage.removeItem(AUDIO_SETTINGS_KEY);
    } catch (error) {
      console.warn('Failed to reset localStorage:', error);
    }
  },
};