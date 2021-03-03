const Joi = require('joi')
const mongoose = require('mongoose')

const VideoSchema = new mongoose.Schema(
  {
    uri: {
      type: String,
      default: null
    },
    videoFile: {
      type: Object,
      default: null
    },
    encodingState: {
      type: String,
      default: 'None'
    },
    amsIdentifier: {
      type: String,
      default: null
    },
    amsIdentifiers: [{
      type: String
    }],
    translatorEmail: {
      type: String,
      default: null
    },
    translatorFullName: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
)

const Video = mongoose.model('Video', VideoSchema)

function validateVideo (video) {
  const schema = {
    uri: Joi.string().uri().allow(null).allow('')
  }
  return Joi.validate(video, schema)
}

exports.VideoSchema = VideoSchema
exports.Video = Video
exports.validateVideo = validateVideo
