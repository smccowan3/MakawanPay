import { useGooglePay } from "./useGooglePay";
import { useApplePay } from "./useApplePay";

interface PaymentRequest {
  amount: number;
  currency: string;
}

interface PaymentData {
  signature: string;
  intermediateSigningKey: {
    signedKey: string;
    signatures: string[];
  };
  protocolVersion: string;
  signedMessage: string;
}

type PaymentMethod = 'apple' | 'google' | 'none';

export function useUnifiedPayment() {
  const googlePay = useGooglePay();
  const applePay = useApplePay();

  // Detect which payment method to use based on platform and availability
  const getPreferredPaymentMethod = (): PaymentMethod => {
    const userAgent = navigator.userAgent;
    
    // Check for Apple devices and Apple Pay availability
    if ((userAgent.includes('iPhone') || userAgent.includes('iPad') || 
         (userAgent.includes('Mac') && userAgent.includes('Safari'))) && 
        applePay.isApplePayReady) {
      return 'apple';
    }
    
    // Check for Google Pay availability (Android, Chrome, etc.)
    if (googlePay.isGooglePayReady) {
      return 'google';
    }
    
    return 'none';
  };

  const paymentMethod = getPreferredPaymentMethod();
  
  // Determine if any payment method is ready
  const isPaymentReady = paymentMethod !== 'none';

  // Get the appropriate payment button text
  const getPaymentButtonText = (): string => {
    switch (paymentMethod) {
      case 'apple':
        return ' Pay'; // Apple Pay icon will be added separately
      case 'google':
        return 'Google Pay';
      default:
        return '支払い処理';
    }
  };

  // Get the payment method name for display
  const getPaymentMethodName = (): string => {
    switch (paymentMethod) {
      case 'apple':
        return 'Apple Pay';
      case 'google':
        return 'Google Pay';
      default:
        return 'Payment';
    }
  };

  // Process payment using the appropriate method
  const processPayment = async (request: PaymentRequest): Promise<PaymentData | null> => {
    switch (paymentMethod) {
      case 'apple':
        return await applePay.processPayment(request);
      case 'google':
        return await googlePay.processPayment(request);
      default:
        throw new Error("No payment method available");
    }
  };

  return {
    paymentMethod,
    isPaymentReady,
    getPaymentButtonText,
    getPaymentMethodName,
    processPayment,
    // Expose individual payment readiness for debugging
    isApplePayReady: applePay.isApplePayReady,
    isGooglePayReady: googlePay.isGooglePayReady,
  };
}