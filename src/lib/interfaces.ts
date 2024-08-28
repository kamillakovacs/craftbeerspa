export interface ReservationDataShort {
  date: Date;
  numberOfGuests: { label: string; value: number };
  numberOfTubs: { label: string; value: number };
  canceled: CanceledBy;
}

export interface User {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}

export interface ReceiptEmail {
  subject: string;
  body: string;
}

export interface Communication {
  reservationEmailSent: boolean;
  receiptSent: boolean;
  rescheduleEmailSentCount: number;
  cancelationEmailSent: boolean;
}

export enum Action {
  None = "none",
  Change = "change",
  Cancel = "cancel"
}

export enum CanceledBy {
  User = "user",
  BeerSpa = "beerspa",
  PhoneCall = "phonecall"
}

export interface AdminUser {
  id: string;
  password: string;
}
