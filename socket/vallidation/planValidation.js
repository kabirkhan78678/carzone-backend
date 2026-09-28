import { body, param } from 'express-validator';

export const purchaseSlotPlanValidation = [
  body('plan_id')
    .notEmpty().withMessage('plan_id is required.')
    .isNumeric().withMessage('plan_id must be a numeric value.')
];

export const requestSlotValidation = [
  body('slot_count')
    .optional({ nullable: true, checkFalsy: true })
    .isNumeric().withMessage('slot_count must be a numeric value.'),
  body('plan_id')
    .optional({ nullable: true, checkFalsy: true })
    .isNumeric().withMessage('plan_id must be a numeric value.')
];

export const renewPlanValidation = [
  body('user_plan_id')
    .optional({ nullable: true, checkFalsy: true })
    .isNumeric().withMessage('user_plan_id must be a numeric value.'),
  body('plan_id')
    .optional({ nullable: true, checkFalsy: true })
    .isNumeric().withMessage('plan_id must be a numeric value.')
];

export const renewSummaryValidation = [
  param('user_plan_id')
    .notEmpty().withMessage('user_plan_id is required.')
    .isNumeric().withMessage('user_plan_id must be a numeric value.')
];