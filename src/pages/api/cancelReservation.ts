import { PaymentStatus } from "../../api/interfaces";
import { CanceledBy } from "../../lib/interfaces";

export default async function handler(req, res) {
  const firebase = require("../../lib/firebase").default;
  const { paymentId, phoneCall } = req.body;

  const database = firebase.database();
  const reservations = database.ref("reservations");

  await reservations.update({
    [`${paymentId}/canceled`]: phoneCall ? CanceledBy.PhoneCall : CanceledBy.User,
    [`${paymentId}/communication/cancelationEmailSent`]: true,
    [`${paymentId}/paymentStatus`]: PaymentStatus.CanceledReservation
  });

  return res.status(200).json({ success: true });
}
