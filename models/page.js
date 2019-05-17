const MongoDb = require('mongodb')

const getDb = require('../util/database').getDb

class Page {
  static get coll () {
    return 'pages'
  }

  constructor (url) {
    this.url = url
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
      .collection(this.coll)
      .find({
        _id: new MongoDb.ObjectId(pageId)
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
}

module.exports = Page
