const mongoose = require('mongoose');
const customerSchema = new mongoose.Schema({
  customerId: {
    type: String,
    require: true,
    unique: true
  },
  firstName: {
    type: String,
    require: true,
  },
  lastName: {
    type: String,
    require: false,
  }
});
var Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;