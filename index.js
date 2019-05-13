#!/usr/bin/env node

'use strict';

require('dotenv').config();
const csv = require('fast-csv');
const request = require('request');
const mongoose = require('mongoose');
const ArgumentParser = require('argparse').ArgumentParser;

// initialising variables
const args = getArgs();
const CSV_URL = args.csv_url;
const BATCH_SIZE = args.batch_size;

// priority will be given if passing via console
const MONGODB_URI = args.mongo_uri || process.env.MONGODB_URI;

// importing models
const Order = require('./models/Order');
const Customer = require('./models/Customer');

// connecting to mongoDB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('db connected');
  Customer.find({}, function(err, customers) {
    if (err) throw err;
    // we get all the customers and create a set of their customerID
    streamCSV(new Set(customers.map(c => c.customerId)));
  });
});

function streamCSV(customerIdSet) {
  // variables for keeping count of entries processed
  var i = 0;
  var counter = 0;
  var totalInserted = 0;
  var bulkOrder = Order.collection.initializeUnorderedBulkOp();

  const req = request.get(CSV_URL);
  req.on('error', function(err) {
    console.error(err);
  });
  const csvStream = csv.fromStream(req, { headers: true });
  csvStream
    .on('data', order => {
      console.log('processing line', ++i);

      // we only insert the order if the customerId is in the database.
      if (customerIdSet.has(order.CountryName)) {
        bulkOrder.insert({
          orderId: order.CountryCode + i,
          customerId: order.CountryName,
          item: order.IndicatorCode,
          quantity: order.Year
        });
        console.log('add ', i);
        counter++;
      }

      // if 'BATCH_SIZE' number of elements are inserted in bulkOrder
      // then push them all to the database and update counters.
      if (counter == BATCH_SIZE) {
        csvStream.pause();
        console.log('PUSHINGGG!', counter);
        bulkOrder.execute(function(err, result) {
          if (err) console.log(err);
          totalInserted += counter;
          counter = 0;
          bulkOrder = Order.collection.initializeUnorderedBulkOp();
          csvStream.resume();
        });
      }
    })
    .on('end', function() {
      // process any operations that are presernt in the bulkOrder
      if (counter) {
        console.log('PUSHINGGG!', counter);
        bulkOrder.execute(function(err, result) {
          if (err) throw err;
          totalInserted += counter;
          console.log('a total of', totalInserted, 'entries inserted');
          process.exit();
        });
      } else {
        console.log('a total of', totalInserted, 'entries inserted');
        process.exit();
      }
    });
}

function getArgs() {
  var parser = new ArgumentParser({
    version: '0.0.1',
    addHelp: true,
    description: 'argparser for csv-to-mongodb app'
  });
  parser.addArgument(['-c', '--csv-url'], {
    required: true,
    help: 'the url for the remote csv'
  });
  parser.addArgument(['-b', '--batch-size'], {
    required: true,
    help: 'batch size for inserting values in mongo database'
  });
  parser.addArgument(['-m', '--mongo-uri'], {
    help: 'uri to connect to mongo database'
  });
  return parser.parseArgs();
}
