const MongoDb = require('mongodb')

const getDb = require('../util/database').getDb

class MediaBlock {
  static get coll () {
    return 'mediablocks'
  }

  constructor (transcript, videoUrl, bslScript) {
    this.transcript = transcript
    this.videoUrl = videoUrl
    this.bslScript = bslScript
  }

  save () {
    const db = getDb()
    return db.collection(this.coll)
      .insertOne(this)
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
    return db.collection(this.coll)
      .find()
      .toArray()
      .then(mediablocks => {
        // eslint-disable-next-line no-console
        console.log(mediablocks)
        return mediablocks
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.log(err)
      })
  }

  static findById (mediaBlockId) {
    const db = getDb()
    return db
      .collection(this.coll)
      .find({
        _id: new MongoDb.ObjectId(mediaBlockId)
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
