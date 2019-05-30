const request = require('supertest')
const mongoose = require('mongoose')
const { Page } = require('../../models/page')

let server

const lloydsUri = 'https://www.lloydsbank.com/current-accounts.asp'
const monzoUri = 'https://monzo.com/help/'

describe('/api/pages', () => {
  beforeEach(() => {
    server = require('../../app')
  })

  afterEach(async () => {
    server.close()
    await Page.deleteMany({})
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
      expect(res.body.length).toBe(2)
      expect(res.body.some(p => p.uri === lloydsUri )).toBeTruthy()
      expect(res.body.some(p => p.uri === monzoUri )).toBeTruthy()
    })
  })

  describe('GET /:id', () => {
    it('should return a page if valid id is passed', async () => {
      const page = new Page({ uri: lloydsUri })
      await page.save()

      const res = await request(server).get('/api/pages/' + page._id)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('uri', page.uri)
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
  })

  describe('POST /', () => {
    let uri

    const exec = async () => {
      return await request(server)
        .post('/api/pages')
        .send({ uri: uri })
    }

    beforeEach(() => {
      uri = lloydsUri
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
      expect(res.body).toHaveProperty('_id')
      expect(res.body).toHaveProperty('uri', lloydsUri)
      expect(res.body).toHaveProperty('requested', 1)
    })

    it('should increment the requested property if the page with same uri exists', async () => {
      const res1 = await exec()
      const pageRequested = res1.body.requested
      const res2 = await exec()

      expect(res2.status).toBe(200)
      expect(res2.body).toHaveProperty('requested', pageRequested + 1)
    })
  })

  describe('PUT /:id', () => {
    let newUri
    let page
    let id

    const exec = async () => {
      return await request(server)
        .put('/api/pages/' + id)
        .send({ uri: newUri })
    }

    beforeEach(async () => {
      page = new Page({ uri: lloydsUri })
      await page.save()

      id = page._id
      newUri = lloydsUri
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

      expect(res.body).toHaveProperty('_id')
      expect(res.body).toHaveProperty('uri', newUri)
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

      expect(res.body).toHaveProperty('_id', page._id.toHexString())
      expect(res.body).toHaveProperty('uri', page.uri)
    })
  })
})