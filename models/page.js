const Joi = require('joi')
const mongoose = require('mongoose')

const { SiteSchema } = require('./site')
const { MediaBlockSchema } = require('./media-block')

const PageSchema = new mongoose.Schema(
  {
    uri: {
      type: String,
      required: true
    },
    enabled: {
      type: Boolean,
      default: false
    },
    requested: {
      type: Number,
      default: 1
    },
    site: SiteSchema,
    mediaBlocks: [MediaBlockSchema],
  },
  {
    timestamps: true
  }
)

const Page = mongoose.model('Page', PageSchema)

function validatePage (page) {
  const schema = {
    uri: Joi.string().uri().required(),
    enabled: Joi.boolean(),
    requested: Joi.number(),
    site: Joi.objectId(),
    mediaBlocks: Joi.array(),
  }
  return Joi.validate(page, schema)
}

exports.PageSchema = PageSchema
exports.Page = Page
exports.validate = validatePage
