const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const { SiteSchema } = require('~models/site')

const PageSchema = new Schema(
  {
    title: {
      type: String
    },
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
    mediaBlocks: [{ type: Schema.Types.ObjectId, ref: 'MediaBlock' }]
  },
  {
    timestamps: true
  }
)

const Page = mongoose.model('Page', PageSchema)

function validatePage (page, type = 'create') {
  const mediaBlockSchema = {
    rawText: Joi.string().required(),
    videoUri: Joi.string().allow(null, '').uri()
  }

  const schema = {
    uri: type === 'create' ? Joi.string().uri().required() : Joi.string().uri(),
    enabled: Joi.boolean(),
    requested: Joi.number(),
    site: Joi.objectId(),
    title: Joi.string(),
    mediaBlocks: Joi.array().items(Joi.object(mediaBlockSchema).allow(null).allow(''))
  }
  return Joi.validate(page, schema)
}

exports.PageSchema = PageSchema
exports.Page = Page
exports.validatePage = validatePage
