(async () => {
  const axios = require('axios')
  const fs = require('fs')


  const ORIGIN_SIGNLY_API_URL = 'https://signly.azurewebsites.net/api'
  const TARGET_SIGNLY_API_URL = 'http://localhost:3030'

  const uploadPage = async (webPage) => {
    const { requested, enabled, uri, title, mediaBlocks } = webPage

    const newMediaBlocks = mediaBlocks.map(mediaBlock => {
      const { rawText, bslScript, status, createdAt, updatedAt } = mediaBlock
      let video = {}

      if (mediaBlock.videoUri) {
        video['uri'] = mediaBlock.videoUri
        video['encodingState'] = 'Ready'
      } else if (mediaBlock.video && mediaBlock.video.uri) {
        video = Object.assign({}, video, mediaBlock.video)
      } else {
        video = null
      }

      return { rawText, bslScript, status, video, createdAt: {$date: createdAt}, updatedAt: {$date: updatedAt} }
    })

    const newWebPage = { requested, enabled, uri, title, mediaBlocks: newMediaBlocks }

    return axios({
      url: `${TARGET_SIGNLY_API_URL}/api/pages`,
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      data: {
        page: newWebPage
      }
    })
  }

  const uploadAllPages = async (pages, uploadHandler) => {
    let results = []
    for (const page of pages) {
      try {
        const result = await uploadHandler(page)
        // eslint-disable-next-line no-console
        console.log(` \u2713 ${result.data.page.uri} (STATUS: ${result.status})`)
        results.push({
          uri: result.data.page.uri,
          status: result.status
        })
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(` \u274C ${page.uri} (STATUS: ${error.status})\n\t${error.message}`)

        results.push({
          uri: page.uri,
          status: error.status,
          error: error.message
        })
      }
    }
    return results
  }

  const storeMigrationData = (data, path) => {
    try {
      fs.writeFileSync(path, JSON.stringify(data))
    } catch (err) {
      console.error(err)
    }
  }

  console.log(`Fetching data from '${ORIGIN_SIGNLY_API_URL}' ...`)

  const { data: { pages }} = await axios({
    url: `${ORIGIN_SIGNLY_API_URL}/pages`,
    params: {
      withMediaBlocks: true
    },
    method: 'get'
  })

  storeMigrationData(pages, `tmp/migration_${Date.now()}.json`)

  console.log(`Uploading data to '${TARGET_SIGNLY_API_URL}' ...`)

  uploadAllPages(pages, uploadPage)
    .then(() => {
      console.log('Migration finished.')
    })
})()
