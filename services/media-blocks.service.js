const { MediaBlock } = require('../models/media-block')

exports.findById = async (mediaBlockId) => {
  return MediaBlock.findById(mediaBlockId)
}

exports.findByNormalizedText = async (normalizedText) => {
  return MediaBlock.findOne({ normalizedText: normalizedText })
}
exports.findOrCreate = async (newMediaBlock) => {
  const normalizedText = newMediaBlock.rawText.toLowerCase()
  let mediaBlock = await MediaBlock.findOne({ normalizedText: normalizedText })

  if (!mediaBlock) {
    mediaBlock = new MediaBlock({
      normalizedText: newMediaBlock.rawText.toLowerCase(),
      rawText: newMediaBlock.rawText
    })
    mediaBlock = await mediaBlock.save()
  }

  return mediaBlock
}

exports.findOrCreateMediaBlocks = async (newPage, page) => {
  let mediaBlocks = []

  if (newPage.mediaBlocks) {
    await Promise.all(newPage.mediaBlocks.map(async (newMediaBlock) => {
      let mediaBlock = await this.findOrCreate(newMediaBlock)

      if (page && page.mediaBlocks && page.mediaBlocks.length) {
        if (!page.mediaBlocks.some(existingMediaBlock => existingMediaBlock._id.equals(mediaBlock._id))) {
          mediaBlocks.push(mediaBlock._id)
        }
      } else {
        mediaBlocks.push(mediaBlock._id)
      }
    }))
  }

  return mediaBlocks
}

exports.update = async (mediaBlock, newMediaBlock) => {
  mediaBlock.bslScript = newMediaBlock.bslScript
  mediaBlock.videoUri = newMediaBlock.videoUri

  return await mediaBlock.save()
}
