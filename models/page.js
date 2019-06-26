const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)
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
    mediaBlocks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MediaBlock' }],
  },
  {
    timestamps: true
  }
)

const Page = mongoose.model('Page', PageSchema)

function validatePage (page, type = 'create') {
  const schema = {
    uri: type === 'create' ? Joi.string().uri().required() : Joi.string().uri(),
    enabled: Joi.boolean(),
    requested: Joi.number(),
    site: Joi.objectId(),
    mediaBlocks: Joi.array().items(Joi.object({ rawText: Joi.string().required() }).allow(null).allow(''))
  }
  return Joi.validate(page, schema)
}

exports.PageSchema = PageSchema
exports.Page = Page
exports.validatePage = validatePage
