const mongoose = require('mongoose');

class DatabaseController {
  constructor(uri) {
    this.uri = uri;
    this.bulkModelObject = null;
  }

  async connect(onFailure, onSuccess) {
    try {
      mongoose.connect(this.uri, { useNewUrlParser: true });
      this.db = mongoose.connection;
      this.db.on('error', onFailure);
      this.db.once('open', onSuccess);
    } catch (err) {
      throw err; // equivalent to not having try catch
    }
  }

  async insertIntoBulk(model, document, callback) {
    if (this.bulkModelObject == null) {
      this.bulkModelObject = model.collection.initializeUnorderedBulkOp();
    }
    await this.bulkModelObject.insert(document, callback);
    // callback(err, docs);
  }

  async executeBulk(model, callback) {
    if (this.bulkModelObject) {
      await this.bulkModelObject.execute(callback);
      this.bulkModelObject = model.collection.initializeUnorderedBulkOp();
      // this.bulkModelObject = model.collection.initializeUnorderedBulkOp();
      // callback(err, docs);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async query(model, attributes, callback) {
    await model.find(attributes, callback);
  }
}
DatabaseController.connect = mongoose.connect;
module.exports = DatabaseController;
