const { Schema } = require("mongoose");

const FundsSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  availableFunds: {
    type: Number,
    default: 100000
  },
  usedFunds: {
    type: Number,
    default: 0
  },
  totalFunds: {
    type: Number,
    default: 100000
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = { FundsSchema }; 