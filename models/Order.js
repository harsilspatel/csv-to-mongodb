const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    require: true,
    unique: true
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
  }
});
var Order = mongoose.model('Order', orderSchema);
module.exports = Order;