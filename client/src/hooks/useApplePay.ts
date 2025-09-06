import { useState, useEffect } from "react";

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

export function useApplePay() {
  const [isApplePayReady, setIsApplePayReady] = useState(false);

  useEffect(() => {
    // Check if Apple Pay is available
    if (typeof window !== "undefined" && window.ApplePaySession) {
      try {
        // Check if Apple Pay is available and can make payments
        if (window.ApplePaySession.canMakePayments()) {
          // Check if user has cards set up (optional - this requires user permission)
          setIsApplePayReady(true);
          console.log("Apple Pay is available");
        } else {
          console.log("Apple Pay is not available");
        }
      } catch (error) {
        console.error("Apple Pay initialization failed:", error);
      }
    } else {
      // For development/testing without Apple Pay
      if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad') || navigator.userAgent.includes('Mac')) {
        console.log("Apple Pay SDK not available, using mock implementation for Apple device");
        setIsApplePayReady(true);
      }
    }
  }, []);

  const processPayment = async (request: PaymentRequest): Promise<PaymentData | null> => {
    if (typeof window !== "undefined" && window.ApplePaySession && isApplePayReady) {
      try {
        // Apple Pay payment request
        const paymentRequest = {
          countryCode: 'JP',
          currencyCode: request.currency,
          supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
          merchantCapabilities: ['supports3DS'],
          total: {
            label: 'マカワンペイ',
            amount: (request.amount / 100).toFixed(2), // Convert to decimal format
          },
        };

        return new Promise((resolve, reject) => {
          // Create Apple Pay session
          const session = new window.ApplePaySession(3, paymentRequest);

          session.onvalidatemerchant = (event: any) => {
            // In production, you would validate with your server
            // For now, we'll simulate validation
            console.log("Apple Pay merchant validation requested");
            
            // Mock merchant session (in production, this comes from your server)
            const mockMerchantSession = {
              epochTimestamp: Date.now(),
              expiresAt: Date.now() + (1000 * 60 * 5), // 5 minutes
              merchantSessionIdentifier: 'mock_session_' + Date.now(),
              nonce: 'mock_nonce_' + Math.random(),
              merchantIdentifier: 'merchant.com.makawan.pay',
              domainName: window.location.hostname,
              displayName: 'マカワンペイ',
              signature: 'mock_signature',
            };

            try {
              session.completeMerchantValidation(mockMerchantSession);
            } catch (error) {
              console.log("Using mock validation for development");
              // For development, continue without proper validation
            }
          };

          session.onpaymentmethodselected = (event: any) => {
            // Update payment with selected method
            const update = {
              newTotal: paymentRequest.total,
              newLineItems: [],
            };
            session.completePaymentMethodSelection(update);
          };

          session.onpaymentauthorized = (event: any) => {
            // Process the payment
            const payment = event.payment;
            
            // Extract payment data (simplified for demo)
            const paymentData: PaymentData = {
              signature: 'apple_pay_signature_' + Date.now(),
              intermediateSigningKey: {
                signedKey: 'apple_pay_signed_key',
                signatures: ['apple_sig_1', 'apple_sig_2'],
              },
              protocolVersion: 'ECv1',
              signedMessage: JSON.stringify(payment.token),
            };

            // Complete the payment
            session.completePayment(window.ApplePaySession.STATUS_SUCCESS);
            resolve(paymentData);
          };

          session.oncancel = () => {
            reject(new Error("Apple Pay was cancelled"));
          };

          // Start the Apple Pay session
          session.begin();
        });

      } catch (error) {
        console.error("Apple Pay payment failed:", error);
        throw new Error("Apple Pay payment was cancelled or failed");
      }
    } else {
      // Mock payment data for development/testing on Apple devices
      if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad') || navigator.userAgent.includes('Mac')) {
        console.log("Processing mock Apple Pay payment:", request);
        
        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        return {
          signature: "apple_mock_signature_" + Date.now(),
          intermediateSigningKey: {
            signedKey: "apple_mock_signed_key",
            signatures: ["apple_mock_sig_1", "apple_mock_sig_2"],
          },
          protocolVersion: "ECv1",
          signedMessage: "apple_mock_signed_message_" + Date.now(),
        };
      }
      
      return null;
    }
  };

  return {
    isApplePayReady,
    processPayment,
  };
}

// Extend Window interface for Apple Pay
declare global {
  interface Window {
    ApplePaySession?: any;
  }
}