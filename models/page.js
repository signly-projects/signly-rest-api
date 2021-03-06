const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)
const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
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
      default: true
    },
    requested: {
      type: Number,
      default: 1
    },
    visitCounter: {
      type: Number,
      default: 0
    },
    translated: {
      type: Boolean,
      default: false
    },
    signit: {
      type: Boolean,
      default: false
    },
    site: SiteSchema,
    mediaBlocks: [{ type: Schema.Types.ObjectId, ref: 'MediaBlock' }],
    mediaBlocksIndexes: [Schema.Types.Mixed]
  },
  {
    timestamps: true
  }
)
PageSchema.plugin(mongoosePaginate)

const Page = mongoose.model('Page', PageSchema)

function validatePage (page, type = 'create') {
  const mediaBlockSchema = {
    index: Joi.number(),
    rawText: Joi.string().required(),
    bslScript: Joi.string().allow(''),
    status: Joi.string(),
    video: Joi.object().allow(null).allow('')
  }

  const schema = {
    uri: type === 'create' ? Joi.string().uri().required() : Joi.string().uri(),
    enabled: Joi.boolean(),
    requested: Joi.number(),
    visitCounter: Joi.number(),
    translated: Joi.boolean(),
    site: Joi.objectId(),
    title: Joi.string(),
    mediaBlocks: Joi.array().items(Joi.object(mediaBlockSchema).allow(null).allow(''))
  }
  return Joi.validate(page, schema)
}

exports.PageSchema = PageSchema
exports.Page = Page
exports.validatePage = validatePage
