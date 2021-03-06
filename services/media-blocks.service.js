const safe = require('safe-regex')
const { deleteFile } = require('~utils/storage')
const { MediaBlock } = require('~models/media-block')
const { Video } = require('~models/video')
const AzureService = require('~services/azure.service')

const MAX_ITEMS = 100

const getSearchQuery = (query) => {
  const { search, filter, date } = query

  if (!safe(search)) {
    return []
  }

  const orQuery = {
    $or: [
      {
        rawText: {
          $regex: `${search || ''}`,
          $options: 'i'
        }
      }
    ]
  }

  const andQuery = {
    $and: [
      orQuery,
      {
        status: {
          $regex: `^${filter || ''}`,
          $options: 'i'
        }
      }
    ]
  }

  if (date) {
    const dateObj = JSON.parse(date)

    andQuery.$and.push({
      updatedAt: {
        $gte: dateObj.start,
        $lt: dateObj.stop
      }
    })
  }

  return andQuery
}

exports.countAll = async (query) => {
  if (query) {
    return MediaBlock.countDocuments(getSearchQuery(query))
  }

  return MediaBlock.countDocuments()
}

exports.findAll = async (query) => {
  const { limit, page } = query
  const searchQuery = getSearchQuery(query)
  const itemLimit = limit ? parseInt(limit, 10) : MAX_ITEMS

  const { docs, totalDocs } = await MediaBlock
    .paginate(
      searchQuery,
      {
        page: page,
        limit: itemLimit,
        sort: { updatedAt: 'desc' }
      }
    )

  return {
    mediaBlocks: docs,
    mediaBlocksCount: totalDocs
  }
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

const getUniqueMediaBlocks = (newMediaBlocks) => {
  let unique = {}
  return newMediaBlocks.filter(mb => (!unique[mb.rawText.toLowerCase()]) && (unique[mb.rawText.toLowerCase()] = true))
}

exports.findOrCreateNewMediaBlocks = async (newPage, page) => {
  let mediaBlocks = []

  if (newPage && newPage.mediaBlocks) {
    const newMediaBlocks = getUniqueMediaBlocks(newPage.mediaBlocks)

    await Promise.all(newMediaBlocks.map(async (newMediaBlock) => {
      let mediaBlock = await this.findOrCreate(newMediaBlock)

      if (page && page.mediaBlocks && page.mediaBlocks.length) {
        if (!page.mediaBlocks.some(existingMediaBlock => existingMediaBlock._id.equals(mediaBlock._id))) {
          mediaBlocks.push(mediaBlock)
        }
      } else {
        mediaBlocks.push(mediaBlock)
      }
    }))
  }

  return mediaBlocks
}

exports.resolveProcessingMediaBLocks = async () => {
  const mediaBlocks = await MediaBlock.find({ status: 'processing' })
  let results = []

  for (let i = 0; i < mediaBlocks.length; i++) {
    if (mediaBlocks[i].video && mediaBlocks[i].video.amsIdentifier) {
      try {
        const videoUri = await AzureService.getStreamingUrls(`locator_${mediaBlocks[i].video.amsIdentifier}`)

        if (videoUri) {
          const updatedMediaBlock = await this.updateVideoState(mediaBlocks[i]._id, 'translated', videoUri)
          results.push({
            mediaBlockId: updatedMediaBlock._id,
            text: updatedMediaBlock.rawText,
            status: updatedMediaBlock.status
          })
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error)
      }

    }
  }

  return results
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

exports.updateOrCreateVideo = async (mediaBlock, newVideoFile, translatorEmail, translatorFullName) => {
  if (!mediaBlock && !newVideoFile) {
    return null
  }

  const result = await AzureService.storeVideoFile(mediaBlock._id, newVideoFile)

  if (mediaBlock.video) {
    mediaBlock.video.videoFile = newVideoFile
    mediaBlock.video.uri = null
    mediaBlock.video.encodingState = result.encodingState
    mediaBlock.video.amsIdentifier = result.amsIdentifier
    mediaBlock.video.amsIdentifiers.unshift(result.amsIdentifier)
    mediaBlock.video.translatorEmail = translatorEmail
    mediaBlock.video.translatorFullName = translatorFullName

    mediaBlock.markModified('video')
  } else {
    mediaBlock.video = new Video({
      uri: null,
      encodingState: result.encodingState,
      amsIdentifier: result.amsIdentifier,
      amsIdentifiers: [result.amsIdentifier],
      translatorEmail: translatorEmail,
      translatorFullName: translatorFullName
    })
  }

  mediaBlock.status = 'processing'

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

exports.deleteUntranslatedMediaBlocks = async () => {
  return await MediaBlock.deleteMany({ status: 'untranslated' })
}
