const csv = require('fast-csv');
const request = require('request');

class CSVProcessor {
  constructor(csvUrl, batchSize, resumeFrom) {
    this.lineCount = 0;
    this.csvUrl = csvUrl;
    this.entriesInserted = 0;
    this.batchSize = batchSize;
    this.resumeFrom = resumeFrom;
  }

  async processCSV(controller, model, customerIdSet) {
    // console.log(customerIdSet);
    // process.exit()
    // variables for keeping count of entries processed
    let counter = 0; // to keep count of values in the bulk()
    this.lineCount = 0; // to keep count of lines
    this.entriesInserted = 0; // to keep track of total items inserted

    const req = request.get(this.csvUrl);
    req.on('error', err => {
      console.error(err);
    });
    const csvStream = csv.fromStream(req, { headers: true });
    csvStream
      .on('data', order => {
        this.lineCount++;
        if (this.lineCount >= this.resumeFrom) {
          console.log(`processing line #${this.lineCount}`);

          // we only insert the order if the customerId is in the database.
          if (customerIdSet.has(order.customerId)) {
            controller.insertIntoBulk(model, order);

            // bulkOrder.insert(order);
            counter++;
            console.log(`items in bulk ${counter}`);
          }

          // if 'BATCH_SIZE' number of elements are inserted in bulkOrder
          // then push them all to the database and update counters.
          if (counter == this.batchSize) {
            csvStream.pause();
            console.log(`PUSHINGGG! ${counter} items`);
            controller.executeBulk(model, (err, result) => {
              if (err) throw err;
              this.entriesInserted += counter;
              counter = 0;
              csvStream.resume();
            });
          }
        }
      })
      .on('end', () => {
        // process any operations that are presernt in the bulkOrder
        if (counter) {
          console.log(`PUSHINGGG! ${counter} items`);
          controller.executeBulk(model, (err, result) => {
            if (err) throw err;
            this.entriesInserted += counter;
            console.log('a total of', this.entriesInserted, 'entries inserted');
            process.exit();
          });
        } else {
          console.log('a total of', this.entriesInserted, 'entries inserted');
          process.exit();
        }
      });
  }
}

module.exports = CSVProcessor;
