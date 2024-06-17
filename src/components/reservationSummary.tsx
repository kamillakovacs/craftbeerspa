import { useTranslation } from "react-i18next";
import { FC, memo, useEffect, useState } from "react";

import detailsStyles from "../styles/details.module.scss";
import { ReservationWithDetails } from "../lib/validation/validationInterfaces";
import { PaymentStatus } from "../api/interfaces";
import { currencyFormat } from "../lib/util/currencyFormat";

interface Props {
  reservation: ReservationWithDetails;
  date: Date;
  price: string;
  paymentStatus?: PaymentStatus;
}

const ReservationSummary: FC<Props> = ({ reservation, date, price, paymentStatus }) => {
  const { t, i18n } = useTranslation("common");
  const [resDate, setResDate] = useState("");
  const [resPrice, setResPrice] = useState("");

  useEffect(() => {
    if (date) {
      setResDate(
        new Intl.DateTimeFormat(i18n.language, {
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "numeric"
        }).format(new Date(date))
      );
    }

    if (price && !paymentStatus) {
      setResPrice(currencyFormat.format(parseFloat(price)));
    }
  }, [setResDate, date, setResPrice, price, paymentStatus, i18n.language]);

  return (
    <div className={detailsStyles.details}>
      <div className={detailsStyles.details__row}>
        <div className={detailsStyles.details__rowLabel}>{t("reservationDetails.location")}</div>
        <div className={detailsStyles.details__rowLocation}>
          <div>{t("reservationDetails.craftBeerSpa")}</div>
          <div>{t("reservationDetails.szarvasko")}</div>
        </div>
      </div>
      <div className={detailsStyles.details__row}>
        <div className={detailsStyles.details__rowLabel}>{t("reservationDetails.tubsReserved")}</div>
        <div>{reservation?.numberOfTubs?.label}</div>
      </div>
      <div className={detailsStyles.details__row}>
        <div className={detailsStyles.details__rowLabel}>{t("reservationDetails.date")}</div>
        <div>{resDate}</div>
      </div>
      <div className={detailsStyles.details__row}>
        <div className={detailsStyles.details__rowLabel}>{t("reservationDetails.lengthOfStay")}</div>
        <div>{t("reservationDetails.hourAndFifteenMins")}</div>
      </div>
      {!paymentStatus && (
        <div className={detailsStyles.details__row}>
          <div>{t("reservationDetails.totalPrice")}:</div>
          <div>{resPrice}</div>
        </div>
      )}
    </div>
  );
};

export default memo(ReservationSummary);
