const getDb = require('../util/database').getDb

class Page {
  constructor (url) {
    this.url = url
  }

  save () {
    const db = getDb()
    return db.collection('pages')
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
    return db.collection('pages')
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
}

module.exports = Page
