#!/usr/bin/env node

require('dotenv').config();
const csv = require('fast-csv');
const request = require('request');
const mongoose = require('mongoose');

// importing helpers
const parser = require('./lib/parser');
const Order = require('./models/Order');
const Customer = require('./models/Customer');
const CSVProcessor = require('./lib/CSVProcessor');
const DatabaseController = require('./lib/DatabaseController');

// initialising variables
const args = parser.parseArgs();
const processor = new CSVProcessor(
  args.csv_url,
  args.batch_size,
  args.resume_from
);

// priority will be given if passing via console
const MONGODB_URI = args.mongo_uri || process.env.MONGODB_URI;

const controller = new DatabaseController(MONGODB_URI);
controller.connect(
  () => console.error('failure'),
  () => {
    controller.query(Customer, {}, (err, customers) => {
      if (err) throw err;
      // we get all the customers and create a set of their customerID
      processor.processCSV(controller, Order, new Set(customers.map(c => c.customerId)));
    });
  }
);
