const getDb = require('../util/database').getDb

class Site {
  constructor (title, url) {
    this.title = title
    this.url = url
  }

  save () {
    const db = getDb()
    return db.collection('sites')
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
    return db.collection('sites')
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
}

module.exports = Site
