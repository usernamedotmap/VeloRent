import dotevn from "dotenv";
dotevn.config();



const required = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variables ${key}`);
  return value;
};

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 4000,
  MONGODB_URI: required("MONGODB_URI"),
  BASE_PATH: process.env.BASE_PATH,

  PAYMONGO_SECRET_KEY: required("PAYMONGO_SECRET_KEY"),
  PAYMONGO_PUBLIC_KEY: required("PAYMONGO_PUBLIC_KEY"),
  PAYMONGO_WEBHOOK_SECRET: required("PAYMONGO_WEBHOOK_SECRET"),
  DEV_EMAIL_OVERRIDE: process.env.DEV_EMAIL_OVERRIDE || "",

  TEST_PAYMONGO_SECRET_KEY: required("TEST_PAYMONGO_SECRET_KEY"),
  TEST_PAYMONGO_PUBLIC_KEY: required("TEST_PAYMONGO_PUBLIC_KEY"),
  TEST_PAYMONGO_WEBHOOK_SECRET: required("TEST_PAYMONGO_WEBHOOK_SECRET"),

  GMAIL_USER: required("GMAIL_USER"),
  GMAIL_APP_PASSWORD: required("GMAIL_APP_PASSWORD"),
  GMAIL_FROM_NAME: process.env.GMAIL_FROM_NAME || "VeloRent",

  IPROGSMS_API_KEY: required("IPROGSMS_API_KEY"),
  
  MQTT_HIVE_MQ_PORT: required("MQTT_HIVE_MQ_PORT"),
  MQTT_WEBSOCKET_PORT: required("MQTT_WEBSOCKET_PORT"),
  MQTT_HOST: process.env.MQTT_HOST ?? '',
  MQTT_USERNAME: process.env.MQTT_USERNAME ?? '',
  MQTT_PASSWORD: process.env.MQTT_PASSWORD ?? '',

  JWT_ACCESS_SECRET: required("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: required("JWT_REFRESH_SECRET"),
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || "15m",
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || "7d",
  COOKIE_SECRET: required("COOKIE_SECRET"),

  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN,

  CRON_SECRET_KEY: process.env.CRON_SECRET_KEY ?? '',

  IS_PROD: process.env.NODE_ENV === "production",
};
