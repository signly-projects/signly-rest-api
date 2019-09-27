require('module-alias/register')
const request = require('supertest')
const mongoose = require('mongoose')
const { MediaBlock } = require('~models/media-block')
const { Video } = require('~models/video')

let server

const rawTextOne = 'Chuck Norris doesn\'t read books. He stares them down until he gets the information he wants.'
const rawTextTwo = 'There is no theory of evolution, just a list of creatures Chuck Norris allows to live.'
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
  //   let newUri
  //   let mediaBlockOne
    let mediaBlock
    let id
    let status
    let video
    let videoUri

    const exec = async () => {
      return await request(server)
        .patch('/api/media-blocks/' + id)
        .send({
          mediaBlock: {
            status: status,
            video: { uri: videoUriTwo }
          }
        })
    }

    beforeEach(async () => {
      mediaBlock = new MediaBlock({ rawText: rawTextOne })
      await mediaBlock.save()

      id = mediaBlock._id
    })

    it('should return 422 if video uri is not valid', async () => {
      video = { videoUri: 'not.a.valid.uri' }

      const res = await exec()

      expect(res.status).toBe(422)
    })

    it('should return 404 if id is invalid', async () => {
      id = 1
      // video = { uri: videoUriOne }

      const res = await exec()

      expect(res.status).toBe(404)
    })

    it('should return 404 if media block with the given id was not found', async () => {
      id = mongoose.Types.ObjectId()
      // video = { uri: videoUriOne }

      const res = await exec()

      expect(res.status).toBe(404)
    })

    it('should update the media block if input is valid', async () => {
      await exec()

      const updatedMediaBlock = await MediaBlock.findById(id)

      expect(updatedMediaBlock.video).toMatchObject({
        uri: videoUriTwo
      })
    })

  //   it('should return the updated page if it is valid', async () => {
  //     const res = await exec()
  //
  //     expect(res.body.page).toHaveProperty('_id')
  //     expect(res.body.page).toHaveProperty('uri', newUri)
  //     expect(res.body.page).toHaveProperty('enabled', false)
  //   })
  //
  //   it('should allow to enable a page', async () => {
  //     enabled = true
  //
  //     const res = await exec()
  //
  //     expect(res.body.page).toHaveProperty('_id')
  //     expect(res.body.page).toHaveProperty('uri', newUri)
  //     expect(res.body.page).toHaveProperty('enabled', true)
  //   })
  //
  //   it('should allow to update a page uri', async () => {
  //     newUri = 'https://monzo.com/about'
  //
  //     const res = await exec()
  //
  //     expect(res.body.page).toHaveProperty('_id')
  //     expect(res.body.page).toHaveProperty('uri', newUri)
  //     expect(res.body.page).toHaveProperty('enabled', false)
  //   })
  //
  //   it('should append media blocks if new are passed', async () => {
  //     mediaBlocks = [{ rawText: rawTextThree }]
  //
  //     const res = await exec()
  //
  //     expect(res.status).toBe(200)
  //
  //     const reqMediaBlocks = res.body.page.mediaBlocks
  //
  //     expect(reqMediaBlocks).toHaveLength(2)
  //     expect(reqMediaBlocks).toEqual(
  //       [
  //         expect.stringMatching(mediaBlockOne._id.toString()),
  //         expect.any(String)
  //       ]
  //     )
  //   })
  //
  //   it('should not create media blocks with the same raw text', async () => {
  //     mediaBlocks = [{ rawText: rawTextOne }]
  //
  //     const res = await exec()
  //
  //     expect(res.status).toBe(200)
  //
  //     const reqMediaBlocks = res.body.page.mediaBlocks
  //
  //     expect(reqMediaBlocks).toHaveLength(1)
  //     expect(reqMediaBlocks).toEqual(
  //       [
  //         expect.stringMatching(mediaBlockOne._id.toString())
  //       ]
  //     )
  //   })
  //
  //   it('should not erase media blocks if empty array is sent', async () => {
  //     mediaBlocks = []
  //
  //     const res = await exec()
  //
  //     expect(res.status).toBe(200)
  //
  //     const reqMediaBlocks = res.body.page.mediaBlocks
  //
  //     expect(reqMediaBlocks).toHaveLength(1)
  //     expect(reqMediaBlocks).toEqual(
  //       [
  //         expect.stringMatching(mediaBlockOne.id)
  //       ]
  //     )
  //   })
  })
  //
  // describe('DELETE /:id', () => {
  //   let page
  //   let id
  //
  //   const exec = async () => {
  //     return await request(server)
  //       .delete('/api/pages/' + id)
  //       .send()
  //   }
  //
  //   beforeEach(async () => {
  //     page = new Page({ uri: lloydsUri })
  //     await page.save()
  //
  //     id = page._id
  //   })
  //
  //   it('should return 404 if id is invalid', async () => {
  //     id = 1
  //
  //     const res = await exec()
  //
  //     expect(res.status).toBe(404)
  //   })
  //
  //   it('should return 404 if no page with the given id was found', async () => {
  //     id = mongoose.Types.ObjectId()
  //
  //     const res = await exec()
  //
  //     expect(res.status).toBe(404)
  //   })
  //
  //   it('should delete the page if input is valid', async () => {
  //     await exec()
  //
  //     const pageInDb = await Page.findById(id)
  //
  //     expect(pageInDb).toBeNull()
  //   })
  //
  //   it('should return the removed page', async () => {
  //     const res = await exec()
  //
  //     expect(res.body.page).toHaveProperty('_id', page._id.toHexString())
  //     expect(res.body.page).toHaveProperty('uri', page.uri)
  //   })
  // })
})
