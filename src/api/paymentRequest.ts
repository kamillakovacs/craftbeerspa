import axios from "axios";
import { NextRouter } from "next/router";

import * as newReservation from "../api/makeReservation";
import { BarionPaymentConfirmationResponseData } from "./interfaces";
import { ReservationWithDetails } from "../lib/validation/validationInterfaces";

export const useSendPaymentRequest = async (
  reservationData: ReservationWithDetails,
  customerAlreadyInDatabase: boolean,
  router: NextRouter
) => {
  const headers = {
    "Content-Type": "application/json"
  };

  const data = {
    POSKey: process.env.BARION_POS_KEY,
    PaymentType: "Immediate",

    GuestCheckout: "True",
    FundingSources: ["All"],

    PaymentRequestId: `share-spa-${new Date(reservationData.date).getTime()}-${Date.now()}`,
    PayerHint: reservationData.email,

    RedirectUrl: process.env.BARION_PAYMENT_REDIRECT_URL,
    CallbackUrl: process.env.BARION_PAYMENT_CALLBACK_URL,

    Locale: "hu-HU",
    Currency: "HUF",

    Transactions: [
      {
        POSTransactionId: `share-pos-transaction-${new Date(reservationData.date).getTime()}-${Date.now()}`,
        Payee: process.env.BARION_PAYEE,
        Total: reservationData.price,
        Items: [
          {
            Name: reservationData.lastName,
            Description: `Spa reservation for ${reservationData.numberOfGuests.label}`,
            Quantity: 1,
            Unit: "pcs",
            UnitPrice: reservationData.price,
            ItemTotal: reservationData.price
          }
        ]
      }
    ]
  };

  return axios
    .post(process.env.BARION_PAYMENT_REQUEST_URL, data, {
      headers
    })
    .then(async (res: BarionPaymentConfirmationResponseData) => {
      await newReservation
        .makeReservation(reservationData, customerAlreadyInDatabase, res.data.PaymentId, res.data.Transactions[0].TransactionId)
        .then(() => router.replace(res.data.GatewayUrl))
        .catch((e) => e);
    });
};
