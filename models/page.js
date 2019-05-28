const Joi = require('joi')
const mongoose = require('mongoose')

const Page = mongoose.model('Page', new mongoose.Schema(
  {
    uri: {
      type: String,
      require: true
    },
    enabled: {
      type: Boolean,
      default: false
    },
    requested: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true
  }
))

function validatePage (page) {
  const schema = {
    uri: Joi.string().uri().required()
  }
  return Joi.validate(page, schema)
}

exports.Page = Page
exports.validate = validatePage
