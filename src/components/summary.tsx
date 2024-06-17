import React, { FC, memo } from "react";
import { useFormikContext } from "formik";
import { useTranslation } from "next-i18next";

import { Reservation } from "../lib/validation/validationInterfaces";

import detailsStyles from "../styles/details.module.scss";
import styles from "../styles/main.module.scss";
import summaryStyles from "../styles/summary.module.scss";
import { currencyFormat } from "../lib/util/currencyFormat";

const Summary: FC = () => {
  const { values } = useFormikContext<Reservation>();
  const { t } = useTranslation("common");

  return (
    <>
      <div className={summaryStyles.label}>
        <div className={styles.cart} />
        <label>{t("summary.youCanEnjoy")}</label>
      </div>

      <div className={summaryStyles.container}>
        <ul className={detailsStyles.detailsUl}>
          <li>{t("summary.exclusiveUse")}</li>
          <li>{t("summary.bath")}</li>
          <li>{t("summary.unlimitedBeer")}</li>
          <li>{t("summary.infraredSauna")}</li>
          <li>{t("summary.strawBed")}</li>
          <li>{t("summary.snacks")}</li>
          <li>{t("summary.towelsAndRobes")}</li>
        </ul>

        {values.price && (
          <div className={summaryStyles.total}>
            <div>
              {t("summary.total")} <span className={summaryStyles.vat}>{t("summary.vat")} </span>
            </div>
            <div>{currencyFormat.format(parseFloat(values.price))}</div>
          </div>
        )}
      </div>
    </>
  );
};

export default memo(Summary);
