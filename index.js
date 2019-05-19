#!/usr/bin/env node

require('dotenv').config();
const csv = require('fast-csv');
const request = require('request');
const mongoose = require('mongoose');
const { ArgumentParser } = require('argparse');

// importing helpers
const Order = require('./models/Order');
const Customer = require('./models/Customer');
const CSVProcessor = require('./CSVProcessor');
const DatabaseController = require('./DatabaseController');

// initialising variables
const args = getArgs();
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

function getArgs() {
  const parser = new ArgumentParser({
    version: '0.0.1',
    addHelp: true,
    description: 'argparser for csv-to-mongodb app'
  });
  parser.addArgument(['-c', '--csv-url'], {
    required: true,
    help: 'the url for the remote csv'
  });
  parser.addArgument(['-b', '--batch-size'], {
    defaultValue: 1000,
    help: 'batch size for inserting values in mongo database'
  });
  parser.addArgument(['-m', '--mongo-uri'], {
    help: 'uri to connect to mongo database'
  });
  parser.addArgument(['-r', '--resume-from'], {
    defaultValue: 0,
    help:
      'line number to resume the insertion from, in case the previous attempt was interrupted'
  });
  return parser.parseArgs();
}
