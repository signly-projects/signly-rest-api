const Joi = require('joi')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SiteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    url: {
      type: String
    },
    approved: {
      type: Boolean,
      default: false
    },
    pages: [{ type: Schema.Types.ObjectId, ref: 'Page' }]
  },
  {
    timestamps: true
  }
)

const Site = mongoose.model('Site', SiteSchema)

function validateSite (site) {
  const schema = {
    title: Joi.string(),
    url: Joi.string().uri(),
    approved: Joi.boolean()
  }
  return Joi.validate(site, schema)
}

exports.SiteSchema = SiteSchema
exports.Site = Site
exports.validateSite = validateSite
