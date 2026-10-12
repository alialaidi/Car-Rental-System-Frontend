export type PaymentMethod = 'Cash' | 'CreditCard' | 'OnlinePayment' | 'BankTransfer';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';
export interface Payment {
  paymentId: number;
  contractId: number;
  customerId: number;
  method: PaymentMethod;
  amount: number;
  transactionReference: string | null;
  status: PaymentStatus;
  paymentDateUtc: Date;
}
export interface ContractBalance {
  contractId: number;
  totalAmount: number;
  paidAmount: number;
  refundedAmount: number;
  balance: number;
}
