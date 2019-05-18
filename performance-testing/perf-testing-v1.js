require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const express = require('express');
const request = require('request');
const mongoose = require('mongoose');
const { PerformanceObserver, performance } = require('perf_hooks');

const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });
// console.log(MONGODB_URI)
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('db connected');
  initServer();
  startReadingStream();
  // populateCountries();
});

const PORT = process.env.PORT || 3000;
const FILE = 'Indicators-1500.csv';

const countrySchema = new mongoose.Schema({
  CountryName: { type: String, required: true },
  CountryCode: String,
  IndicatorName: String,
  IndicatorCode: String,
  Year: Number,
  Value: Number
});

const Country = mongoose.model('Country', countrySchema);

// const addCountry = (attributes) => {
//   const country = new Country(attributes);
//   country.save(function (err, country) {
//     if (err) return console.error(err);
//     // console.log('added ' + country.CountryName)
//   });
// };

let perfff;
const obs = new PerformanceObserver(items => {
  perfff = items.getEntries()[0].duration;
  console.log('PerformanceObserver A to B', items.getEntries()[0].duration);
  performance.clearMarks();
});
obs.observe({ entryTypes: ['measure'] });

function initServer() {
  const app = express();

  // dataset from https://www.kaggle.com/worldbank/world-development-indicators

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'sample-csvs', FILE));
  });
  console.log(`listening at ${PORT}`);
  app.listen(PORT);
}

function startReadingStream() {
  let i = 0;
  let j = 0;
  performance.mark('A');

  const d = new Date();
  const stats = { beginTime: d.toGMTString() };
  const req = request.get(`http://localhost:${PORT}`);
  const csvStream = csv.fromStream(req, { headers: true });
  csvStream
    .on('data', data => {
      // console.log(data)
      console.log('processing', i + j);
      csvStream.pause();
      Country.findOne({ CountryName: data.CountryName }, (err, country) => {
        if (country) {
          const newCountry = new Country(data);
          newCountry.save((err, newCountry) => {
            if (err) return console.error(err);
            console.log('add', i++);
          });
        } else {
          console.log(`ignore ${j++}`);
        }
        csvStream.resume();
      });
    })
    .on('end', () => {
      console.log('doneee!');
      // console.log(countryNames);
      console.log(`total adds${i}`);
      console.log(`total ignored${j}`);
      performance.mark('B');
      performance.measure('A to B', 'A', 'B');
      stats.added = i;
      stats.ignored = j;
      const e = new Date();
      stats.endTime = e.toGMTString();
      stats.perf = perfff;
      console.log(stats);
      fs.writeFile(
        `test-${e.toLocaleTimeString().replace(' ', '-')}-${FILE}`,
        JSON.stringify(stats, null, 4),
        (err) => {
          console.log(err);
          process.exit();
        },
      );
    });
}

function populateCountries() {
  // Country.findOne({ type: 'Togsdfso' }, function (err, country) {
  //   if (country) {
  //     console.log(country)
  //   } else {
  //     console.log('not found')
  //   }
  // });

  addCountry({ CountryName: 'Togo' });
  const random_countries = [
    'Togo',
    'Cabo Verde',
    'Croatia',
    'North America',
    'Namibia',
    'Middle East & North Africa (developing only)',
    'Nigeria',
    'Malta',
    'Paraguay',
    'Chile',
    'Turkmenistan',
    'Uzbekistan',
    'Europe & Central Asia (developing only)',
    'East Asia & Pacific (all income levels)',
    'Uruguay',
    'Finland',
    'Russian Federation',
    'Oman',
    'Latvia',
    'Ethiopia',
    'Samoa',
    'French Polynesia',
    'St. Martin (French part)',
    'Heavily indebted poor countries (HIPC)',
    'Cameroon',
    'Poland',
    'Uganda',
    'Afghanistan',
    'Peru',
    'Netherlands',
    'Dominican Republic',
    'Tuvalu',
    'Kosovo',
    'Niger',
    'Vietnam',
    'Antigua and Barbuda',
    'Grenada',
    'Euro area',
    'Malaysia',
    'Indonesia',
    'Benin',
    'San Marino',
    'Mozambique',
    'Pakistan',
    'Algeria',
    'Israel',
    'Turks and Caicos Islands',
    'Singapore',
    'Monaco',
    'Rwanda',
    'Bosnia and Herzegovina',
    'Andorra',
    'Chad',
    'Suriname',
    'Bahrain',
    'Kyrgyz Republic',
    'Barbados',
    'Montenegro',
    'Belize',
    'Cuba',
    'Tajikistan',
    'Sint Maarten (Dutch part)',
    'Hungary',
    'Turkey',
    'Marshall Islands',
    'Angola',
    'Jamaica',
    'Latin America & Caribbean (all income levels)',
    'Caribbean small states',
    'Saudi Arabia',
    'Maldives',
    'Guam',
    'United Arab Emirates',
    'Trinidad and Tobago',
    'Belarus',
    'American Samoa',
    'Cayman Islands',
    'Gabon',
    'Spain',
    'Tanzania',
    'Liechtenstein',
    'Moldova',
    'Austria',
    'Pacific island small states',
    'Madagascar',
    'Bolivia',
    'Curacao',
    'Somalia',
    'Brunei Darussalam',
    'France',
    'Serbia',
    'Guatemala',
    'United Kingdom',
    'Micronesia, Fed. Sts.',
    'Burkina Faso',
    'Bulgaria',
    'El Salvador',
    'Lower middle income',
    'Low & middle income',
    'Cyprus',
    'New Zealand',
    'Czech Republic',
    'OECD members',
    'Sao Tome and Principe',
    'Costa Rica',
    'South Africa',
    'Italy',
    'Puerto Rico'
  ];
  for (let i = 0; i < random_countries.length; i++) {
    addCountry({ CountryName: random_countries[i] });
  }
}
