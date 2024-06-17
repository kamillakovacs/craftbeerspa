import "react-day-picker/dist/style.css";
import React, { FC, memo } from "react";
import classnames from "classnames";
import { useFormikContext } from "formik";
import { useTranslation } from "next-i18next";

import { Reservation } from "../lib/validation/validationInterfaces";
import { ReservationDataShort } from "../lib/interfaces";
import Calendar from "./calendar";

import dateStyles from "../styles/reservationDate.module.scss";
import styles from "../styles/main.module.scss";


interface Props {
  currentReservations: ReservationDataShort[];
}


const ReservationDate: FC<Props> = ({ currentReservations }) => {
  const { values } = useFormikContext<Reservation>();
  const { t } = useTranslation("common");

  return (
    <section className={dateStyles.reservationDate}>
      <div className={dateStyles.reservationDate__label}>
        <div
          className={classnames(`${styles.todoitem} ${styles.todoitem__one}`, {
            [styles.todoitem__done]: values.date && values.date.getHours() !== 0
          })}
        />

        <label>{t("reservationDate.dateAndTime")}</label>
      </div>
      <Calendar currentReservations={currentReservations} />
    </section>
  );
};

export default memo(ReservationDate);
