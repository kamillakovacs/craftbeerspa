const firebase = require("../../lib/firebase").default;
import { EmailParams, MailerSend, Recipient, Sender } from "mailersend";
import { NextApiRequest, NextApiResponse } from "next";

import { Action } from "../../lib/interfaces";
import { currencyFormat } from "../../lib/util/currencyFormat";
import { ReservationWithDetails } from "../../lib/validation/validationInterfaces";
import { PaymentStatus } from "../../api/interfaces";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { reservation, paymentId, language, action, date } = req.body;
  const { firstName, lastName, email } = reservation;
  const database = firebase.database();
  const reservations = database.ref("reservations");
  const isHungarian = language === "hu-HU";

  const mailerSend = new MailerSend({ apiKey: process.env.MAILERSEND_API_KEY });
  const sentFrom = new Sender(process.env.MAILERSEND_FROM_EMAIL, "Craft Beer Spa");
  const customerTo = [new Recipient(email, `${firstName} ${lastName}`)];
  const craftBeerSpaTo = [new Recipient(process.env.ADMIN_EMAIL, "Craft Beer Spa")];
  const emailParamsToCustomer = new EmailParams()
    .setFrom(sentFrom)
    .setTo(customerTo)
    .setReplyTo(sentFrom)
    .setSubject(getSubject(isHungarian, action))
    .setTemplateId(
      isHungarian
        ? process.env.MAILERSEND_CONFIRMATION_TEMPLATE_ID_HUNGARIAN
        : process.env.MAILERSEND_CONFIRMATION_TEMPLATE_ID_ENGLISH
    )
    .setPersonalization(getPersonalization(reservation.email, action))
    .setVariables(getVariables(reservation, language, paymentId, action, date));

  const emailParamsToCraftBeerSpa = new EmailParams()
    .setFrom(sentFrom)
    .setTo(craftBeerSpaTo)
    .setReplyTo(sentFrom)
    .setSubject(getSubject(true, action))
    .setTemplateId(process.env.MAILERSEND_ADMIN_TEMPLATE_ID)
    .setPersonalization(getPersonalization(process.env.ADMIN_EMAIL, action))
    .setVariables(getVariables(reservation, language, paymentId, action, date, process.env.ADMIN_EMAIL));

  await mailerSend.email
    .send(emailParamsToCustomer)
    .then(
      async () =>
        await reservations.update({
          [`${paymentId}/communication/reservationEmailSent`]: true
        })
    )
    .catch((e) => console.log(e));

  await mailerSend.email
    .send(emailParamsToCraftBeerSpa)
    .then(() => console.log("Admin notification sent"))
    .catch((e) => console.log(e));

  return res.status(200).json({ success: true });
}

const getSubject = (isHungarian: boolean, action: Action) => {
  switch (action) {
    case Action.None:
    default:
      return isHungarian ? "Craft Beer Spa foglalás" : "Your Craft Beer Spa reservation";
    case Action.Change:
      return isHungarian ? "Craft Beer Spa foglalás módosítása" : "Your Craft Beer Spa reservation update";
    case Action.Cancel:
      return isHungarian ? "Craft Beer Spa foglalás lemondása" : "Your Craft Beer Spa reservation cancelation";
  }
};

const getPersonalization = (email: string, action: Action) => [
  {
    email,
    data: {
      canceled: action === Action.Cancel
    }
  }
];

const getVariables = (
  reservation: ReservationWithDetails,
  language: string,
  paymentId: string,
  action: Action,
  amendedDate?: Date,
  adminEmail?: string
) => {
  const { firstName, lastName, email, numberOfTubs, numberOfGuests, price, paymentStatus } = reservation;

  const date = getDate(language, amendedDate, reservation?.date);

  const dateOfPurchase = new Intl.DateTimeFormat(language, {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(reservation?.dateOfPurchase));

  return [
    {
      email: adminEmail ?? email,
      substitutions: [
        {
          var: "name",
          value: language === "hu-HU" ? `${lastName} ${firstName}` : `${firstName} ${lastName}`
        },
        {
          var: "date",
          value: date
        },
        {
          var: "tubsAndGuests",
          value:
            language === "hu-HU"
              ? `${numberOfTubs.value} dézsa ${numberOfGuests.value} vendég számára`
              : `${numberOfTubs.value} tubs for ${numberOfGuests.value} guests`
        },
        {
          var: "email",
          value: adminEmail ?? email
        },
        {
          var: "dateOfPurchase",
          value: dateOfPurchase
        },
        {
          var: "netPrice",
          value: currencyFormat.format(parseFloat(price))
        },
        {
          var: "tax",
          value: currencyFormat.format(parseFloat(price))
        },
        {
          var: "totalPrice",
          value: currencyFormat.format(parseFloat(price))
        },
        {
          var: "url",
          value: `${process.env.RESERVATION_BASE_URL}${paymentId}`
        },
        {
          var: "message",
          value: getMessage(language, action)
        },
        {
          var: "info",
          value: getInfo(action)
        },
        {
          var: "paymentStatus",
          value: getPaymentStatus(language, paymentStatus)
        },
        {
          var: "paymentId",
          value: paymentId
        }
      ]
    }
  ];
};

const getDate = (language: string, amendedDate: Date, date: Date) =>
  new Intl.DateTimeFormat(language, {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(amendedDate ? amendedDate : date));

const getMessage = (language: string, action: Action) => {
  switch (action) {
    case Action.None:
    default:
      return language === "hu-HU"
        ? "Boldog szeretettel várunk a Craft Beer Spa-ban! Köszönjük, hogy ellátogatsz hozzánk."
        : "We look forward to seeing you at Craft Beer Spa! Thanks for choosing us.";
    case Action.Change:
      return language === "hu-HU" ? "Foglalásod időpontját frissítettük." : "Your reservation date has been updated.";
    case Action.Cancel:
      return language === "hu-HU"
        ? "Foglalásodat töröltük, és kártyádra visszautaltuk a foglalás összegét, mínusz egy 0,5% kezelési díjat."
        : "Your reservation was canceled, and the reservation cost, minus a 1.5% handling fee, was refunded to your card.";
  }
};

const getInfo = (action: Action) => {
  switch (action) {
    case Action.None:
    default:
      return "Új foglalás érkezett.";
    case Action.Change:
      return "Egy foglalás időpontját módosították.";
    case Action.Cancel:
      return "Egy foglalást töröltek. Visszautaltuk a kártyára a foglalás összegét, mínusz egy 0,5% kezelési díjat.";
  }
};

const getPaymentStatus = (language: string, paymentStatus: PaymentStatus) =>
  paymentStatus === PaymentStatus.CanceledReservation
    ? language === "hu-HU"
      ? "Visszatérítve"
      : "Refunded"
    : language === "hu-HU"
    ? "Rendezve"
    : "Paid";
