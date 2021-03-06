require('module-alias/register')
const request = require('supertest')
const mongoose = require('mongoose')
const { Page } = require('~models/page')
const { MediaBlock } = require('~models/media-block')

let server

const lloydsUri = 'https://www.lloydsbank.com/current-accounts.asp'
const monzoUri = 'https://monzo.com/help/'
const rawTextOne = 'Chuck Norris doesn\'t read books. He stares them down until he gets the information he wants.'
const rawTextTwo = 'There is no theory of evolution, just a list of creatures Chuck Norris allows to live.'
const rawTextThree = 'Time waits for no man. Unless that man is Chuck Norris.'
const defaultMediaBlocks = [
  { rawText: rawTextOne },
  { rawText: rawTextTwo }
]

describe('/api/pages', () => {
  beforeEach(() => {
    server = require('../../app')
  })

  afterEach(async () => {
    server.close()
    await Page.deleteMany({})
    await MediaBlock.deleteMany({})
  })

  describe('GET /', () => {
    it('should return all pages', async () => {
      const pages = [
        { uri: lloydsUri },
        { uri: monzoUri }
      ]

      await Page.collection.insertMany(pages)

      const res = await request(server).get('/api/pages')

      expect(res.status).toBe(200)
      expect(res.body.pages.length).toBe(2)
      expect(res.body.pages.some(p => p.uri === lloydsUri )).toBeTruthy()
      expect(res.body.pages.some(p => p.uri === monzoUri )).toBeTruthy()
    })
  })

  describe('GET /:id', () => {
    it('should return a page if valid id is passed', async () => {
      const page = new Page({ uri: lloydsUri })
      await page.save()

      const res = await request(server).get('/api/pages/' + page._id)

      expect(res.status).toBe(200)
      expect(res.body.page).toHaveProperty('uri', page.uri)
    })

    it('should return 404 if invalid id is passed', async () => {
      const res = await request(server).get('/api/pages/1')
      expect(res.status).toBe(404)
    })

    it('should return 404 if no page with the given id exists', async () => {
      const id = mongoose.Types.ObjectId()
      const res = await request(server).get('/api/pages/' + id)

      expect(res.status).toBe(404)
    })

    it('should return a page with media blocks if they exist', async () => {
      const mediaBlockOne = new MediaBlock({ rawText: rawTextOne })
      const mediaBlockTwo = new MediaBlock({ rawText: rawTextTwo })

      await mediaBlockOne.save()
      await mediaBlockTwo.save()

      const page = new Page({ uri: lloydsUri, mediaBlocks: [mediaBlockOne._id, mediaBlockTwo._id] })
      await page.save()

      const res = await request(server).get('/api/pages/' + page._id)

      expect(res.status).toBe(200)
      expect(res.body.page).toHaveProperty('uri', page.uri)
      expect(res.body.page.mediaBlocks).toHaveLength(2)
      expect(res.body.page.mediaBlocks).toEqual(
        [
          expect.objectContaining({ rawText: rawTextOne }),
          expect.objectContaining({ rawText: rawTextTwo })
        ]
      )
    })
  })

  describe('GET /search/:uri', () => {
    it('should return a page if valid URI is passed', async () => {
      const page = new Page({ uri: lloydsUri })
      await page.save()

      const res = await request(server).get('/api/pages/search?uri=' + encodeURIComponent(page.uri))

      expect(res.status).toBe(200)
      expect(res.body.page).toHaveProperty('uri', page.uri)
    })

    it('should return 404 if invalid URI is passed', async () => {
      const uri = 'not.a.valid.uri'
      const res = await request(server).get('/api/pages/search?uri=' + encodeURIComponent(uri))
      expect(res.status).toBe(404)
    })

    it('should return 404 if no page with the given id exists', async () => {
      const randomUri = 'https://yada.com'
      const res = await request(server).get('/api/pages/search?uri=' + randomUri)

      expect(res.status).toBe(404)
    })

    it('should return a page with media blocks if they exisat', async () => {
      const mediaBlockOne = new MediaBlock({ rawText: rawTextOne })
      const mediaBlockTwo = new MediaBlock({ rawText: rawTextTwo })

      await mediaBlockOne.save()
      await mediaBlockTwo.save()

      const page = new Page({ uri: lloydsUri, mediaBlocks: [mediaBlockOne._id, mediaBlockTwo._id] })
      await page.save()

      const res = await request(server).get('/api/pages/search?uri=' + encodeURIComponent(page.uri))

      expect(res.status).toBe(200)
      expect(res.body.page).toHaveProperty('uri', page.uri)
      expect(res.body.page.mediaBlocks).toHaveLength(2)
      expect(res.body.page.mediaBlocks).toEqual(
        [
          expect.objectContaining({ rawText: rawTextOne }),
          expect.objectContaining({ rawText: rawTextTwo })
        ]
      )
    })
  })

  describe('POST /', () => {
    let uri
    let mediaBlocks

    const exec = async () => {
      return await request(server)
        .post('/api/pages')
        .send({
          page: {
            uri: uri,
            mediaBlocks: mediaBlocks
          }
        })
    }

    beforeEach(async () => {
      uri = lloydsUri
      mediaBlocks = defaultMediaBlocks
    })

    it('should return 422 if page uri is not valid', async () => {
      uri = 'not.a.valid.uri'

      const res = await exec()

      expect(res.status).toBe(422)
    })

    it('should save the page if it is valid', async () => {
      await exec()

      const page = await Page.find({ uri: lloydsUri })

      expect(page).not.toBeNull()
    })

    it('should return the page if it is valid', async () => {
      const res = await exec()

      expect(res.status).toBe(201)
      expect(res.body.page).toHaveProperty('_id')
      expect(res.body.page).toHaveProperty('uri', lloydsUri)
      expect(res.body.page).toHaveProperty('requested', 1)
      expect(res.body.page).toHaveProperty('enabled', false)
    })

    it('should increment the requested property if the page with same uri exists', async () => {
      const res1 = await exec()
      const pageRequested = res1.body.page.requested
      const res2 = await exec()

      expect(res2.status).toBe(200)
      expect(res2.body.page).toHaveProperty('requested', pageRequested + 1)
    })

    it('should return the created page with media blocks if row text is sent', async () => {
      const res = await exec()
      const reqMediaBlocks = res.body.page.mediaBlocks

      expect(res.status).toBe(201)
      expect(reqMediaBlocks).toHaveLength(2)
      expect(reqMediaBlocks).toEqual(
        [
          expect.any(String),
          expect.any(String)
        ]
      )
    })

    it('should return the existing page with media blocks if row text exists and is valid', async () => {
      const page = new Page({ uri: lloydsUri })
      await page.save()

      const res = await exec()
      const reqMediaBlocks = res.body.page.mediaBlocks

      expect(res.status).toBe(200)
      expect(reqMediaBlocks).toHaveLength(2)
      expect(reqMediaBlocks).toEqual(
        [
          expect.any(String),
          expect.any(String)
        ]
      )
    })

    it('should return a 422 if media blocks raw text is not included in media blocks array', async () => {
      mediaBlocks = { randomKey: rawTextOne }

      const res = await exec()

      expect(res.status).toBe(422)
    })

    it('should return a 422 if media blocks raw text is empty', async () => {
      mediaBlocks = { randomKey: '' }

      const res = await exec()

      expect(res.status).toBe(422)
    })

    it('should return 201 for an empty media block array', async () => {
      mediaBlocks = []

      const res = await exec()

      expect(res.status).toBe(201)
    })

    it('should append media blocks if page exists and has media blocks', async () => {
      const res = await exec() // Creates the first media blocks
      const mediaBlockOneId = res.body.page.mediaBlocks[0]
      const mediaBlockTwoId = res.body.page.mediaBlocks[1]

      mediaBlocks = [{ rawText: rawTextThree }]

      const res2 = await exec()

      expect(res2.status).toBe(200)

      const reqMediaBlocks = res2.body.page.mediaBlocks

      expect(reqMediaBlocks).toHaveLength(3)
      expect(reqMediaBlocks).toEqual(
        [
          expect.stringMatching(mediaBlockOneId),
          expect.stringMatching(mediaBlockTwoId),
          expect.not.stringMatching(mediaBlockOneId) || expect.not.stringMatching(mediaBlockTwoId)
        ]
      )
    })

    it('should not create media blocks with the same normalizedText', async () => {
      const res = await exec() // Creates the first media blocks
      const mediaBlockOneId = res.body.page.mediaBlocks[0]
      const mediaBlockTwoId = res.body.page.mediaBlocks[1]

      const res2 = await exec()
      const reqMediaBlocks = res2.body.page.mediaBlocks

      expect(res2.status).toBe(200)
      expect(reqMediaBlocks).toHaveLength(2)
      expect(reqMediaBlocks).toEqual(
        [
          expect.stringMatching(mediaBlockOneId),
          expect.stringMatching(mediaBlockTwoId),
        ]
      )
    })
  })

  describe('PATCH /:id', () => {
    let newUri
    let mediaBlockOne
    let page
    let id
    let enabled
    let mediaBlocks

    const exec = async () => {
      return await request(server)
        .patch('/api/pages/' + id)
        .send({
          page: {
            uri: newUri,
            enabled: enabled,
            mediaBlocks: mediaBlocks
          }
        })
    }

    beforeEach(async () => {
      mediaBlockOne = new MediaBlock({ rawText: rawTextOne, normalizedText: rawTextOne.toLowerCase() })
      mediaBlockOne = await mediaBlockOne.save()

      // We need to include the normalizedText because it's our unique identifier for a media block
      page = new Page({ uri: lloydsUri, mediaBlocks: [mediaBlockOne._id.toString()] })
      await page.save()

      id = page._id
      enabled = false
      newUri = lloydsUri
      mediaBlocks = []
    })

    it('should return 422 if page uri is not valid', async () => {
      newUri = 'not.a.valid.uri'

      const res = await exec()

      expect(res.status).toBe(422)
    })

    it('should return 404 if id is invalid', async () => {
      id = 1

      const res = await exec()

      expect(res.status).toBe(404)
    })

    it('should return 404 if page with the given id was not found', async () => {
      id = mongoose.Types.ObjectId()

      const res = await exec()

      expect(res.status).toBe(404)
    })

    it('should update the page if input is valid', async () => {
      await exec()

      const updatedPage = await Page.findById(page._id)

      expect(updatedPage.uri).toBe(newUri)
    })

    it('should return the updated page if it is valid', async () => {
      const res = await exec()

      expect(res.body.page).toHaveProperty('_id')
      expect(res.body.page).toHaveProperty('uri', newUri)
      expect(res.body.page).toHaveProperty('enabled', false)
    })

    it('should allow to enable a page', async () => {
      enabled = true

      const res = await exec()

      expect(res.body.page).toHaveProperty('_id')
      expect(res.body.page).toHaveProperty('uri', newUri)
      expect(res.body.page).toHaveProperty('enabled', true)
    })

    it('should allow to update a page uri', async () => {
      newUri = 'https://monzo.com/about'

      const res = await exec()

      expect(res.body.page).toHaveProperty('_id')
      expect(res.body.page).toHaveProperty('uri', newUri)
      expect(res.body.page).toHaveProperty('enabled', false)
    })

    it('should append media blocks if new are passed', async () => {
      mediaBlocks = [{ rawText: rawTextThree }]

      const res = await exec()

      expect(res.status).toBe(200)

      const reqMediaBlocks = res.body.page.mediaBlocks

      expect(reqMediaBlocks).toHaveLength(2)
      expect(reqMediaBlocks).toEqual(
        [
          expect.stringMatching(mediaBlockOne._id.toString()),
          expect.any(String)
        ]
      )
    })

    it('should not create media blocks with the same raw text', async () => {
      mediaBlocks = [{ rawText: rawTextOne }]

      const res = await exec()

      expect(res.status).toBe(200)

      const reqMediaBlocks = res.body.page.mediaBlocks

      expect(reqMediaBlocks).toHaveLength(1)
      expect(reqMediaBlocks).toEqual(
        [
          expect.stringMatching(mediaBlockOne._id.toString())
        ]
      )
    })

    it('should not erase media blocks if empty array is sent', async () => {
      mediaBlocks = []

      const res = await exec()

      expect(res.status).toBe(200)

      const reqMediaBlocks = res.body.page.mediaBlocks

      expect(reqMediaBlocks).toHaveLength(1)
      expect(reqMediaBlocks).toEqual(
        [
          expect.stringMatching(mediaBlockOne.id)
        ]
      )
    })
  })

  describe('DELETE /:id', () => {
    let page
    let id

    const exec = async () => {
      return await request(server)
        .delete('/api/pages/' + id)
        .send()
    }

    beforeEach(async () => {
      page = new Page({ uri: lloydsUri })
      await page.save()

      id = page._id
    })

    it('should return 404 if id is invalid', async () => {
      id = 1

      const res = await exec()

      expect(res.status).toBe(404)
    })

    it('should return 404 if no page with the given id was found', async () => {
      id = mongoose.Types.ObjectId()

      const res = await exec()

      expect(res.status).toBe(404)
    })

    it('should delete the page if input is valid', async () => {
      await exec()

      const pageInDb = await Page.findById(id)

      expect(pageInDb).toBeNull()
    })

    it('should return the removed page', async () => {
      const res = await exec()

      expect(res.body.page).toHaveProperty('_id', page._id.toHexString())
      expect(res.body.page).toHaveProperty('uri', page.uri)
    })
  })
})
