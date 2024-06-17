require("dotenv").config();
const { i18n } = require("./next-i18next.config");

const path = require("path");
const Dotenv = require("dotenv-webpack");

module.exports = {
  i18n,
  webpack: (config) => {
    config.resolve.fallback = { ...config.resolve.fallback, net: false, os: false };
    config.module.rules.push({
      test: /\.html$/i,
      loader: "html-loader"
    });
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"]
    });
    config.plugins.push(new Dotenv({ silent: true }));
    return config;
  },
  env: {
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    BARION_GET_PAYMENT_STATE_URL: process.env.BARION_GET_PAYMENT_STATE_URL,
    MAILGUN_EMAIL_ADDRESS: process.env.MAILGUN_EMAIL_ADDRESS,
    MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN,
    MAILGUN_API_KEY: process.env.MAILGUN_API_KEY,
    BARION_POS_KEY: process.env.BARION_POS_KEY,
    BARION_PAYEE: process.env.BARION_PAYEE,
    BARION_PAYMENT_REQUEST_URL: process.env.BARION_PAYMENT_REQUEST_URL,
    BARION_TRACE_ID_URL: process.env.BARION_TRACE_ID_URL,
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
    FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
    FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
    BARION_PAYMENT_REDIRECT_URL: process.env.BARION_PAYMENT_REDIRECT_URL,
    BARION_PAYMENT_CALLBACK_URL: process.env.BARION_PAYMENT_CALLBACK_URL,
    BARION_PAYMENT_REFUND_URL: process.env.BARION_PAYMENT_REFUND_URL,
    MAILSERSEND_API_KEY: process.env.MAILSERSEND_API_KEY
  }
};
