'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const request = require('request');
const mongoose = require('mongoose');

const BATCH_SIZE = 10000;
const CSV_URL = process.env.CSV_URL;
const MONGODB_URI = process.env.MONGODB_URI;


const Order = require('./models/Order');
const Customer = require('./models/Customer');

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('db connected');
  Customer.find({}, function (err, customers) {
    if (err) throw err;
    streamCSV(new Set(customers.map(c => c.customerId)))
  });

});

function streamCSV(customerIdSet) {
  console.log(CSV_URL);
  var i = 0;
  var counter = 0;
  var totalInserted = 0;
  var bulkOrder = Order.collection.initializeUnorderedBulkOp();

  const req = request.get(CSV_URL);
  const csvStream = csv.fromStream(req, {headers: true});
  csvStream
    .on('data', (order) => {
      console.log('processing', ++i);
      if (customerIdSet.has(order.CountryName)) {
        counter++;
        console.log('add', i)
        bulkOrder.insert({
          orderId: order.CountryCode + i,
          customerId: order.CountryName,
          item: order.IndicatorCode,
          quantity: order.Year
      })};

      if (counter === BATCH_SIZE) {
        csvStream.pause();
        console.log('uploading...');
        bulkOrder.execute((err, result) => {
          if (err) throw err;
          totalInserted += counter;
          counter = 0;
          bulkOrder = Order.collection.initializeUnorderedBulkOp();
          csvStream.resume();
        });
      }
    })
    .on('end', function(){
      if (counter) {
        console.log('uploading...');
        bulkOrder.execute(function(err, result) {
          if (err) throw err;
          totalInserted += counter;
          console.log('a total of', totalInserted,'entries inserted')
          process.exit();
        });
      } else {
        console.log('a total of', totalInserted,'entries inserted')
        process.exit();
      }
  });
}