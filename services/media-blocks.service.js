const { MediaBlock } = require('~models/media-block')
const { Video } = require('~models/video')

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
  if (newMediaBlock.hasOwnProperty('video')) {
    if (newMediaBlock.video) {
      if (mediaBlock.video) {
        mediaBlock.video.uri = newMediaBlock.video.uri
        mediaBlock.markModified('video.uri')
      } else {
        mediaBlock.video = new Video({ uri: newMediaBlock.video.uri })
      }
    }
  }

  mediaBlock.bslScript = newMediaBlock.bslScript

  if (mediaBlock.video && mediaBlock.video.uri) {
    mediaBlock.status = 'translated'
  } else {
    mediaBlock.status = newMediaBlock.status || 'untranslated'
  }

  return await mediaBlock.save()
}
