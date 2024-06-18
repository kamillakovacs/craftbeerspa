import React, { FC, memo, useEffect, useState } from "react";
import { useTranslation } from "next-i18next";

import thanksStyles from "../styles/thanks.module.scss";
import detailsStyles from "../styles/details.module.scss";

import CalendarCheckIcon from "../../public/assets/calendar-check.svg";
import HeartIcon from "../../public/assets/heart.svg";
import HottubIcon from "../../public/assets/hottub.svg";
import ReservationSummary from "./reservationSummary";
import { PaymentStatus } from "../api/interfaces";
import EditReservation from "./editReservation";

import { CanceledBy, ReservationDataShort } from "../lib/interfaces";
import { ReservationWithDetails } from "../lib/validation/validationInterfaces";

import { currencyFormat } from "../lib/util/currencyFormat";

interface Props {
  reservation: ReservationWithDetails;
  currentReservations: ReservationDataShort[];
}

const ReservationDetails: FC<Props> = ({ reservation, currentReservations }) => {
  const { t, i18n } = useTranslation("common");
  const [dateOfPurchase, setDateOfPurchase] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    if (reservation?.dateOfPurchase) {
      setDateOfPurchase(
        new Intl.DateTimeFormat(reservation.language, {
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "numeric"
        }).format(new Date(reservation?.dateOfPurchase))
      );
    }

    if (reservation?.price) {
      setPrice(currencyFormat.format(parseFloat(reservation?.price)));
    }
  }, [reservation?.dateOfPurchase, setDateOfPurchase, reservation?.price, setPrice, reservation.language]);

  return (
    <article className={thanksStyles.container}>
      <label className={thanksStyles.reservation__title}>
        <span>
          {reservation?.canceled ? (
            <div className={thanksStyles.reservation__canceled}>
              <span>{t("thanks.thisReservationWasCanceled")}</span>
              <span>{t("thanks.contactUsForARefund")}</span>
            </div>
          ) : (
            t("thanks.thankYou")
          )}
        </span>
      </label>
      <div className={thanksStyles.reservation}>
        <div className={thanksStyles.reservation__summary}>
          <div className={thanksStyles.summaryLabel}>
            <div className={thanksStyles.icon}>
              <CalendarCheckIcon />
            </div>
            <label>{t("summary.details")}</label>
          </div>
          <ReservationSummary
            reservation={reservation}
            date={reservation?.date}
            price={price}
            paymentStatus={reservation?.paymentStatus}
          />

          <div className={thanksStyles.summaryLabel}>
            <div className={thanksStyles.icon}>
              <CalendarCheckIcon />
            </div>
            <label>{t("reservationDetails.billingDetails")}</label>
          </div>
          <div className={detailsStyles.details}>
            <div className={detailsStyles.details__row}>
              <div>{t("customer.name")}:</div>
              <div>
                {reservation?.firstName} {reservation?.lastName}
              </div>
            </div>
            <div className={detailsStyles.details__row}>
              <div>{t("customer.email")}:</div>
              <div>{reservation?.email}</div>
            </div>
            <div className={detailsStyles.details__row}>
              <div>{t("customer.phone")}:</div>
              <div>{reservation?.phoneNumber}</div>
            </div>
            <div className={detailsStyles.details__row}>
              <div>{t("reservationDetails.totalPrice")}:</div>
              <div>{price}</div>
            </div>
            <div className={detailsStyles.details__row}>
              <div>{t("reservationDetails.paymentStatus")}:</div>
              <div>
                {reservation.paymentStatus == PaymentStatus.Succeeded
                  ? t("reservationDetails.paid")
                  : t("reservationDetails.outstanding")}
              </div>
            </div>
            <div className={detailsStyles.details__row}>
              <div>{t("reservationDetails.dateOfPurchase")}:</div>
              <div>{dateOfPurchase}</div>
            </div>
          </div>

          <div className={thanksStyles.summaryLabel}>
            <div className={thanksStyles.icon}>
              <HottubIcon />
            </div>
            <label>{t("summary.yourExperience")}</label>
          </div>
          <div className={detailsStyles.details}>
            <ul className={detailsStyles.detailsUl}>
              <li>{t("summary.exclusiveUse")}</li>
              <li>{t("summary.bath")}</li>
              <li>{t("summary.unlimitedBeer")}</li>
              <li>{t("summary.infraredSauna")}</li>
              <li>{t("summary.strawBed")}</li>
              <li>{t("summary.snacks")}</li>
              <li>{t("summary.towelsAndRobes")}</li>
            </ul>
          </div>

          <div className={thanksStyles.summaryLabel}>
            <div className={thanksStyles.icon}>
              <HeartIcon />
            </div>
            <label>{t("reservationDetails.lookForwardToSeeingYou")}</label>
          </div>
        </div>
      </div>
      {!reservation.canceled && <EditReservation reservation={reservation} currentReservations={currentReservations} />}
    </article>
  );
};

export default memo(ReservationDetails);
