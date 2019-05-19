const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    require: true,
    unique: false, // ideally, this should be true, however, what it was discovered that in our sample csvs there were a number of entries with same customerId and orderId causing the program to crash.
  },
  customerId: {
    type: String,
    require: true,
  },
  item: {
    type: String,
    require: true,
  },
  quantity: {
    type: Number,
    require: true,
  },
});
const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
