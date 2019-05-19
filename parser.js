const { ArgumentParser } = require('argparse');
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

module.exports = parser;
