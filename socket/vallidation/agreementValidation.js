import { body, param } from 'express-validator';

export const createAgreementValidation = [
  body('seller_id')
    .notEmpty().withMessage('seller_id is required.')
    .isNumeric().withMessage('seller_id must be a numeric value.'),

  body('car_id')
    .notEmpty().withMessage('car_id is required.')
    .isNumeric().withMessage('car_id must be a numeric value.'),

  body('counter_price')
    .notEmpty().withMessage('counter_price is required.')
    .isNumeric().withMessage('counter_price must be a numeric value.')
];

export const addPurchaseAgreementValidation = [
  body('seller_id')
    .notEmpty().withMessage('seller_id is required.')
    .isNumeric().withMessage('seller_id must be a numeric value.'),

  body('car_id')
    .notEmpty().withMessage('car_id is required.')
    .isNumeric().withMessage('car_id must be a numeric value.')
];

export const counterAgreementValidation = [
  param('id')
    .notEmpty().withMessage('Agreement ID is required.')
    .isNumeric().withMessage('Agreement ID must be a numeric value.'),

  body('counter_price')
    .notEmpty().withMessage('counter_price is required.')
    .isNumeric().withMessage('counter_price must be a numeric value.')
];

export const signAgreementValidation = [
  param('id')
    .notEmpty().withMessage('Agreement ID is required.')
    .isNumeric().withMessage('Agreement ID must be a numeric value.')
];

export const cancelAgreementValidation = [
  param('id')
    .notEmpty().withMessage('Agreement ID is required.')
    .isNumeric().withMessage('Agreement ID must be a numeric value.')
];

export const rejectAgreementValidation = [
  param('id')
    .notEmpty().withMessage('Agreement ID is required.')
    .isNumeric().withMessage('Agreement ID must be a numeric value.')
];

export const agreementIdValidation = [
  param('id')
    .notEmpty().withMessage('Agreement ID is required.')
    .isNumeric().withMessage('Agreement ID must be a numeric value.')
];