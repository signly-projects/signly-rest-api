const mongoose = require('mongoose')
const { deleteFile } = require('~utils/storage')
const { MediaBlock } = require('~models/media-block')
const { Video } = require('~models/video')
const AzureService = require('~services/azure.service')

const MAX_ITEMS = 100

exports.countAll = async () => {
  return MediaBlock.countDocuments()
}

exports.findAll = async (query) => {
  const { limit, search } = query

  let searchQuery = {
    $or: [
      {
        rawText: {
          $regex: search || '',
          $options: 'i'
        }
      }
    ]
  }

  const validId = mongoose.Types.ObjectId.isValid(search)

  if (validId) {
    searchQuery.$or.push({ _id: mongoose.Types.ObjectId(search) })
  }

  const itemLimit = limit ? parseInt(limit, 10) : MAX_ITEMS

  return await MediaBlock.find(searchQuery).sort({ updatedAt: 'desc' }).limit(itemLimit)
}

const findById = async (mediaBlockId) => {
  return MediaBlock.findById(mediaBlockId)
}
exports.findById = findById

exports.findByNormalizedText = async (normalizedText) => {
  return MediaBlock.findOne({ normalizedText: normalizedText })
}

exports.findOrCreate = async (newMediaBlock) => {
  const normalizedText = newMediaBlock.rawText.toLowerCase()
  let mediaBlock = await MediaBlock.findOne({ normalizedText: normalizedText })

  if (!mediaBlock) {
    mediaBlock = new MediaBlock({
      normalizedText: newMediaBlock.rawText.toLowerCase(),
      rawText: newMediaBlock.rawText,
      bslScript: newMediaBlock.bslScript || '',
      status: newMediaBlock.status || 'untranslated',
      video: newMediaBlock.video || null
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

exports.update = async (mediaBlock, newMediaBlock, videoFile) => {
  if (videoFile) {
    const result = await AzureService.storeVideoFile(mediaBlock._id, videoFile)

    if (mediaBlock.video) {
      mediaBlock.video.videoFile = videoFile
      mediaBlock.video.uri = null
      mediaBlock.video.encodingState = result.encodingState
      mediaBlock.video.amsIdentifier = result.amsIdentifier
      mediaBlock.video.amsIdentifiers.unshift(result.amsIdentifier)
      mediaBlock.status = 'untranslated'

      mediaBlock.markModified('video')
    } else {
      mediaBlock.video = new Video({
        videoFile: videoFile,
        encodingState: result.encodingState,
        amsIdentifier: result.amsIdentifier,
        amsIdentifiers: [result.amsIdentifier]
      })
    }
  } else if (newMediaBlock.video) {
    if (mediaBlock.video) {
      mediaBlock.video.videoFile = newMediaBlock.videoFile || mediaBlock.video.videoFile
      mediaBlock.video.uri = newMediaBlock.video.uri || mediaBlock.video.uri
      mediaBlock.video.encodingState = newMediaBlock.video.encodingState || mediaBlock.video.encodingState
      mediaBlock.video.amsIdentifier = mediaBlock.video.amsIdentifier || ''
      mediaBlock.video.amsIdentifiers = mediaBlock.video.amsIdentifiers || []
      mediaBlock.status = newMediaBlock.status || mediaBlock.status

      mediaBlock.markModified('video')
    } else {
      mediaBlock.video = new Video({
        uri: newMediaBlock.video.uri || '',
        encodingState: newMediaBlock.video.uri ? 'Ready' : 'None',
        status: newMediaBlock.status || mediaBlock.status
      })
    }
  } else {
    mediaBlock.status = newMediaBlock.status || mediaBlock.status
  }

  mediaBlock.bslScript = newMediaBlock.bslScript || mediaBlock.bslScript

  return await mediaBlock.save()
}

exports.updateVideoState = async (mediaBlockId, encodingState, videoUri) => {
  let mediaBlock = await findById(mediaBlockId)

  if (mediaBlock.video) {
    if (encodingState === 'Ready') {
      mediaBlock.video.videoFile = null
    }

    mediaBlock.video.encodingState = encodingState
    mediaBlock.video.uri = videoUri
    mediaBlock.markModified('video')
  } else {
    mediaBlock.video = new Video({
      encodingState: encodingState,
      uri: videoUri
    })
  }

  if (videoUri) {
    if (mediaBlock.status !== 'review') {
      mediaBlock.status = 'translated'
    }
  } else {
    mediaBlock.status = mediaBlock.status || 'untranslated'
  }

  return await mediaBlock.save()
}

exports.deleteVideo = async (mediaBlock) => {
  if (mediaBlock.video) {
    mediaBlock.video.videoFile = null
    mediaBlock.video.encodingState = 'None'
    mediaBlock.video.amsIdentifier = null
    mediaBlock.video.uri = null
    mediaBlock.markModified('video')
  }

  mediaBlock.status = 'untranslated'

  await deleteFile(`video_${mediaBlock._id}.mp4`)

  return await mediaBlock.save()
}
