const { validationResult } = require('express-validator');

exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(err => err.msg);
    req.flash('error', messages.join(' '));
    return res.redirect('back');
  }
  next();
};
