import "firebase/database";
import React, { FC, memo } from "react";
import classnames from "classnames";
import { Formik } from "formik";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

import firebase from "../lib/firebase";
import { PaymentStatus } from "../api/interfaces";
import { Reservation, ReservationWithDetails } from "../lib/validation/validationInterfaces";
import { reservation } from "../lib/validation/validationSchemas";
import { useAppContext } from "../../context/appContext";

import Options from "../components/options";
import ReservationDate from "../components/reservationDate";
import Summary from "../components/summary";

import reservationStyles from "../styles/reservation.module.scss";
import styles from "../styles/main.module.scss";
import { ReservationDataShort } from "../lib/interfaces";
import Header from "../components/header";

interface Props {
  currentReservations: ReservationDataShort[];
}

const Main: FC<Props> = ({ currentReservations }) => {
  const router = useRouter();
  const [_data, setData] = useAppContext();
  const { t } = useTranslation("common");

  const initialValues = {
    date: null,
    numberOfGuests: null,
    numberOfTubs: null,
    price: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    paymentMethod: ""
  };

  const redirectToDetailsPage = (reservationData: ReservationWithDetails) => {
    setData(reservationData);
    router.replace("/details");
  };

  const onSubmit = (values: Reservation) => {
    const reservationData: ReservationWithDetails = {
      date: values.date,
      dateOfPurchase: new Date(),
      numberOfGuests: values.numberOfGuests,
      numberOfTubs: values.numberOfTubs,
      price: values.price,
      firstName: null,
      lastName: null,
      phoneNumber: null,
      email: null,
      address: null,
      city: null,
      country: null,
      postCode: null,
      whereYouHeard: { value: "", label: "" },
      paymentStatus: null,
      paymentMethod: null,
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

    return redirectToDetailsPage(reservationData);
  };

  return (
    <article className={styles.main}>
      <Header />
      <label className={reservationStyles.reservation__title}>
        <span>{t("index.reserveYourExperience")}</span>
      </label>
      <section className={styles.main__container}>
        <Formik<Reservation>
          initialValues={initialValues}
          onSubmit={(values) => {
            onSubmit(values);
          }}
          validationSchema={reservation}
          validateOnChange
        >
          {({ errors, dirty, handleSubmit }) => {
            return (
              <form onSubmit={handleSubmit}>
                <section className={reservationStyles.reservation}>
                  <ReservationDate currentReservations={currentReservations} />
                  <Options currentReservations={currentReservations} />
                  <Summary />
                  <button
                    className={classnames(
                      `${reservationStyles.reservation__button} ${reservationStyles.reservation__continue}`,
                      {
                        [reservationStyles.reservation__continue__enabled]: !!dirty && !Object.keys(errors).length
                      }
                    )}
                    type="submit"
                  >
                    {t("index.continue")}
                  </button>
                </section>
              </form>
            );
          }}
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
            numberOfTubs: res.numberOfTubs ?? null
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

export default memo(Main);
