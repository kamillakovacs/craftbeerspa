import classnames from "classnames";
import "firebase/database";
import React, { FC, memo, useEffect } from "react";
import { Field, Formik } from "formik";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

import { useAppContext } from "../../context/appContext";
import firebase from "../lib/firebase";
import firebaseadmin from "../lib/firebaseadmin";
import { ReservationWithDetails } from "../lib/validation/validationInterfaces";
import { details } from "../lib/validation/validationSchemas";
import { AdminUser, ReservationDataShort, User } from "../lib/interfaces";

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
  blocked: { dates: Object; times: Object };
}

const Details: FC<Props> = ({ customerAlreadyInDatabase, currentReservations, blocked }) => {
  const router = useRouter();
  const [data] = useAppContext();
  const { t } = useTranslation("common");

  useEffect(() => {
    if (document.cookie.indexOf("session") === -1) {
      router.replace("/login");
    }
  }, []);

  const initialValues: ReservationWithDetails = {
    date: null,
    numberOfGuests: null,
    numberOfTubs: null,
    price: "",
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

  const redirectToStartPayment = async (reservationData: ReservationWithDetails) => router.replace("/");

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
      paymentStatus: PaymentStatus.Succeeded,
      paymentMethod: values.paymentMethod,
      canceled: null,
      uncancelable: false,
      communication: {
        reservationEmailSent: false,
        receiptSent: false,
        rescheduleEmailSentCount: 0,
        cancelationEmailSent: false
      },
      requirements: values.requirements,
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
                <ReservationDate currentReservations={currentReservations} blocked={blocked} />
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
  const blockedDb = firebase.database().ref("blocked");
  const customers = firebase.database().ref("customers");

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

  const blocked: { dates: Object; times: Object } = await blockedDb?.once("value").then(function (snapshot) {
    if (snapshot.val()) {
      return {
        dates: snapshot.val().dates ?? null,
        times: snapshot.val().times ?? null
      };
    } else {
      return null;
    }
  });

  const users: User[] = await customers.once("value").then(function (snapshot) {
    return snapshot.val() || "Anonymous";
  });

  const customerAlreadyInDatabase = Object.values(users).filter((user) => {
    if (user.firstName) {
      return (
        user.firstName.toLowerCase() === user.firstName.toLowerCase() &&
        user.lastName.toLowerCase() === user.lastName.toLowerCase() &&
        user.phoneNumber.toLowerCase() === user.phoneNumber.toLowerCase() &&
        user.email.toLowerCase() === user.email.toLowerCase()
      );
    }
  }).length;

  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
      customerAlreadyInDatabase,
      currentReservations,
      blocked
    }
  };
}

export default memo(Details);