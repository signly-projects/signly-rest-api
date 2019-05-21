const mongodb = require('mongodb')

const getDb = require('../util/database').getDb

const coll = 'sites'
class Site {
  constructor (title, url, id) {
    this.title = title
    this.url = url
    this._id = new mongodb.ObjectId(id)
  }

  save () {
    const db = getDb()
    let dbOp

    if (this._id) {
      dbOp = db
        .collection('sites')
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
      .then(sites => {
        // eslint-disable-next-line no-console
        console.log(sites)
        return sites
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.log(err)
      })
  }

  static findById (siteId) {
    const db = getDb()
    return db
      .collection(coll)
      .find({
        _id: new mongodb.ObjectId(siteId)
      })
      .next()
      .then(site => {
        return site
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.log(err)
      })
  }
}

module.exports = Site
