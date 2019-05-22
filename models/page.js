const mongoose = require('mongoose')

const Schema = mongoose.Schema

const siteSchema = new Schema(
  {
    url : {
      type: String,
      require: true
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Page', siteSchema)
