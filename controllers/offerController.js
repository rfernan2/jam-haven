const Offer = require('../models/offer');
const Item = require('../models/items');
const User = require('../models/user');

exports.createOffer = async (req, res, next) => {
  const itemId = req.params.itemId;

  try {
    if (!req.session.user) {
      return res.redirect('/users/login');
    }

    const item = await Item.findById(itemId).populate('user');
    if (!item) {
      const err = new Error('Item not found');
      err.status = 404;
      return next(err);
    }

    // Check if the logged-in user is the seller
    if (req.session.user._id == item.user._id.toString()) {
      const err = new Error("You cannot make an offer on your own item.");
      err.status = 401;
      return next(err);
    }

    const { amount } = req.body;

    const offer = new Offer({
      amount,
      user: req.session.user._id,
      item: itemId
    });

    await offer.save();

    // Update item: increment totalOffers and possibly update highestOffer
    await Item.findByIdAndUpdate(itemId, {
      $inc: { totalOffers: 1 },
      $max: { highestOffer: amount }
    });

    req.flash('success', 'Offer submitted!');
    res.redirect(`/items/${itemId}`);
  } catch (err) {
    next(err);
  }
};

exports.viewOffers = async (req, res, next) => {
    const itemId = req.params.itemId;
  
    try {
      if (!req.session.user) {
        return res.redirect('/users/login');
      }
  
      const item = await Item.findById(itemId).populate('user');
  
      if (!item) {
        const err = new Error('Item not found');
        err.status = 404;
        return next(err);
      }
  
      // Only the seller can view offers
      if (item.user._id.toString() !== req.session.user._id) {
        const err = new Error("You are not authorized to view offers for this item.");
        err.status = 401;
        return next(err);
      }
  
      const offers = await Offer.find({ item: itemId }).populate('user');
  
      res.render('offers/offers', { item, offers });
  
    } catch (err) {
      next(err);
    }
  };

  exports.acceptOffer = async (req, res, next) => {
    const { itemId, offerId } = req.params;
  
    try {
      if (!req.session.user) {
        return res.redirect('/users/login');
      }
  
      const item = await Item.findById(itemId).populate('user');
      if (!item) {
        const err = new Error("Item not found");
        err.status = 404;
        return next(err);
      }
  
      // Check if the logged-in user is the seller
      if (item.user._id.toString() !== req.session.user._id) {
        const err = new Error("You are not authorized to accept offers on this item.");
        err.status = 401;
        return next(err);
      }
  
      // 1. Set item as inactive
      item.active = false;
      await item.save();
  
      // 2. Accept the selected offer
      await Offer.findByIdAndUpdate(offerId, { status: 'accepted' });
  
      // 3. Reject all other pending offers
      await Offer.updateMany(
        { item: itemId, _id: { $ne: offerId }, status: 'pending' },
        { $set: { status: 'rejected' } }
      );
  
      req.flash('success', 'Offer accepted. Item marked as unavailable.');
      res.redirect(`/items/${itemId}/offers`);
  
    } catch (err) {
      next(err);
    }
  };
  