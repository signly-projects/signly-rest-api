const mongodb = require('mongodb')

const getDb = require('../util/database').getDb

const coll = 'mediablocks'

class MediaBlock {
  constructor (transcript, id) {
    this.transcript = transcript
    this._id = id ? new mongodb.ObjectId(id) : null  
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

  static deleteById (mediaBlockId) {
    const db = getDb()
    return db
      .collection(coll)
      .deleteOne({
        _id: new mongodb.ObjectId(mediaBlockId)
      })
      .then(() => {
        // eslint-disable-next-line no-console
        console.log('Media block deleted.')
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.log(err)
      })
  }
}

module.exports = MediaBlock
