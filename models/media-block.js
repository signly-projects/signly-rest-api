const Joi = require('joi')
const mongoose = require('mongoose')

const MediaBlockSchema = new mongoose.Schema(
  {
    rawText: {
      type: String,
      required: true
    },
    transcript: {
      type: String
    },
    bslScript: {
      type: String
    },
    videoUri: {
      type: String
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
    transcript: Joi.string(),
    bslScript: Joi.string(),
    videoUri: Joi.string().uri()
  }

  return Joi.validate(mediaBlock, schema)
}

exports.MediaBlockSchema = MediaBlockSchema
exports.MediaBlock = MediaBlock
exports.validateMediaBlock = validateMediaBlock
