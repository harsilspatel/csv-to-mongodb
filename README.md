# csv-to-mongodb
A simple batch script to import items from remote csv and insert them in mongoDB. It does so by using the streaming the csv using the [request](https://github.com/request/request#streaming) and batch inserts items using mongoDB's [bulk()](https://docs.mongodb.com/manual/reference/method/Bulk) API.

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

| Technique     | Items processed | Time (s)  | Memory | CPU | Items/second |
| ------------- |:-------------:| -----:|-----:| -----:| -----:|
| 1 | 1,500     |    297.191 | 1.1% | 0.3% | 5.05 |
| 2 | 1,500     |    262.378 | 1.3% | 0.3% | 5.72 |
| 2 | 1,500     |    258.899 | 0.9% | 0.3% | 5.81 |
| 2 | 1,500     |    259.193 | 0.9% | 0.3% | 5.79 |
| 3 | 1,500     |    74.589 | 1.2% | 0.2% | 20.13|
| 3 | 1,500     |    73.902 | 2.2% | 0.3% | 20.29 |
| 4 | 15,000      |    20.102 |  135% | 2.4% | 746.226 |
| 4 | 150,000     |    206.733 | 184% | 10% | 728.15 |
| 4 | 15,000      |  17.929 | 41% | 2.1% | 882.35 |

Please note that these tests were done on my laptop in a non isolated environment, i.e. other applications were running while the testing was being performed. However, since all the tests were performed under similar circumstances, we are assuming that the stats, such as time, will be affected by the same factor in all the tests performed.

It should also be noted that the CPU consumptions were recorded when the Bulk() is being pushed, i.e. at it's peak performance. If the script is simply pushing the objects onto bulk's buffer, it does not consume more than ~2% CPU.

Clearly, using bulk() is the most efficient method and thereby that's the one implemented in the application.

### Usage
1. Clone the repo.
2. Run `npm install` to install dependencies.
3. `chmod +x index.js` for execution permissions. (Or can be called using node).
4. `./index.js {arguments}`

#### CLI Arguments
`-c`, `--csv-url`: the url for the remote csv (required) </br>
`-b`, `--batch-size`: batch size for inserting values in mongo database (required) </br>
`-m`, `--mongo-uri`: uri to connect to mongo database (can even have it in .env) </br>


