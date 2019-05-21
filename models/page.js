const mongodb = require('mongodb')

const getDb = require('../util/database').getDb

const coll = 'pages'
class Page {
  constructor (url, id) {
    this.url = url
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
      .then(pages => {
        // eslint-disable-next-line no-console
        console.log(pages)
        return pages
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.log(err)
      })
  }

  static findById (pageId) {
    const db = getDb()
    return db
      .collection(coll)
      .find({
        _id: new mongodb.ObjectId(pageId)
      })
      .next()
      .then(page => {
        return page
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.log(err)
      })
  }

  static deleteById (pageId) {
    const db = getDb()
    return db
      .collection(coll)
      .deleteOne({
        _id: new mongodb.ObjectId(pageId)
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

module.exports = Page
