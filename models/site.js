const mongoose = require('mongoose')

const Schema = mongoose.Schema

const siteSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  url : {
    type: String,
    require: true
  }
})

module.exports = mongoose.model('Site', siteSchema)
