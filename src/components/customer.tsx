import React, { ChangeEvent, FC, memo, useMemo } from "react";
import Select, { ActionMeta } from "react-select";
import classNames from "classnames";
import { useFormikContext } from "formik";
import { useTranslation } from "next-i18next";
import countryList from "react-select-country-list";

import { ReservationWithDetails } from "../lib/validation/validationInterfaces";

import customerStyles from "../styles/customer.module.scss";
import styles from "../styles/main.module.scss";

const Customer: FC = () => {
  const { t, i18n } = useTranslation("common");

  const options = useMemo(
    () => (i18n.language == "hu-HU" ? Object.values(countryList().native().nativeData) : countryList().getData()),
    []
  );

  const { values, errors, touched, handleChange, setFieldValue, setFieldTouched } =
    useFormikContext<ReservationWithDetails>();

  const onChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    setFieldTouched(e.target.name);
    setFieldValue(e.target.name, e.target.value);
  };

  const setOption = (
    option: { value: string; label: string },
    select: ActionMeta<{ value: string; label: string }>
  ) => {
    handleChange({ target: { name: select.name, value: option } });
  };

  const onChangeCountryInput = (option: { value: string; label: string }) => {
    setFieldValue("country", option);
  };

  const whereYouHeardOptions = [
    { value: "webSearch", label: t("customer.webSearch") },
    { value: "friendFamily", label: t("customer.friendOrFamily") },
    { value: "advertisement", label: t("customer.advertisement") },
    { value: "tripAdvisor", label: t("customer.tripAdvisor") },
    { value: "facebook", label: t("customer.facebook") },
    { value: "instagram", label: t("customer.instagram") },
    { value: "hotel", label: t("customer.hotel") }
  ];

  return (
    <>
      <div className={customerStyles.detailTitle}>
        <div
          className={classNames(`${styles.todoitem} ${styles.todoitem__one}`, {
            [styles.todoitem__done]: values.firstName && values.lastName
          })}
        />
        <label>{t("customer.personalInformation")}</label>
      </div>
      <div className={customerStyles.detail}>
        <input
          className={classNames(customerStyles.customer__input, {
            [customerStyles.customer__input__error]: errors.firstName && touched.firstName
          })}
          name="firstName"
          placeholder={t("customer.firstName")}
          type="text"
          onChange={onChangeInput}
        />
        <input
          className={classNames(customerStyles.customer__input, {
            [customerStyles.customer__input__error]: errors.lastName && touched.lastName
          })}
          name="lastName"
          placeholder={t("customer.lastName")}
          type="text"
          onChange={onChangeInput}
        />
      </div>

      <div className={customerStyles.detailTitle}>
        <div
          className={classNames(`${styles.todoitem} ${styles.todoitem__two}`, {
            [styles.todoitem__done]: values.email && values.phoneNumber
          })}
        />
        <label>{t("customer.contactInformation")}</label>
      </div>
      <input
        className={classNames(customerStyles.customer__input, {
          [customerStyles.customer__input__error]: errors.address && touched.address
        })}
        name="address"
        placeholder={t("customer.address")}
        type="text"
        onChange={onChangeInput}
      />
      <input
        className={classNames(customerStyles.customer__input, {
          [customerStyles.customer__input__error]: errors.city && touched.city
        })}
        name="city"
        placeholder={t("customer.city")}
        type="text"
        onChange={onChangeInput}
      />
      <input
        className={classNames(customerStyles.customer__input, {
          [customerStyles.customer__input__error]: errors.postCode && touched.postCode
        })}
        name="postCode"
        placeholder={t("customer.postCode")}
        type="text"
        onChange={onChangeInput}
      />
      <Select
        options={options}
        value={values.country}
        onChange={onChangeCountryInput}
        placeholder={t("customer.country")}
        styles={{
          container: (baseStyles) => ({
            ...baseStyles
          }),
          control: (baseStyles) => ({
            ...baseStyles,
            height: "64px",
            backgroundColor: "#343434",
            borderWidth: "1px",
            borderColor: touched.whereYouHeard && errors.whereYouHeard ? "red" : "#707070",
            cursor: "pointer !important",
            margin: "20px 0 0 25px",
            width: "650px",
            fontSize: "22px",
            fontWeight: "200",
            ":focus": { borderColor: "#707070" },
            ":hover": {
              borderColor: touched.whereYouHeard && errors.whereYouHeard ? "red" : "#707070",
              boxShadow: "0 0 0 0"
            },
            "@media only screen and (max-width: 500px)": {
              width: "450px"
            }
          }),
          singleValue: (baseStyles) => ({
            ...baseStyles,
            color: "white",
            marginLeft: "10px"
          }),
          menu: (baseStyles) => ({
            ...baseStyles,
            backgroundColor: "#343434",
            border: "1px solid #707070",
            borderRadius: "5px",
            marginLeft: "25px",
            fontSize: "22px",
            color: "white",
            paddingLeft: "10px",
            width: "650px",
            "@media only screen and (max-width: 500px)": {
              width: "450px"
            }
          }),
          menuList: (baseStyles) => ({
            ...baseStyles,
            maxHeight: "300px"
          }),
          option: (baseStyles) => ({
            ...baseStyles,
            backgroundColor: "#343434",
            borderRadius: "5px",
            display: "flex",
            alignItems: "center",
            fontWeight: "200",
            cursor: "pointer",
            paddingLeft: "10px"
          }),
          input: (baseStyles) => ({
            ...baseStyles,
            marginLeft: "12px",
            color: "white",
            textTransform: "capitalize"
          }),
          placeholder: (baseStyles) => ({
            ...baseStyles,
            marginLeft: "12px"
          })
        }}
      />
      <div className={customerStyles.detail}>
        <input
          className={classNames(customerStyles.customer__input, {
            [customerStyles.customer__input__error]: errors.email && touched.email
          })}
          name="email"
          placeholder={t("customer.email")}
          type="email"
          onChange={onChangeInput}
        />
      </div>
      <div className={customerStyles.detail}>
        <input
          className={classNames(customerStyles.customer__input, {
            [customerStyles.customer__input__error]: errors.phoneNumber && touched.phoneNumber
          })}
          name="phoneNumber"
          placeholder={t("customer.phone")}
          type="tel"
          onChange={onChangeInput}
        />
      </div>
      <div className={customerStyles.detailTitle}>
        <div
          className={classNames(`${styles.todoitem} ${styles.todoitem__three}`, {
            [styles.todoitem__done]: values.whereYouHeard?.value
          })}
        />
        <label>{t("customer.whereDidYouHearAboutUs")}</label>
      </div>
      <div className={customerStyles.detail}>
        <Select
          styles={{
            container: (baseStyles) => ({
              ...baseStyles
            }),
            control: (baseStyles) => ({
              ...baseStyles,
              height: "64px",
              backgroundColor: "#343434",
              borderWidth: "1px",
              borderColor: touched.whereYouHeard && errors.whereYouHeard ? "red" : "#707070",
              cursor: "pointer !important",
              margin: "20px 0 0 25px",
              width: "650px",
              fontSize: "22px",
              fontWeight: "200",
              ":focus": { borderColor: "#707070" },
              ":hover": {
                borderColor: touched.whereYouHeard && errors.whereYouHeard ? "red" : "#707070",
                boxShadow: "0 0 0 0"
              },
              "@media only screen and (max-width: 500px)": {
                width: "450px"
              }
            }),
            singleValue: (baseStyles) => ({
              ...baseStyles,
              color: "white"
            }),
            menu: (baseStyles) => ({
              ...baseStyles,
              backgroundColor: "#343434",
              border: "1px solid #707070",
              borderRadius: "5px",
              marginLeft: "25px",
              fontSize: "22px",
              color: "white",
              paddingLeft: "10px",
              width: "650px",
              "@media only screen and (max-width: 500px)": {
                width: "450px"
              }
            }),
            menuList: (baseStyles) => ({
              ...baseStyles,
              maxHeight: "auto"
            }),
            option: (baseStyles) => ({
              ...baseStyles,
              backgroundColor: "#343434",
              borderRadius: "5px",
              display: "flex",
              alignItems: "center",
              fontWeight: "200",
              cursor: "pointer",
              paddingLeft: "10px"
            }),
            placeholder: (baseStyles) => ({
              ...baseStyles,
              marginLeft: "12px"
            })
          }}
          options={whereYouHeardOptions}
          name="whereYouHeard"
          onChange={setOption}
          value={values.whereYouHeard.value ? values.whereYouHeard : null}
          placeholder={t("customer.select")}
          instanceId="where-you-heard"
          isSearchable={false}
        />
      </div>
      <div className={customerStyles.detailTitle}>
        <div className={classNames(`${styles.todoitem} ${styles.todoitem__done}`)} />
        <label>{t("customer.note")}</label>
      </div>
      <input
        className={customerStyles.customer__input}
        name="note"
        placeholder={t("customer.requirements")}
        type="text"
        onChange={onChangeInput}
      />
    </>
  );
};

export default memo(Customer);
