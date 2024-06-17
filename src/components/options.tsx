import React, { FC, memo, useEffect } from "react";
import Select, { ActionMeta } from "react-select";
import classNames from "classnames";
import { useFormikContext } from "formik";
import { useTranslation } from "next-i18next";

import HottubIcon from "../../public/assets/hottub.svg";
import PeopleIcon from "../../public/assets/people.svg";
import { Reservation } from "../lib/validation/validationInterfaces";

import optionStyles from "../styles/options.module.scss";
import styles from "../styles/main.module.scss";
import { ReservationDataShort } from "../lib/interfaces";

interface Props {
  currentReservations: ReservationDataShort[];
}

const Options: FC<Props> = ({ currentReservations }) => {
  const { values, touched, setFieldValue, setFieldTouched } = useFormikContext<Reservation>();
  const { t } = useTranslation("common");
  const AVAILABLE_TUBS = 3;
  const reservationsSelectedOnDateAndTime =
    currentReservations &&
    Object.values(currentReservations).filter((res) => {
      if (!values.date) {
        return [];
      }

      let selectedDateAndTime = new Date(
        values.date.getFullYear(),
        values.date.getMonth(),
        values.date.getDate(),
        values.date.getHours()
      );
      let reservationDateAndTime = new Date(res.date);
      let reservationDate = new Date(
        reservationDateAndTime.getFullYear(),
        reservationDateAndTime.getMonth(),
        reservationDateAndTime.getDate(),
        reservationDateAndTime.getHours()
      );
      return reservationDate.toISOString() === selectedDateAndTime.toISOString();
    });

  useEffect(() => {
    if (values.numberOfGuests) {
      setFieldValue("numberOfTubs", null);
      resetIconColor(".numberOfTubs");
    }
  }, [values.numberOfGuests, setFieldValue]);

  useEffect(() => {
    const setPrice = () => {
      switch (values.numberOfTubs.label) {
        case t("options.oneTub"):
          return process.env.NEXT_PUBLIC_ONE_ONE_PRICE;
        case t("options.twoPeopleInOneTub"):
          return process.env.NEXT_PUBLIC_TWO_ONE_PRICE;
        case t("options.twoPeopleInTwoTubs"):
          return process.env.NEXT_PUBLIC_TWO_TWO_PRICE;
        case t("options.threePeopleInTwoTubs"):
          return process.env.NEXT_PUBLIC_THREE_TWO_PRICE;
        case t("options.threePeopleInThreeTubs"):
          return process.env.NEXT_PUBLIC_THREE_THREE_PRICE;
        case t("options.fourPeopleInTwoTubs"):
          return process.env.NEXT_PUBLIC_FOUR_TWO_PRICE;
        case t("options.fourPeopleInThreeTubs"):
          return process.env.NEXT_PUBLIC_FOUR_THREE_PRICE;
        case t("options.threeTubs"):
          return values.numberOfGuests.value === 5
            ? process.env.NEXT_PUBLIC_FIVE_THREE_PRICE
            : process.env.NEXT_PUBLIC_SIX_THREE_PRICE;
      }
    };

    if (values.numberOfTubs) {
      setFieldValue("price", setPrice());
    }
  }, [values.numberOfTubs, values.numberOfGuests, setFieldValue, t]);

  const numberOfAvailableTubs = (): number => {
    if (!reservationsSelectedOnDateAndTime) {
      return 3;
    }

    let tubsReserved = 0;
    reservationsSelectedOnDateAndTime.forEach((res) => (tubsReserved += res.numberOfTubs?.value));
    return AVAILABLE_TUBS - tubsReserved;
  };

  const numberOfGuestsOptions = [
    { value: 1, label: t("options.onePerson") },
    { value: 2, label: t("options.twoPeople") },
    { value: 3, label: t("options.threePeople") },
    { value: 4, label: t("options.fourPeople") },
    { value: 5, label: t("options.fivePeople") },
    { value: 6, label: t("options.sixPeople") }
  ];

  const availableNumberOfGuestsOptions = numberOfGuestsOptions.filter(
    (option) => numberOfAvailableTubs() * 2 >= option.value
  );

  const onePersonTubOptions = [{ value: 1, label: t("options.oneTub") }];
  const twoPeopleTubOptions = [
    { value: 1, label: t("options.twoPeopleInOneTub") },
    { value: 2, label: t("options.twoPeopleInTwoTubs") }
  ];
  const threePeopleTubOptions = [
    { value: 2, label: t("options.threePeopleInTwoTubs") },
    { value: 3, label: t("options.threePeopleInThreeTubs") }
  ];
  const fourPeopleTubOptions = [
    { value: 2, label: t("options.fourPeopleInTwoTubs") },
    { value: 3, label: t("options.fourPeopleInThreeTubs") }
  ];
  const fivePeopleTubOptions = [{ value: 3, label: t("options.threeTubs") }];
  const sixPeopleTubOptions = [{ value: 3, label: t("options.threeTubs") }];

  const availableTubOptions = (
    tubOptions: {
      value: number;
      label: string;
    }[]
  ) => tubOptions.filter((option) => numberOfAvailableTubs() >= option.value);

  const getTubOptions = () => {
    if (!values.numberOfGuests) {
      return [];
    } else {
      switch (values.numberOfGuests.value) {
        case 1:
          return availableTubOptions(onePersonTubOptions);
        case 2:
          return availableTubOptions(twoPeopleTubOptions);
        case 3:
          return availableTubOptions(threePeopleTubOptions);
        case 4:
          return availableTubOptions(fourPeopleTubOptions);
        case 5:
          return availableTubOptions(fivePeopleTubOptions);
        case 6:
          return availableTubOptions(sixPeopleTubOptions);
      }
    }
  };

  const setOption = (
    option: { value: number; label: string },
    select: ActionMeta<{ value: number; label: string }>
  ) => {
    setFieldValue(select.name, option);
    setFieldTouched(select.name);
    colorIconGreen(select.name);
  };

  const colorIconGreen = (selector: string) =>
    ((document.querySelector(`.${selector}`) as HTMLElement).style.fill = "#00d531");

  const resetIconColor = (selector: string) => ((document.querySelector(selector) as HTMLElement).style.fill = "white");

  return (
    <>
      <div className={optionStyles.options}>
        <div
          className={classNames(`${styles.todoitem} ${styles.todoitem__two}`, {
            [styles.todoitem__done]:
              values.numberOfGuests && values.numberOfTubs && touched.numberOfGuests && touched.numberOfTubs
          })}
        />
        <div className={optionStyles.options__tubsLabel}>
          <label>{t("options.numberOfPeopleAndTubs")}</label>
        </div>
      </div>

      <div className={optionStyles.options__container}>
        <div className={optionStyles.options__box}>
          <div className={styles.iconContainer}>
            <PeopleIcon className={classNames(`${optionStyles.options__icon} numberOfGuests`)} />
          </div>
          <Select
            className={optionStyles.select}
            options={availableNumberOfGuestsOptions}
            placeholder={<>{values.numberOfGuests ? values.numberOfGuests.label : t("options.selectGuests")}</>}
            name="numberOfGuests"
            onChange={setOption}
            value={values.numberOfGuests}
            instanceId="number-of-guests"
            isSearchable={false}
            noOptionsMessage={() => t("options.noOptions")}
          />
          <div className={styles.iconContainer}>
            <HottubIcon className={classNames(`${optionStyles.options__icon} numberOfTubs`)} />
          </div>
          <Select
            styles={{
              container: (baseStyles) => ({
                ...baseStyles,
                ":focus-visible": { outline: "none" },
                "@media only screen and (max-width: 500px)": {
                  marginLeft: "20px",
                  width: "450px"
                }
              }),
              control: (baseStyles) => ({
                ...baseStyles,
                width: "297px",
                height: "64px",
                backgroundColor: "#343434",
                fontSize: "20px",
                fontWeight: "200",
                border: "1px solid #707070",
                outline: "none",
                ":focus": { borderColor: "#707070" },
                ":hover": { borderColor: "#707070", boxShadow: "0 0 0 1px #707070" },
                "@media only screen and (max-width: 500px)": {
                  width: "auto"
                }
              }),
              valueContainer: (baseStyles) => ({
                ...baseStyles,
                backgroundColor: "#343434",
                borderRadius: "5px",
                marginLeft: "50px",
                "@media only screen and (max-width: 500px)": {
                  marginLeft: "5px"
                }
              }),
              singleValue: (baseStyles) => ({
                ...baseStyles,
                color: "white"
              }),
              placeholder: (baseStyles) => ({
                ...baseStyles,
                color: "white",
                "@media only screen and (max-width: 500px)": {
                  marginLeft: "2px"
                }
              }),
              indicatorSeparator: (baseStyles) => ({
                ...baseStyles,
                display: "none"
              }),
              menu: (baseStyles) => ({
                ...baseStyles,
                backgroundColor: "#343434",
                borderRadius: "5px",
                fontSize: "20px",
                fontWeight: "200",
                border: "1px solid #707070",
                boxShadow: "0 0 0 0"
              }),
              option: (baseStyles) => ({
                ...baseStyles,
                backgroundColor: "#343434",
                display: "flex",
                alignItems: "center",
                fontWeight: "200",
                cursor: "pointer",
                paddingLeft: "10px"
              })
            }}
            // className={optionStyles.select}
            options={getTubOptions()}
            placeholder={<>{values.numberOfTubs ? values.numberOfTubs.label : t("options.selectTubs")}</>}
            name="numberOfTubs"
            onChange={setOption}
            value={values.numberOfTubs}
            instanceId="number-of-tubs"
            isSearchable={false}
            noOptionsMessage={() => t("options.noOptions")}
          />
        </div>
      </div>
    </>
  );
};

export default memo(Options);
