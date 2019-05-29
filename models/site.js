const Joi = require('joi')
const mongoose = require('mongoose')

const SiteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    url: {
      type: String
    }
  },
  {
    timestamps: true
  }
)

const Site = mongoose.model('Site', SiteSchema)

function validateSite (site) {
  const schema = {
    title: Joi.string().required(),
    uri: Joi.string().uri().required(),
  }
  return Joi.validate(site, schema)
}

module.exports.SiteSchema = SiteSchema
module.exports.Site = Site
module.exports.validateSite = validateSite