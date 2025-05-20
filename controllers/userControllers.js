const User = require('../models/user');
const Item = require('../models/items');
const Offer = require('../models/offer');

// Show register form
exports.renderRegister = (req, res) => {
  res.render('users/new');
};

// Handle registration
exports.create = (req, res, next) => {
  const user = new User(req.body);
  user.save()
  .then(user => {
    req.session.user = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    };
      req.flash('success', 'Registration successful! Welcome!');
      res.redirect('/users/profile');
    })
    .catch(err => {
      if (err.name === 'ValidationError') {
        req.flash('error', err.message);
        return res.redirect('/users/new');
      }
      if (err.code === 11000) {
        req.flash('error', 'Email is already in use');
        return res.redirect('/users/new');
      }
      next(err);
    });
};

// Show login form
exports.renderLogin = (req, res) => {
  res.render('users/login');
};

// Handle login
exports.login = (req, res, next) => {
  let { email, password } = req.body;
  User.findOne({ email })
  .then(user => {
    if (user && user.password === password) {
      req.session.user = {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      };

      req.flash('success', 'Logged in successfully!');
      res.redirect('/users/profile');
    } else {
        req.flash('error', 'Invalid email or password');
        res.redirect('/users/login');
      }
    })
    .catch(err => next(err));
};

// Show profile
exports.renderProfile = async (req, res, next) => {
  const userId = req.session.user;

  try {
    const items = await Item.find({ user: userId });
    const offers = await Offer.find({ user: userId }).populate('item');

    res.render('users/profile', {
      items,
      user: req.session.user,
      offers
    });
  } catch (err) {
    next(err);
  }
};


// Handle logout
exports.logout = (req, res, next) => {
    req.flash('success', 'Logged out successfully!');
    req.session.destroy(err => {
      if (err) return next(err);
      res.redirect('/');
    });
  };
  
  