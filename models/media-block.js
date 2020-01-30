const Joi = require('joi')
const mongoose = require('mongoose')

const { VideoSchema } = require('~models/video')

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
      type: String,
      default: ''
    },
    video: {
      type: VideoSchema
    },
    persisted: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ['untranslated', 'translating', 'translated', 'irrelevant', 'review'],
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
    bslScript: Joi.string().allow(''),
    status: Joi.string(),
    video: Joi.object().allow(null).allow('')
  }

  return Joi.validate(mediaBlock, schema)
}

exports.MediaBlockSchema = MediaBlockSchema
exports.MediaBlock = MediaBlock
exports.validateMediaBlock = validateMediaBlock
