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

export function useGooglePay() {
  const [isGooglePayReady, setIsGooglePayReady] = useState(false);

  useEffect(() => {
    const checkGooglePay = () => {
      // Check if Google Pay is available
      if (typeof window !== "undefined" && window.google?.payments?.api) {
        const paymentsClient = new window.google.payments.api.PaymentsClient({
          environment: process.env.NODE_ENV === "production" ? "PRODUCTION" : "TEST",
        });

        const readinessRequest = {
          apiVersion: 2,
          apiVersionMinor: 0,
          allowedPaymentMethods: [
            {
              type: "CARD",
              parameters: {
                allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
                allowedCardNetworks: ["MASTERCARD", "VISA"],
              },
            },
          ],
        };

        paymentsClient
          .isReadyToPay(readinessRequest)
          .then((response: any) => {
            if (response.result) {
              setIsGooglePayReady(true);
              console.log("Google Pay is ready");
            } else {
              console.log("Google Pay is not ready");
            }
          })
          .catch((err: any) => {
            console.error("Google Pay readiness check failed:", err);
          });
      } else if (window.googlePayReady) {
        // Retry when Google Pay script is loaded
        setTimeout(checkGooglePay, 100);
      } else {
        // For development/testing without Google Pay SDK
        console.log("Google Pay SDK not available, using mock implementation");
        setIsGooglePayReady(true);
      }
    };

    // Initial check
    checkGooglePay();
    
    // Also check when Google Pay script loads
    const interval = setInterval(() => {
      if (window.google?.payments?.api && !isGooglePayReady) {
        checkGooglePay();
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isGooglePayReady]);

  const processPayment = async (request: PaymentRequest): Promise<PaymentData | null> => {
    if (typeof window !== "undefined" && window.google?.payments?.api && isGooglePayReady) {
      try {
        console.log("Starting Google Pay payment flow");
        
        const paymentsClient = new window.google.payments.api.PaymentsClient({
          environment: "TEST", // Always use TEST for development
        });

        const paymentDataRequest = {
          apiVersion: 2,
          apiVersionMinor: 0,
          allowedPaymentMethods: [
            {
              type: "CARD",
              parameters: {
                allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
                allowedCardNetworks: ["MASTERCARD", "VISA"],
              },
              tokenizationSpecification: {
                type: "PAYMENT_GATEWAY",
                parameters: {
                  gateway: "example",
                  gatewayMerchantId: "exampleGatewayMerchantId",
                },
              },
            },
          ],
          transactionInfo: {
            totalPriceStatus: "FINAL",
            totalPrice: (request.amount / 100).toFixed(2), // Convert to decimal format (e.g., 100 -> "1.00")
            currencyCode: request.currency,
          },
          merchantInfo: {
            merchantName: "マカワンペイ",
            merchantId: "01234567890123456789",
          },
        };

        console.log("Loading Google Pay payment data...");
        const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
        console.log("Google Pay payment successful:", paymentData);
        
        // Extract payment token from the response
        const paymentToken = JSON.parse(paymentData.paymentMethodData.tokenizationData.token);
        
        return {
          signature: paymentToken.signature,
          intermediateSigningKey: paymentToken.intermediateSigningKey,
          protocolVersion: paymentToken.protocolVersion,
          signedMessage: paymentToken.signedMessage,
        };
      } catch (err: any) {
        console.error("Google Pay payment failed:", err);
        
        // Handle specific error cases
        if (err.statusCode === 'CANCELED') {
          throw new Error("Google Pay payment was cancelled");
        } else if (err.statusCode === 'DEVELOPER_ERROR') {
          throw new Error("Google Pay configuration error");
        } else {
          throw new Error("Google Pay payment failed: " + err.message);
        }
      }
    } else {
      // Mock payment data for development/testing when Google Pay is not available
      console.log("Google Pay not available, processing mock payment:", request);
      
      // Simulate payment UI delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        signature: "mock_signature_" + Date.now(),
        intermediateSigningKey: {
          signedKey: "mock_signed_key",
          signatures: ["mock_signature_1", "mock_signature_2"],
        },
        protocolVersion: "ECv2",
        signedMessage: "mock_signed_message_" + Date.now(),
      };
    }
  };

  return {
    isGooglePayReady,
    processPayment,
  };
}

// Extend Window interface for Google Pay
declare global {
  interface Window {
    google?: {
      payments?: {
        api?: {
          PaymentsClient: any;
        };
      };
    };
    googlePayReady?: boolean;
  }
}
