import React, { FC, memo, useEffect } from "react";
import firebase from "../lib/firebase";
import axios from "axios";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

import { Reservation as ReservationShort, ReservationWithDetails } from "../lib/validation/validationInterfaces";
import ReservationDetails from "../components/reservationDetails";
import Unsuccessful from "../components/unsuccessful";

import thanksStyles from "../styles/thanks.module.scss";
import { PaymentStatus } from "../api/interfaces";
import { Action, ReservationDataShort, User } from "../lib/interfaces";

interface Props {
  reservation: ReservationWithDetails;
  paymentId: string;
  customerAlreadyInDatabase: boolean;
  currentReservations: ReservationDataShort[];
}

const Reservation: FC<Props> = ({ reservation, paymentId, customerAlreadyInDatabase, currentReservations }) => {
  const { i18n } = useTranslation("common");

  useEffect(() => {
    const createAndSendReceipt = async () =>
      await axios
        .post("/api/receipt", { reservation, paymentId })
        .then((res) => res.data.documentId)
        .catch((e) => console.error(e));

    const createAndSendConfirmationEmail = async (reservationId: number) =>
      await axios
        .post("/api/email", { reservation, paymentId, reservationId, language: i18n.language, action: Action.None })
        .then((res) => res.data)
        .catch((e) => console.error(e));

    if (reservation?.paymentStatus === PaymentStatus.Succeeded && !reservation?.communication.receiptSent) {
      createAndSendReceipt().then((reservationId: number) => createAndSendConfirmationEmail(reservationId));
    }
  }, [reservation, paymentId, i18n.language]);

  return (
    <>
      <div id="modal-root"></div>
      <article className={thanksStyles.container}>
        {reservation?.paymentStatus === PaymentStatus.Succeeded ? (
          <ReservationDetails reservation={reservation} currentReservations={currentReservations} />
        ) : (
          <Unsuccessful reservation={reservation} customerAlreadyInDatabase={customerAlreadyInDatabase} />
        )}
      </article>
    </>
  );
};

export async function getServerSideProps({ query, locale }) {
  const res = firebase.database().ref("reservations");
  const customers = firebase.database().ref("customers");

  const reservations = await res.once("value").then(function (snapshot) {
    return snapshot.val() || "Anonymous";
  });
  const paymentId = query.paymentId as string;
  const reservation: ReservationWithDetails = reservations[paymentId];

  const users: User[] = await customers.once("value").then(function (snapshot) {
    return snapshot.val() || "Anonymous";
  });

  const customerAlreadyInDatabase =
    Object.values(users).filter((user) => {
      if (user.firstName) {
        return (
          user.firstName.toLowerCase() === reservation.firstName.toLowerCase() &&
          user.lastName.toLowerCase() === reservation.lastName.toLowerCase() &&
          user.phoneNumber.toLowerCase() === reservation.phoneNumber.toLowerCase() &&
          user.email.toLowerCase() === reservation.email.toLowerCase()
        );
      }
    }).length > 0;

  const currentReservations: ReservationDataShort[] = await res?.once("value").then(function (snapshot) {
    return (
      Object.values(snapshot.val())
        .filter(
          (res: ReservationWithDetails) =>
            res.paymentStatus === PaymentStatus.Succeeded && new Date(res.date) > new Date()
        )
        .map((res: ReservationShort) => ({
          date: res.date ?? null,
          numberOfGuests: res.numberOfGuests ?? null,
          numberOfTubs: res.numberOfTubs ?? null
        })) || []
    );
  });

  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
      reservation,
      paymentId,
      customerAlreadyInDatabase,
      currentReservations
    }
  };
}

export default memo(Reservation);
