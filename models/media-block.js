const getDb = require('../util/database').getDb

class MediaBlock {
  constructor (transcript, videoUrl, bslScript) {
    this.transcript = transcript
    this.videoUrl = videoUrl
    this.bslScript = bslScript
  }

  save () {
    const db = getDb()
    return db.collection('mediablocks')
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
    return db.collection('mediablocks')
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
}

module.exports = MediaBlock
