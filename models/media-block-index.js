const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)
const { Schema, model } = require('mongoose')

const MediaBlockIndexSchema = new Schema(
  {
    index: {
      type: Number,
      required: true
    },
    mediaBlock: {
      type: Schema.Types.ObjectId,
      ref: 'MediaBlock'
    },
    page: {
      type: Schema.Types.ObjectId,
      ref: 'Page'
    }
  },
  {
    timestamps: true
  }
)

const MediaBlockIndex = model('MediaBlockIndex', MediaBlockIndexSchema)

function validateMediaBlockIndex (mediaBlockIndex) {
  const schema = {
    index: Joi.number().required(),
    mediaBlock: Joi.objectId(),
    page: Joi.objectId()
  }
  return Joi.validate(mediaBlockIndex, schema)
}

exports.MediaBlockIndexSchema = MediaBlockIndexSchema
exports.MediaBlockIndex = MediaBlockIndex
exports.validateMediaBlockIndex = validateMediaBlockIndex
