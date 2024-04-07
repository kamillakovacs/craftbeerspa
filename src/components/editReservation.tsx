import React, { FC, memo, useEffect, useState } from "react";
import axios from "axios";
import classnames from "classnames";
import { Formik } from "formik";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

import * as changeReservation from "../api/makeReservation";

import { Reservation, ReservationWithDetails } from "../lib/validation/validationInterfaces";
import { Action, ReservationDataShort } from "../lib/interfaces";
import Calendar from "../components/calendar";

import reservationStyles from "../styles/reservation.module.scss";
import dateStyles from "../styles/reservationDate.module.scss";
import modalStyles from "../styles/modal.module.scss";

import Modal from "./modal";
import { PaymentStatus } from "../api/interfaces";

interface Props {
  reservation: ReservationWithDetails;
  currentReservations: ReservationDataShort[];
}

const EditReservation: FC<Props> = ({ reservation, currentReservations }) => {
  const router = useRouter();
  const { t, i18n } = useTranslation("common");
  const paymentId = router.query.paymentId as string;
  const [date, setDate] = useState(reservation.date);
  const [action, setAction] = useState("");
  const [updateResponse, setUpdateResponse] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const notCanceled = !reservation.canceled && reservation.paymentStatus === PaymentStatus.Succeeded;

  //@ts-ignore
  const reservationIsMoreThan48HoursAway: boolean =
    Math.round((new Date(reservation.date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) > 2;
  const reservationIsInTheFuture: boolean =
    new Date(reservation.date).valueOf() > new Date().setHours(new Date().getHours() + 2);

  useEffect(() => {
    if (document && document.querySelector("#changeButton") && action == Action.Change) {
      document.querySelector("#changeButton").scrollIntoView({ behavior: "smooth", inline: "start" });
    }
  });

  useEffect(() => {
    if (updateResponse === 200) {
      window.location.reload();
    }
  });

  useEffect(() => {
    const markUncancelable = async () =>
      await axios
        .post("/api/markUncancelable", { paymentId })
        .then((res) => res.data)
        .catch((e) => {
          console.log("Error sending email confirming change");
          return e;
        });
    if (!reservationIsMoreThan48HoursAway) {
      markUncancelable();
    }
  }, [reservationIsMoreThan48HoursAway, paymentId]);

  const showChange = async () => {
    setAction(Action.Change);
  };

  const openModal = () => setShowModal(true);

  const cancel = async () => {
    setAction(Action.Cancel);
    setDate(date);
    const headers = {
      "Content-Type": "application/json; charset=utf-8"
    };

    return await axios
      .post("/api/cancelReservation", { paymentId }, { headers })
      .then((res) => {
        setShowModal(false);
        window.location.reload();
      })
      .catch((e) => e);
  };

  const redirectToChangeReservation = async (date: Date) => {
    await changeReservation.updateReservationDate(date, paymentId).catch((e) => e);
  };

  const initialValues = {
    date: null,
    numberOfGuests: reservation.numberOfGuests,
    numberOfTubs: reservation.numberOfTubs,
    price: reservation.price,
    firstName: reservation.firstName,
    lastName: reservation.lastName,
    phoneNumber: reservation.phoneNumber,
    email: reservation.email,
    paymentMethod: reservation.paymentMethod
  };

  const onSubmit = async (values: Reservation) => {
    setDate(values.date);

    await axios
      .post("/api/email", { reservation, paymentId, language: i18n.language, t, action: Action.Change, date })
      .then((res) => res.data)
      .catch((e) => {
        console.log("Error sending email confirming change");
        return e;
      });

    return redirectToChangeReservation(values.date)
      .then(() => setUpdateResponse(200))
      .catch(() => setUpdateResponse(500));
  };

  return (
    <div className={reservationStyles.reservation__infoContainer}>
      <div className={reservationStyles.reservation__info}>
        {notCanceled && reservationIsInTheFuture && (
          <button
            className={`${reservationStyles.reservation__button} ${reservationStyles.reservation__largemargin}`}
            id="changeButton"
            type="button"
            onClick={showChange}
          >
            {t("reservationDate.changeReservationDate")}
          </button>
        )}
        {notCanceled && reservationIsMoreThan48HoursAway && !reservation.uncancelable && (
          <>
            <button
              type="button"
              className={`${reservationStyles.reservation__button} ${reservationStyles.reservation__margin}`}
              onClick={openModal}
            >
              {t("reservationDate.cancelReservation")}
            </button>
            {showModal && (
              <Modal onClose={() => setShowModal(false)} title="Cancelation">
                <span>Are you sure you want to cancel your reservation?</span>
                <span>
                  If so, press the button below, then email us at craftbeerspa@gmail.com with your name, address, and
                  bank account details, and we will refund your bank account within 7 days for the cost of your
                  reservation minus a 1.5% transaction fee.
                </span>
                <button
                  type="submit"
                  className={`${modalStyles.button} ${reservationStyles.reservation__margin}`}
                  onClick={cancel}
                >
                  Yes, cancel it
                </button>
              </Modal>
            )}
          </>
        )}
      </div>
      <Formik<Reservation>
        initialValues={initialValues}
        onSubmit={(values) => {
          onSubmit(values);
        }}
        validateOnChange
      >
        {({ values, errors, dirty, handleSubmit }) => {
          const isFinalizeButtonEnabled = !!dirty && !Object.keys(errors).length && values.date.getHours() !== 0;
          return (
            <form onSubmit={handleSubmit} className={reservationStyles.reservation}>
              {action === Action.Change && (
                <>
                  <section className={dateStyles.reservationDate}>
                    <Calendar currentReservations={currentReservations} isExistingReservation={true} />
                    <div className={reservationStyles.reservation__barion__container}>
                      <div className={reservationStyles.reservation__updated}>
                        <button
                          type="submit"
                          className={classnames(
                            `${reservationStyles.reservation__button} ${reservationStyles.reservation__finish} `,
                            { [reservationStyles.reservation__finish__enabled]: isFinalizeButtonEnabled }
                          )}
                        >
                          {t("reservationDate.finalizeDateChange")}
                        </button>
                        {updateResponse === 500 && (
                          <div className={reservationStyles.reservation__updated__text}>
                            {t("reservationDate.updateError")}
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                </>
              )}
            </form>
          );
        }}
      </Formik>
    </div>
  );
};

export default memo(EditReservation);
