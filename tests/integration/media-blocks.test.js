require('module-alias/register')
const request = require('supertest')
const mongoose = require('mongoose')
const { MediaBlock } = require('~models/media-block')
const { Video } = require('~models/video')

let server

const rawTextOne = 'Chuck Norris doesn\'t read books. He stares them down until he gets the information he wants.'
const videoUriOne = 'https://signly.co/bslVideoOne.mp4'
const videoUriTwo = 'https://signly.co/bslVideoTwo.mp4'


describe('/api/media-blocks', () => {
  beforeEach(() => {
    server = require('../../app')
  })

  afterEach(async () => {
    server.close()
    await MediaBlock.deleteMany({})
  })

  describe('GET /:id', () => {
    it('should return a media block if valid id is passed', async () => {
      const mediaBlock = new MediaBlock({ rawText: rawTextOne })
      await mediaBlock.save()

      const res = await request(server).get('/api/media-blocks/' + mediaBlock._id)

      expect(res.status).toBe(200)
      expect(res.body.mediaBlock).toHaveProperty('rawText', mediaBlock.rawText)
    })

    it('should return 404 if invalid id is passed', async () => {
      const res = await request(server).get('/api/media-blocks/1')
      expect(res.status).toBe(404)
    })

    it('should return 404 if no media block with the given id exists', async () => {
      const id = mongoose.Types.ObjectId()
      const res = await request(server).get('/api/media-blocks/' + id)

      expect(res.status).toBe(404)
    })

    it('should return a media block with a video if it exists', async () => {
      const videoOne = new Video({ uri: videoUriOne })

      await videoOne.save()

      const mediaBlock = new MediaBlock({ rawText: rawTextOne, video: videoOne })
      await mediaBlock.save()

      const res = await request(server).get('/api/media-blocks/' + mediaBlock._id)

      expect(res.status).toBe(200)
      expect(res.body.mediaBlock).toHaveProperty('video')
      expect(res.body.mediaBlock.video).toMatchObject({
        uri: videoUriOne
      })
    })
  })

  describe('GET /search/:normalizedText', () => {
    it('should return a media block that contains the given normalized text', async () => {
      const mediaBlock = new MediaBlock({ rawText: rawTextOne, normalizedText: rawTextOne.toLowerCase() })
      await mediaBlock.save()

      const res = await request(server).get('/api/media-blocks/search?normalizedText=' + encodeURIComponent(rawTextOne.toLowerCase()))

      expect(res.status).toBe(200)
      expect(res.body.mediaBlock).toHaveProperty('normalizedText', mediaBlock.normalizedText)
    })

    it('should return 404 if no media block with passed normalized text exists', async () => {
      const randomText = 'yada yada yada'
      const res = await request(server).get('/api/media-blocks/search?normalizedText=' + encodeURIComponent(randomText.toLowerCase()))

      expect(res.status).toBe(404)
    })
  })

  describe('PATCH /:id', () => {
    let mediaBlock
    let id
    let status
    let video

    const exec = async () => {
      return await request(server)
        .patch('/api/media-blocks/' + id)
        .send({
          mediaBlock: {
            status: status,
            video: video
          }
        })
    }

    beforeEach(async () => {
      mediaBlock = new MediaBlock({ rawText: rawTextOne, normalizedText: rawTextOne.toLowerCase() })
      await mediaBlock.save()

      id = mediaBlock._id
      video = { uri: videoUriOne }
    })

    it('should return 404 if id is invalid', async () => {
      id = 1

      const res = await exec()

      expect(res.status).toBe(404)
    })

    it('should return 404 if media block with the given id was not found', async () => {
      id = mongoose.Types.ObjectId()

      const res = await exec()

      expect(res.status).toBe(404)
    })

    it('should return the updated media block if it is valid', async () => {
      const res = await exec()

      expect(res.body.mediaBlock).toHaveProperty('_id')
      expect(res.body.mediaBlock).toHaveProperty('rawText', rawTextOne)
      expect(res.body.mediaBlock).toHaveProperty('normalizedText', rawTextOne.toLowerCase())
      expect(res.body.mediaBlock).toHaveProperty('status')
    })

    it('should allow a null video object to media block and set status to untranslated', async () => {
      video = null

      const res = await exec()

      expect(res.body.mediaBlock).not.toHaveProperty('video')
      expect(res.body.mediaBlock).toHaveProperty('status', 'untranslated')
    })
  })
})
