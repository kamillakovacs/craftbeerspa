import { PaymentStatus } from "../../api/interfaces";

export default function handler(req, res) {
  const axios = require("axios");
  const firebase = require("../../lib/firebase").default;

  const headers = {
    "Content-Type": "application/json; charset=utf-8"
  };

  const params = {
    POSKey: process.env.BARION_POS_KEY,
    PaymentId: req.query.paymentId
  };

  const savePaymentStatus = (id: string, status: PaymentStatus) =>
    firebase
      .database()
      .ref("/reservations/" + id)
      .update({ paymentStatus: status });

  return axios
    .get(process.env.BARION_GET_PAYMENT_STATE_URL, {
      headers,
      params
    })
    .then(async (response) => {
      await savePaymentStatus(response.data.PaymentId, response.data.Status);
      return res.json({ success: true });
    })
    .catch((e) => res.error({ error: e }));
}
