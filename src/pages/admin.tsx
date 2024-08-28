import classNames from "classnames";
import "firebase/database";
import React, { FC, memo, useEffect } from "react";
import classnames from "classnames";
import { Field, Formik } from "formik";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { Trans, useTranslation } from "next-i18next";

import { useAppContext } from "../../context/appContext";
import * as payment from "../api/paymentRequest";
import firebase from "../lib/firebase";
import { ReservationWithDetails } from "../lib/validation/validationInterfaces";
import { details } from "../lib/validation/validationSchemas";
import { ReservationDataShort, User } from "../lib/interfaces";

import Customer from "../components/customer";
import ReservationSummary from "../components/reservationSummary";

import reservationStyles from "../styles/reservation.module.scss";
import styles from "../styles/main.module.scss";
import customerStyles from "../styles/customer.module.scss";
import Options from "../components/options";
import ReservationDate from "../components/reservationDate";
import { PaymentStatus } from "../api/interfaces";

interface Props {
  customerAlreadyInDatabase: boolean;
  currentReservations: ReservationDataShort[];
}

const Details: FC<Props> = ({ currentReservations }) => {
  const router = useRouter();
  const [data] = useAppContext();
  const { t } = useTranslation("common");

  const initialValues: ReservationWithDetails = {
    date: data.date,
    numberOfGuests: data.numberOfGuests,
    numberOfTubs: data.numberOfTubs,
    price: data.price,
    firstName: null,
    lastName: null,
    phoneNumber: null,
    email: null,
    address: null,
    city: null,
    country: null,
    postCode: null,
    paymentMethod: null,
    whereYouHeard: { value: "", label: "" },
    canceled: null,
    uncancelable: false,
    communication: {
      reservationEmailSent: false,
      receiptSent: false,
      rescheduleEmailSentCount: 0,
      cancelationEmailSent: false
    },
    requirements: null,
    termsAndConditions: false,
    addToEmailList: false
  };

  const goBack = () => router.replace("/");

  const redirectToStartPayment = async (reservationData: ReservationWithDetails) =>
    payment.useSendPaymentRequest(reservationData, customerAlreadyInDatabase, router);

  const onSubmit = async (values: ReservationWithDetails) => {
    const reservationData: ReservationWithDetails = {
      date: values.date,
      dateOfPurchase: new Date(),
      numberOfGuests: values.numberOfGuests,
      numberOfTubs: values.numberOfTubs,
      price: values.price,
      firstName: values.firstName,
      lastName: values.lastName,
      phoneNumber: values.phoneNumber,
      email: values.email,
      address: values.address,
      city: values.city,
      country: values.country,
      postCode: values.postCode,
      whereYouHeard: values.whereYouHeard,
      paymentStatus: null,
      paymentMethod: values.paymentMethod,
      canceled: null,
      uncancelable: false,
      communication: {
        reservationEmailSent: false,
        receiptSent: false,
        rescheduleEmailSentCount: 0,
        cancelationEmailSent: false
      },
      requirements: null,
      termsAndConditions: values.termsAndConditions,
      addToEmailList: values.addToEmailList
    };

    return redirectToStartPayment(reservationData);
  };

  return (
    <article className={styles.main}>
      <label className={reservationStyles.reservation__title}>
        <span>{t("details.yourDetails")}</span>
      </label>
      <section className={styles.main__container}>
        <Formik<ReservationWithDetails>
          initialValues={initialValues}
          onSubmit={async (values) => {
            onSubmit(values);
          }}
          validationSchema={details}
          validateOnChange
        >
          {({ dirty, errors, values, handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <section className={reservationStyles.reservation}>
                <ReservationDate currentReservations={currentReservations} />
                <Options currentReservations={currentReservations} />
              </section>
              <section className={customerStyles.customer}>
                <Customer />
                <ReservationSummary
                  reservation={values}
                  date={data.date}
                  price={values.price}
                  paymentStatus={values.paymentStatus}
                />
                <div className={reservationStyles.reservation__barion__container}>
                  <div className={reservationStyles.reservation__checkbox}>
                    <label>
                      <Field type="checkbox" name="newsletter" />
                      {t("details.newsletter")}
                    </label>
                  </div>

                  <div className={reservationStyles.reservation__info}>
                    <button
                      className={`${reservationStyles.reservation__button} ${reservationStyles.reservation__back}`}
                      type="button"
                      onClick={goBack}
                    >
                      {t("details.back")}
                    </button>
                    <button
                      type="submit"
                      className={classnames(
                        `${reservationStyles.reservation__button} ${reservationStyles.reservation__finish} ${reservationStyles.reservation__margin}`,
                        {
                          [reservationStyles.reservation__finish__enabled]: !!dirty && !Object.keys(errors).length
                        }
                      )}
                    >
                      {t("details.finishAndPay")}
                    </button>
                  </div>
                </div>
              </section>
            </form>
          )}
        </Formik>
      </section>
    </article>
  );
};

export async function getServerSideProps({ locale }) {
  const reservations = firebase.database().ref("reservations");
  const currentReservations: ReservationDataShort[] = await reservations?.once("value").then(function (snapshot) {
    if (snapshot.val()) {
      return (
        Object.values(snapshot.val())
          .filter(
            (res: ReservationWithDetails) =>
              res.paymentStatus === PaymentStatus.Succeeded && new Date(res.date) > new Date()
          )
          .map((res: ReservationWithDetails) => ({
            date: res.date ?? null,
            numberOfGuests: res.numberOfGuests ?? null,
            numberOfTubs: res.numberOfTubs ?? null,
            canceled: res.canceled ?? null
          })) || []
      );
    } else {
      return null;
    }
  });

  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
      currentReservations
    }
  };
}

export default memo(Details);
