import axios from "axios";
import { PaymentStatus } from "./interfaces";
import { ReservationWithDetails } from "../lib/validation/validationInterfaces";

const headers = {
  "Content-Type": "application/json; charset=utf-8"
};

export const makeReservation = async (
  reservationData: ReservationWithDetails,
  customerAlreadyInDatabase: boolean,
  paymentId: string,
  transactionId: string
) => {
  const newCustomer = {
    firstName: reservationData.firstName,
    lastName: reservationData.lastName,
    phoneNumber: reservationData.phoneNumber,
    email: reservationData.email
  };

  reservationData.paymentStatus = PaymentStatus.Prepared;
  reservationData.transactionId = transactionId;

  return await axios
    .post("/api/reservation", { reservationData, newCustomer, paymentId, customerAlreadyInDatabase }, { headers })
    .then((res) => res.data)
    .catch((e) => e);
};

export const updateReservationDate = async (date: Date, paymentId: string) =>
  await axios
    .post("/api/updateReservationDate", { date, paymentId }, { headers })
    .then((res) => res.data)
    .catch((e) => e);
