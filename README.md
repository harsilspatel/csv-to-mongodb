# csv-to-mongodb
[![Build Status](https://www.travis-ci.com/harsilspatel/csv-to-mongodb.svg?token=yLgWGY7CNm621frWpHzZ&branch=master)](https://www.travis-ci.com/harsilspatel/csv-to-mongodb)

</br>
A simple batch script to import items from remote csv and insert them in mongoDB. It does so by using the streaming the csv using the [request](https://github.com/request/request#streaming) and batch inserts items using mongoDB's [bulk()](https://docs.mongodb.com/manual/reference/method/Bulk) API.

## Development
### Code standardization
This project uses EditorConfig to standardize text editor configuration.
Visit https://editorconfig.org for more information.

### Linting
This project employees ESLint to detect suspicious code in JavaScript files.
Visit https://eslint.org for details.

### Testing
This projects uses AVA for testing.
Visit https://github.com/avajs/ava to know more about AVA.

## Performance testing
### Setup
1. World development dataset was used for testing which can be found on [Kaggle](https://www.kaggle.com/worldbank/world-development-indicators)
2. [Indicators.csv](https://www.kaggle.com/worldbank/world-development-indicators#Indicators.csv) was chosen as it is considerable large.
3. express.js is used to host the csv file locally. Thereby, the application streams the csv file from the initialised endpoint. (Doing so is analogous to getting the remote file from a url.)
4. One of the columns of the csv is CountryName. Randomly selected values of that column were retrieved and inserted in a test mongoDB database.
5. Thereafter, the file was streamed and only those entries for which the CountryName existed in the database were inserted in the database. (This is analogous to importing order only if customerId exists).

### Techniques
1. Get obj from steam -> Fetch one object from database with same CountryName -> If exists, insert the object from the stream.
2. Get obj from steam -> Count objects from database with same CountryName -> If any exist, insert the object from the stream.
3. Get all values from CountryName from database and create a set -> Get obj from stream -> If obj's CountryName is one of the values in the set. insert it into the database.
4. Get all values from CountryName from database and create a set -> Get obj from stream -> If obj's CountryName is one of the values in the set, push object into the Bulk() object (buffer) and push a batch at once.

### Stats

| Technique     | Items processed | Time (s)  | Memory | CPU | Items/second | Links | Screenshot|
| ------------- |:-------------:| -----:|-----:| -----:| -----:|  -----:| -----:|
| 1 | 1,500     |    262.378 | 1.3% | 0.3% | 5.72 | [🔗](/performance-testing/test-4.11.29-AM-Indicators-1500.json) | [📸](/performance-testing/v1-1.png) |
| 1 | 1,500     |    297.191 | 1.1% | 0.3% | 5.05 | [🔗](/performance-testing/test-5.10.02-AM-Indicators-1500.json) | [📸](/performance-testing/v1-2.png) |
| 2 | 1,500     |    258.899 | 0.9% | 0.3% | 5.81 | [🔗](/performance-testing/test-5.17.45-AM-Indicators-1500.json) | [📸](/performance-testing/v2-1.png) |
| 2 | 1,500     |    259.193 | 0.9% | 0.3% | 5.79 | [🔗](/performance-testing/test-5.23.40-AM-Indicators-1500.json) | [📸](/performance-testing/v2-2.png) |
| 3 | 1,500     |    74.589 | 1.2% | 0.3% | 20.13| [🔗](/performance-testing/test-5.44.47-AM-Indicators-1500.json) | [📸](/performance-testing/v3-1.png) |
| 3 | 1,500     |    73.902 | 2.2% | 0.3% | 20.29 | [🔗](/performance-testing/test-5.46.13-AM-Indicators-1500.json) | [📸](/performance-testing/v3-2.png) |
| 4 | 15,000      |    20.102 |  135% | 2.4% | 746.226 | [🔗](/performance-testing/test-6.28.00-AM-Indicators-15000.json) | [📸](v4-1.png) |
| 4 | 150,000     |    206.733 | 184% | 10% | 728.15 | [🔗](/performance-testing/test-6.37.26-AM-Indicators-150000.json) | [📸](v4-2.png) |
| 4 | 15,000      |  17.929 | 41% | 2.1% | 882.35 | [🔗](/performance-testing/test-11.41.37-AM-Indicators-15000.json) | [📸](v4-3.png) |

Please note that these tests were done on my laptop in a non isolated environment, i.e. other applications were running while the testing was being performed. However, since all the tests were performed under similar circumstances, we are assuming that the stats, such as time, will be affected by the same factor in all the tests performed.

It should also be noted that the CPU consumptions were recorded when the Bulk() is being pushed, i.e. at it's peak performance. If the script is simply pushing the objects onto bulk's buffer, it does not consume more than ~2% CPU.

Clearly, using bulk() is the most efficient method and thereby that's the one implemented in the application.

## Usage
1. Clone the repo.
2. Run `npm install` to install dependencies.
3. `chmod +x index.js` for execution permissions. (Or can be called using node).
4. `./index.js {arguments}`

### CLI Arguments
`-c`, `--csv-url`: the url for the remote csv (required) </br>
`-b`, `--batch-size`: batch size for inserting values in mongo database (required) </br>
`-m`, `--mongo-uri`: uri to connect to mongo database (can even have it in .env) </br>
`-r`, `--resume-from`: line number to resume the insertion from, in case the previous attempt was interrupted </br>


## Challenge two
### Algorithm
1. Group orders by customerId
2. Try to completely fill van(s) with one customer's orders.
3. If at any point we cannot fill a van using that customer's order, we do NOT put them in a van. We repeat this for all customers.
4. The leftover orders of all customers can be packed in a van, this ensures that space usage is optimised.


#### Reflections
Below listed are some of the things that I could've done better:
1. Document everything by Nodejs standards
2. Have a stricter linter (could've used [airbnb-base](https://www.npmjs.com/package/eslint-config-airbnb-base))
3. Have tests for first challenge. Although, I have been testing it thoroughly using my [sample-csvs](https://github.com/harsilspatel/csv-to-mongodb/tree/master/sample-csvs), however, automated tests would've been good.
4. Could've tested all functions seperately in knapsack.
5. Knapsack could've had more functional-programming techniques. (Feel free to checkout my [ohHell](https://github.com/harsilspatel/ohHell) and [pong](https://github.com/harsilspatel/pong-breakout) to assess my functional programming skills :D)
