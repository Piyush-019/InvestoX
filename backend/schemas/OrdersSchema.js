const { Schema } = require("mongoose");

const OrdersSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  name: String,
  qty: Number,
  price: Number,
  mode: String,
  status: {
    type: String,
    enum: ['open', 'executed'],
    default: 'open'
  },
  executedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = { OrdersSchema };
