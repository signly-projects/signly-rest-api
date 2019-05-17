const MongoDb = require('mongodb')

const getDb = require('../util/database').getDb

class Site {
  static get coll () {
    return 'sites'
  }

  constructor (title, url) {
    this.title = title
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
      .collection(this.coll)
      .find({
        _id: new MongoDb.ObjectId(siteId)
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
