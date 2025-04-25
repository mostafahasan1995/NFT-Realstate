import * as Joi from 'joi';
import {version} from '../../../../package.json';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  MONGO_URI: Joi.string().required(),
  SECRET_KEY: Joi.string().required(),
  API_KEY: Joi.string().required(),
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  EMAIL: Joi.string().email().required(),
  PASSWORD: Joi.string().required(),
  AWS_KEY_ID: Joi.string().required(),
  AWS_REGION: Joi.string().required(),
  AWS_PUBLIC_BUCKET: Joi.string().required(),
  AWS_STREAM_BUCKET: Joi.string().required(),
  AWS_INVOICE_BUCKET: Joi.string().required(),
  AWS_SES_SENDER: Joi.string().required(),
  WALLET_PUBLIC_KEY: Joi.string().required(),
  WALLET_PRIVATE_KEY: Joi.string().required(),
  VVERSE_EMAIL: Joi.string().email().required(),
  VVERSE_PASSWORD: Joi.string().required(),
  SENTRY_DSN: Joi.string().required(),
  SENTRY_RELEASE: Joi.string().default(version),
  BITRIX24_CLIENT_ID: Joi.string().required(),
  BITRIX24_CLIENT_SECRET: Joi.string().required(),
});
