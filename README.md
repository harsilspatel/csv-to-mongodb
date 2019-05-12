# csv-to-mongodb


## Performance testing
### Setup
1. World development dataset was used for testing which can be found on [Kaggle](https://www.kaggle.com/worldbank/world-development-indicators)
2. [Indicators.csv](https://www.kaggle.com/worldbank/world-development-indicators#Indicators.csv) was chosen as it is considerable large.
3. express.js is used to host the csv file locally. Thereby, the application streams the csv file from the initialised endpoint. (Doing so is analogous to getting the remote file from a url.)
4. One of the columns of the csv is CountryName. Randomly selected values of that column were retrieved and inserted in a test mongoDB database.
5. Thereafter, the file was streamed and only those entries for which the CountryName existed in the database were inserted in the database. (This is analogous to importing order only if customerId exists).
