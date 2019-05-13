# csv-to-mongodb


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



| Technique     | Items processed | Time (ms)  | Memory | CPU |
| ------------- |:-------------:| -----:|-----:| -----:|
| 1 | 1,500     |    297191 | 1.1% | 0.3% |
| 2 | 1,500     |    262378 | 1.3% | 0.3% |
| 2 | 1,500     |    258899 | 0.9% | 0.3% |
| 2 | 1,500     |    259193 | 0.9% | 0.3% |
| 3 | 1,500     |    74589 | 1.2% | 0.2% |
| 3 | 1,500     |    73902 | 2.2% | 0.3% |
| 4 | 15,000      |    20102 |  135% | 2.4% |
| 4 | 150,000     |    206733 | 184% | 10% |
| 4 | 15,000      |  17929 | 41% | 2.1% |
