'use strict';

const path = require('path');
const csv = require('fast-csv');
const express = require('express');
const request = require('request');
const { PerformanceObserver, performance } = require('perf_hooks');


const app = express();
const PORT = process.env.PORT || 3000;
const FILE = 'Indicators.csv';

const obs = new PerformanceObserver((items) => {
  console.log('PerformanceObserver A to B',items.getEntries()[0].duration);
  performance.clearMarks();
});
obs.observe({ entryTypes: ['measure'] });

console.log('listening at ' + PORT);
performance.mark('A');


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "sample-csvs", FILE));
});
app.listen(PORT)

var countryNames = new Set();
const req = request.get('http://localhost:' + PORT);

var i = 0
csv.fromStream(req, {headers: true})
  .on("data", function(data){
        console.log(i++);
        countryNames.add(data.CountryName);
  })
  .on("end", function(){
    console.log('doneee!');
    console.log(countryNames);
    performance.mark('B');
    performance.measure('A to B', 'A', 'B');
    process.exit();
  });
