const { body } = require('express-validator');
const validator = require('validator');

const allowedConditions = ['new', 'used', 'like new', 'refurbished'];

exports.validateNewUser = [
  body('email').trim().normalizeEmail().isEmail().withMessage('Invalid email address'),

  body('password').isLength({ min: 8, max: 64 }).withMessage('Password must be 8-64 characters long'),

  body('firstName').trim().escape().notEmpty().withMessage('First name is required'),
  body('lastName').trim().escape().notEmpty().withMessage('Last name is required')
];

exports.validateNewItem = [
  body('title').trim().escape().notEmpty().withMessage('Title is required'),
  body('condition').trim().isIn(allowedConditions).withMessage('Invalid condition'),
  body('price').trim().isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
  body('details').trim().escape().notEmpty().withMessage('Details are required')
];

exports.validateOffer = [
  body('amount').trim().isFloat({ gt: 0 }).withMessage('Offer amount must be greater than 0')
];
