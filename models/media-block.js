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
    }
  },
  {
    timestamps: true
  }
)

const MediaBlock = mongoose.model('MediaBlock', MediaBlockSchema)

function validateMediaBlock (mediaBlock) {
  const schema = {
    rawText: Joi.string().required(),
    normalizedText: Joi.string(),
    bslScript: Joi.string(),
    videoUri: Joi.string().allow('', null)
  }

  return Joi.validate(mediaBlock, schema)
}

exports.MediaBlockSchema = MediaBlockSchema
exports.MediaBlock = MediaBlock
exports.validateMediaBlock = validateMediaBlock
