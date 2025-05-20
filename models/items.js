const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Offer = require('./offer');

// schema for items
const itemSchema = new Schema({
  title: { 
    type: String, 
    required: [true, 'Title is required']
  },
  condition: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"] 
  },
  details: { 
    type: String, 
    required: [true, 'Content is required'], 
    minLength: [10, 'The content should be at least 10 characters long'] 
  },
  image: { 
    type: String, 
    default: '/uploads/default.jpg',
    match: [/^\/uploads\/.*\.(jpg|png|gif)$/, "Invalid image format"]
  },
  offers: { 
    type: Number, 
    default: 0,
    min: [0, "Offers cannot be negative"] 
  },
  active: { 
    type: Boolean, 
    default: true 
  },
  totalOffers: {
    type: Number,
    default: 0
  },
  highestOffer: {
    type: Number,
    default: 0
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

itemSchema.pre('findOneAndDelete', async function(next) {
  const itemId = this.getQuery()['_id'];
  await Offer.deleteMany({ item: itemId });
  next();
});


module.exports = mongoose.model('Item', itemSchema);
