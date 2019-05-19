#!/usr/bin/env node

require('dotenv').config();
const csv = require('fast-csv');
const request = require('request');
const mongoose = require('mongoose');
const { ArgumentParser } = require('argparse');

// importing models
const Order = require('./models/Order');
const Customer = require('./models/Customer');
const DatabaseController = require('./DatabaseController');

// initialising variables
const args = getArgs();
const CSV_URL = args.csv_url;
const BATCH_SIZE = args.batch_size;
const RESUME_FROM = args.resume_from;

// priority will be given if passing via console
const MONGODB_URI = args.mongo_uri || process.env.MONGODB_URI;



const controller = new DatabaseController(MONGODB_URI, BATCH_SIZE);
controller.connect(() => console.error('failure'), () => {
  controller.query(Customer, {}, (err, customers) => {
    if (err) throw err;
    // we get all the customers and create a set of their customerID
    streamCSV(new Set(customers.map(c => c.customerId)));
  });
});



// connecting to mongoDB
// mongoose.connect(MONGODB_URI, { useNewUrlParser: true });
// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', () => {
//   console.log('db connected');
//   Customer.find({}, (err, customers) => {
//     if (err) throw err;
//     // we get all the customers and create a set of their customerID
//     streamCSV(new Set(customers.map(c => c.customerId)));
//   });
// });

async function streamCSV(customerIdSet) {
  // variables for keeping count of entries processed
  let i = 0; // to keep count of lines
  let counter = 0; // to keep count of values in the bulk()
  let totalInserted = 0; // to keep track of total items inserted
  let bulkOrder = Order.collection.initializeUnorderedBulkOp();

  const req = request.get(CSV_URL);
  req.on('error', (err) => {
    console.error(err);
  });
  const csvStream = csv.fromStream(req, { headers: true });
  csvStream
    .on('data', (order) => {
      i++;
      if (i >= RESUME_FROM) {
        console.log('processing line', i);
        // we only insert the order if the customerId is in the database.
        if (customerIdSet.has(order.customerId)) {
          controller.insertIntoBulk(Order, order);
          // bulkOrder.insert(order);
          counter++
          console.log('add ', counter);
        }

        // if 'BATCH_SIZE' number of elements are inserted in bulkOrder
        // then push them all to the database and update counters.
        if (counter == BATCH_SIZE) {
          csvStream.pause();
          console.log('PUSHINGGG!', counter);
          controller.executeBulk(Order, (err, result) => {
            if (err) console.log(err);
            totalInserted += counter;
            counter = 0;
            csvStream.resume();
          })
        }
      }
    })
    .on('end', () => {
      // process any operations that are presernt in the bulkOrder
      if (counter) {
        console.log('PUSHINGGG!', counter);
        controller.executeBulk(Order, (err, result) => {
          if (err) throw err;
          totalInserted += counter;
          console.log('a total of', totalInserted, 'entries inserted');
          process.exit();
        })
      } else {
        console.log('a total of', totalInserted, 'entries inserted');
        process.exit();
      }
    });
}

function getArgs() {
  const parser = new ArgumentParser({
    version: '0.0.1',
    addHelp: true,
    description: 'argparser for csv-to-mongodb app',
  });
  parser.addArgument(['-c', '--csv-url'], {
    required: true,
    help: 'the url for the remote csv',
  });
  parser.addArgument(['-b', '--batch-size'], {
    required: true,
    help: 'batch size for inserting values in mongo database',
  });
  parser.addArgument(['-m', '--mongo-uri'], {
    help: 'uri to connect to mongo database',
  });
  parser.addArgument(['-r', '--resume-from'], {
    defaultValue: 0,
    help:
      'line number to resume the insertion from, in case the previous attempt was interrupted',
  });
  return parser.parseArgs();
}
