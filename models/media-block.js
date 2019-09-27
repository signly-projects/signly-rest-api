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
      type: String
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
  const videoSchema = {
    uri: Joi.string().uri().allow(null).allow('')
  }

  const schema = {
    rawText: type === 'create' ? Joi.string().required() : Joi.string(),
    normalizedText: Joi.string(),
    bslScript: Joi.string(),
    status: Joi.string(),
    video: Joi.object(videoSchema).allow(null).allow('')
  }

  return Joi.validate(mediaBlock, schema)
}

exports.MediaBlockSchema = MediaBlockSchema
exports.MediaBlock = MediaBlock
exports.validateMediaBlock = validateMediaBlock
