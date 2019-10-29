const Joi = require('joi')
const mongoose = require('mongoose')

const MediaBlockSchema = new mongoose.Schema(
  {
    rawText: {
      type: String,
      required: true
    },
    normalizedText: {
      type: String
    },
    bslScript: {
      type: String
    },
    videoUri: {
      type: String
    },
    persisted: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ['untranslated', 'translating', 'translated'],
      default: 'untranslated'
    }
  },
  {
    timestamps: true
  }
)

const MediaBlock = mongoose.model('MediaBlock', MediaBlockSchema)

function validateMediaBlock (mediaBlock, type = 'create') {
  const schema = {
    rawText: type === 'create' ? Joi.string().required() : Joi.string(),
    normalizedText: Joi.string(),
    bslScript: Joi.string(),
    status: Joi.string(),
    videoUri: Joi.string().uri().allow('', null)
  }

  return Joi.validate(mediaBlock, schema)
}

exports.MediaBlockSchema = MediaBlockSchema
exports.MediaBlock = MediaBlock
exports.validateMediaBlock = validateMediaBlock
