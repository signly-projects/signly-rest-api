const mongodb = require('mongodb')

const getDb = require('../util/database').getDb

const coll = 'mediablocks'

class MediaBlock {
  constructor (transcript, id) {
    this.transcript = transcript
    this._id = new mongodb.ObjectId(id)
  }

  save () {
    const db = getDb()
    let dbOp

    if (this._id) {
      dbOp = db
        .collection(coll)
        .updateOne({ _id: this._id }, { $set: this })
    } else {
      dbOp = db
        .collection(coll)
        .insertOne(this)
    }

    return dbOp
      .then(result => {
        // eslint-disable-next-line no-console
        console.log(result)
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.log(err)
      })
  }

  static fetchAll () {
    const db = getDb()
    return db.collection(coll)
      .find()
      .toArray()
      .then(mediaBlocks => {
        // eslint-disable-next-line no-console
        console.log(mediaBlocks)
        return mediaBlocks
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.log(err)
      })
  }

  static findById (mediaBlock) {
    const db = getDb()
    return db
      .collection(coll)
      .find({
        _id: new mongodb.ObjectId(mediaBlock)
      })
      .next()
      .then(mediaBlock => {
        return mediaBlock
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.log(err)
      })
  }
}

module.exports = MediaBlock
