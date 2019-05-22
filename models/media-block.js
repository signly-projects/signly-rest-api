const mongoose = require('mongoose')

const Schema = mongoose.Schema

const siteSchema = new Schema({
  transcript : {
    type: String,
    require: true
  }
})

module.exports = mongoose.model('MediaBlock', siteSchema)
