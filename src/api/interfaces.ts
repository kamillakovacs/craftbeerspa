export enum PaymentStatus {
  Prepared = "Prepared",
  Succeeded = "Succeeded",
  Reserved = "Reserved",
  Authorized = "Authorized",
  Canceled = "Canceled",
  Expired = "Expired"
}

export interface BarionTransaction {
  Currency: string;
  POSTransactionId: string;
  RelatedId: string;
  Status: PaymentStatus;
  TransactionId: string;
  TransactionTime: string;
}

export interface BarionPaymentErrors {
  ErrorCode: string;
  Title: string;
  Description: string;
  EndPoint: string;
  AuthData: string;
  HappenedAt: Date;
}

export interface BarionPaymentResponse {
  CallbackUrl: string;
  Errors: BarionPaymentErrors[];
  GatewayUrl: string;
  PaymentId: string;
  PaymentRequestId: string;
  QRUrl: string;
  RecurrenceResult: string;
  RedirectUrl: string;
  Status: PaymentStatus;
  ThreeDSAuthClientData: string;
  TraceId: string;
  Transactions: BarionTransaction[];
}

export interface BarionPaymentConfirmationResponseData {
  data: BarionPaymentResponse;
}
