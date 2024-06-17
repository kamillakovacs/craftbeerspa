import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { format } from "date-fns";
import { ReservationWithDetails } from "../../lib/validation/validationInterfaces";
import firebase from "../../lib/firebase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const reservation: ReservationWithDetails = req.body.reservation;
  const paymentId = req.body.paymentId;
  const reservations = firebase.database().ref("reservations");
  const headers = { "Content-Type": "application/json", "X-API-KEY": process.env.BILLINGO_API_KEY };

  return await getPartners(headers).then((partners: any[]) => {
    const existingPartner = getExistingPartner(reservation, partners);
    if (existingPartner.length > 0) {
      const partnerId = existingPartner[0].id;
      createDocument(reservation, paymentId, partnerId, headers, reservations, res);
    } else {
      createPartnerThenDocument(reservation, paymentId, headers, reservations, res);
    }
  });
}

const createPartnerThenDocument = async (reservation, paymentId, headers, reservations, res) =>
  await axios
    .post(process.env.BILLINGO_PARTNER_URL, getCreatePartnerBody(reservation), { headers })
    .then(async (response) => {
      console.info("Partner created successfully");
      return await createDocument(reservation, paymentId, response.data.id, headers, reservations, res);
    })
    .catch((e) => console.error("Error creating new partner", e));

const getExistingPartner = (reservation: ReservationWithDetails, partners: any[]) =>
  partners.filter(
    (partner) =>
      partner.address.address === reservation.address &&
      partner.name === reservation.firstName + " " + reservation.lastName
  );

const createDocument = async (
  reservation: ReservationWithDetails,
  paymentId: string,
  partnerId: number,
  headers: any,
  reservations: any,
  res: NextApiResponse
) =>
  await axios
    .post(process.env.BILLINGO_DOCUMENT_URL, getCreateDocumentBody(reservation, partnerId), { headers })
    .then(async (document: any) => {
      console.info("Document created successfully");
      return sendDocument(document.data.id, reservation.email, headers, reservations, paymentId, res);
    })
    .catch((e) => console.error("Error creating document", e.config.data, e.response.data));

const sendDocument = async (
  documentId: number,
  email: string,
  headers: any,
  reservations: any,
  paymentId: string,
  res: NextApiResponse
) =>
  await axios
    .post(`${process.env.BILLINGO_DOCUMENT_URL}/${documentId}/send`, { emails: [email] }, { headers })
    .then(async () => {
      console.info("Document sent successfully");
      await saveReceiptSentStatusAndDocumentId(reservations, paymentId, documentId);
      return res.status(200).json({ documentId });
    })
    .catch((e) => console.error("Error emailing document to customer", e.config.data, e.response.data));

const getPartners = async (headers: any) =>
  await axios
    .get(process.env.BILLINGO_PARTNER_URL, { headers })
    .then(async (response: any) => {
      console.info("Partners pulled successfully");
      return response.data.data;
    })
    .catch((e) => console.error("Error pulling list of partners", e.config.data, e.response.data));

const getCreatePartnerBody = (reservation: ReservationWithDetails) => {
  const { firstName, lastName, address, city, country, postCode, email, phoneNumber } = reservation;

  return {
    name: `${firstName} ${lastName}`,
    address: {
      country_code: country.value,
      post_code: postCode,
      city,
      address
    },
    emails: [email],
    phone: phoneNumber,
    custom_billing_settings: {
      payment_method: "online_bankcard",
      document_form: "electronic",
      document_currency: "HUF",
      template_language_code: "hu"
    }
  };
};

const getCreateDocumentBody = (reservation: ReservationWithDetails, partnerId: number) => ({
  partner_id: partnerId,
  block_id: process.env.BILLINGO_DOCUMENT_BLOCK_ID,
  bank_account_id: process.env.BILLING_BANK_ACCOUNT_ID,
  type: "invoice",
  fulfillment_date: getDateOfPurchaseForBillingo(new Date(reservation.dateOfPurchase)),
  due_date: getDateOfPurchaseForBillingo(new Date(reservation.dateOfPurchase)),
  payment_method: "barion",
  language: "hu",
  currency: "HUF",
  electronic: true,
  paid: true,
  items: [
    {
      product_id: getProductId(reservation.numberOfGuests, reservation.numberOfTubs),
      quantity: 1
    }
  ]
});

const getDateOfPurchaseForBillingo = (dateOfPurchase: Date) => format(dateOfPurchase, "yyyy-MM-dd");

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

const saveReceiptSentStatusAndDocumentId = async (reservations: any, paymentId: string, documentId: number) =>
  await reservations
    .update({
      [`${paymentId}/communication/receiptSent`]: true,
      [`${paymentId}/reservationId`]: documentId
    })
    .then(() => console.info("Receipt sent status saved successfully"))
    .catch((e) => console.error("Error saving receipt sent status", e));
