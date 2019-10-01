const Joi = require('joi')
const mongoose = require('mongoose')

const VideoSchema = new mongoose.Schema(
  {
    uri: {
      type: String,
      default: ''
    },
    videoFile: {
      type: Object,
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
