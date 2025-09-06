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
    // Check if Google Pay is available
    if (typeof window !== "undefined" && window.google?.payments) {
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
        .then((response) => {
          if (response.result) {
            setIsGooglePayReady(true);
          }
        })
        .catch((err) => {
          console.error("Google Pay readiness check failed:", err);
        });
    } else {
      // For development/testing without Google Pay SDK
      console.log("Google Pay SDK not available, using mock implementation");
      setIsGooglePayReady(true);
    }
  }, []);

  const processPayment = async (request: PaymentRequest): Promise<PaymentData | null> => {
    if (typeof window !== "undefined" && window.google?.payments && isGooglePayReady) {
      try {
        const paymentsClient = new window.google.payments.api.PaymentsClient({
          environment: process.env.NODE_ENV === "production" ? "PRODUCTION" : "TEST",
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
                  gateway: "example", // Replace with actual gateway
                  gatewayMerchantId: "exampleGatewayMerchantId",
                },
              },
            },
          ],
          transactionInfo: {
            totalPriceStatus: "FINAL",
            totalPrice: request.amount.toString(),
            currencyCode: request.currency,
          },
          merchantInfo: {
            merchantName: "マカワンペイ",
            merchantId: process.env.VITE_GOOGLE_PAY_MERCHANT_ID || "BCR2DN4TZHZL6IAG",
          },
        };

        const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
        
        // Extract payment token from the response
        const paymentToken = JSON.parse(paymentData.paymentMethodData.tokenizationData.token);
        
        return {
          signature: paymentToken.signature,
          intermediateSigningKey: paymentToken.intermediateSigningKey,
          protocolVersion: paymentToken.protocolVersion,
          signedMessage: paymentToken.signedMessage,
        };
      } catch (err) {
        console.error("Google Pay payment failed:", err);
        throw new Error("Google Pay payment was cancelled or failed");
      }
    } else {
      // Mock payment data for development/testing
      console.log("Processing mock payment:", request);
      
      // Simulate payment processing delay
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
  }
}
