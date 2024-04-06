import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { ReservationWithDetails } from "../../lib/validation/validationInterfaces";
import firebase from "firebase-admin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const reservation: ReservationWithDetails = req.body.reservation;
  const paymentId = req.body.paymendId;
  const database = firebase.database();
  const reservations = database.ref("reservations");
  const headers = { "Content-Type": "application/json", "X-API-KEY": process.env.BILLINGO_API_KEY };

  await axios
    .post(process.env.BILLINGO_CREATE_PARTNER_URL, createPartner(reservation, paymentId), { headers })
    .then(async () =>
      axios
        .post(process.env.BILLINGO_CREATE_DOCUMENT_URL, createDocument(reservation, paymentId), { headers })
        .then(async (res: any) => {
          await reservations.update({
            [`${paymentId}/communication/receiptSent`]: false
          });
          return res.data;
        })
        .catch(() => {})
    )
    .catch((e) => e);

  return res.status(200).json({ success: true });
}

const createPartner = (reservation: ReservationWithDetails, paymentId: string) => {
  const { firstName, lastName, address, city, countryCode, postCode, email, phoneNumber } = reservation;

  return {
    id: paymentId,
    name: firstName + " " + lastName,
    address: {
      country_code: countryCode,
      post_code: postCode,
      city,
      address
    },
    emails: [email],
    taxcode: "",
    iban: "",
    swift: "",
    account_number: "",
    phone: phoneNumber,
    general_ledger_number: "",
    tax_type: "NO_TAX_NUMBER",
    custom_billing_settings: {
      payment_method: "online_bankcard",
      document_form: "electronic",
      due_days: 0,
      document_currency: "HUF",
      template_language_code: "hu",
      discount: {
        type: "percent",
        value: 0
      }
    },
    group_member_tax_number: ""
  };
};

const createDocument = (reservation: ReservationWithDetails, paymentId: string) => ({
  vendor_id: "",
  partner_id: paymentId,
  block_id: process.env.BILLINGO_DOCUMENT_BLOCK_ID,
  bank_account_id: process.env.BILLING_BANK_ACCOUNT_ID,
  type: "invoice",
  fulfillment_date: reservation.dateOfPurchase,
  due_date: reservation.dateOfPurchase,
  payment_method: "bankcard",
  language: "hu",
  currency: "HUF",
  conversion_rate: 1,
  electronic: true,
  paid: true,
  items: [
    {
      product_id: getProductId(reservation.numberOfGuests, reservation.numberOfTubs),
      quantity: 1
    }
  ],
  settings: {
    mediated_service: false,
    without_financial_fulfillment: false,
    online_payment: "Barion",
    round: "five",
    no_send_onlineszamla_by_user: true,
    order_number: "",
    place_id: 0,
    instant_payment: true,
    selected_type: "invoice"
  },
  advance_invoice: [0],
  discount: {
    type: "percent",
    value: 0
  },
  instant_payment: true
});

const getProductId = (guests: { label: string; value: number }, tubs: { label: string; value: number }) => {
  switch (guests.value) {
    case 1:
      return process.env.BILLINGO_1_1_PRODUCT_ID;
    case 2:
      if (tubs.value === 1) {
        return process.env.BILLINGO_2_1_PRODUCT_ID;
      }

      if (tubs.value === 2) {
        return process.env.BILLINGO_2_2_PRODUCT_ID;
      }
      break;
    case 3:
      if (tubs.value === 2) {
        return process.env.BILLINGO_3_2_PRODUCT_ID;
      }

      if (tubs.value === 3) {
        return process.env.BILLINGO_3_3_PRODUCT_ID;
      }
      break;
    case 4:
      if (tubs.value === 2) {
        return process.env.BILLINGO_4_2_PRODUCT_ID;
      }

      if (tubs.value === 3) {
        return process.env.BILLINGO_4_3_PRODUCT_ID;
      }
      break;
    case 5:
      return process.env.BILLINGO_5_3_PRODUCT_ID;
    case 6:
      return process.env.BILLINGO_6_3_PRODUCT_ID;
    default:
      return process.env.BILLINGO_1_1_PRODUCT_ID;
  }
};
