const Item = require('../models/items');

exports.isGuest = (req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  res.redirect('/users/profile');
};
exports.isLoggedIn = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.redirect('/users/login');
};
exports.isSeller = (req, res, next) => {
    const itemId = req.params.id;
      Item.findById(itemId)
      .then(item => {
        if (!item) {
          let err = new Error('Item not found');
          err.status = 404;
          return next(err);
        }
        if (item.user.toString() !== req.session.user._id.toString()) {
          let err = new Error('Unauthorized: You are not the seller.');
          err.status = 401;
          return next(err);
        }
          next();
      })
      .catch(err => next(err));
};
  
