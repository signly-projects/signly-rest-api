const Joi = require('joi')
const mongoose = require('mongoose')

const MediaBlockSchema = new mongoose.Schema(
  {
    transcript: {
      type: String,
      required: true
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
    transcript: Joi.string().required(),
    bslScript: Joi.string().required(),
    videoUri: Joi.string().uri().required()
  }

  return Joi.validate(mediaBlock, schema)
}

module.exports.MediaBlockSchema = MediaBlockSchema
module.exports.MediaBlock = MediaBlock
module.exports.validateMediaBlock = validateMediaBlock
