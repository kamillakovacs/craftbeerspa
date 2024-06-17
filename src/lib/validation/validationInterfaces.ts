import { PaymentStatus } from "../../api/interfaces";
import { CanceledBy, Communication } from "../interfaces";

export interface Reservation {
  date: Date;
  lengthOfTime: { label: string; value: number };
  numberOfGuests: { label: string; value: number };
  numberOfTubs: { label: string; value: number };
  price: string;
  canceled: CanceledBy;
}

export interface ReservationWithDetails {
  date: Date;
  dateOfPurchase?: Date;
  lengthOfTime: { label: string; value: number };
  numberOfGuests: { label: string; value: number };
  numberOfTubs: { label: string; value: number };
  price: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  address: string;
  city: string;
  country: { label: string; value: string };
  postCode: string;
  whereYouHeard: { label: string; value: string };
  requirements: string;
  termsAndConditions: boolean;
  addToEmailList: boolean;
  paymentMethod: string;
  paymentStatus?: PaymentStatus;
  canceled: CanceledBy;
  uncancelable: boolean;
  communication: Communication;
  reservationId?: number;
  transactionId?: string;
}

export interface Reservations {
  [key: string]: ReservationWithDetails;
}
