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
    pages: [{ type: Schema.Types.ObjectId, ref: 'Page' }]
  },
  {
    timestamps: true
  }
)

const Site = mongoose.model('Site', SiteSchema)

function validateSite (site) {
  const schema = {
    title: Joi.string().required(),
    url: Joi.string().uri().required()
  }
  return Joi.validate(site, schema)
}

exports.SiteSchema = SiteSchema
exports.Site = Site
exports.validateSite = validateSite
