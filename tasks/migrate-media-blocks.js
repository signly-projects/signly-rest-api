(async () => {
  const axios = require('axios')

  const ORIGIN_SIGNLY_API_URL = 'https://signly-dev.azurewebsites.net/api'
  const TARGET_SIGNLY_API_URL = 'http://localhost:3030/api'

  console.log(`Fetching data from '${ORIGIN_SIGNLY_API_URL}' ...`)
  const { data: { pages }} = await axios({
    url: `${ORIGIN_SIGNLY_API_URL}/pages`,
    params: {
      withMediaBlocks: true
    },
    method: 'get'
  })

  console.log(`Uploading data to '${TARGET_SIGNLY_API_URL}' ...`)
  const result = await Promise.all(pages.map(async (webPage) => {
    const { requested, enabled, uri, title, mediaBlocks } = webPage

    try {
      const newMediaBlocks = mediaBlocks.map(mediaBlock => {
        const { rawText, bslScript, status } = mediaBlock
        let video = {}

        if (mediaBlock.videoUri) {
          video['uri'] = mediaBlock.videoUri
          video['encodedState'] = 'Ready'
        } else if (mediaBlock.video && mediaBlock.video.uri) {
          video = Object.assign({}, video, mediaBlock.video)
        } else {
          video = null
        }

        return { rawText, bslScript, status, video }
      })

      const webPage = { requested, enabled, uri, title, mediaBlocks: newMediaBlocks }

      const { data: { page } } = await axios({
        url: `${TARGET_SIGNLY_API_URL}/pages`,
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        data: {
          page: webPage
        }
      })

      return page
    } catch (error) {
      return {
        uri: webPage.uri,
        error: error,
        message: error.response.data
      }
    }
  }))

  console.log(`Content successfully migrated from '${ORIGIN_SIGNLY_API_URL}' data to '${TARGET_SIGNLY_API_URL}' ...`)

  const errors = result.filter(p => p.error) || []

  if (errors.length > 0) {
    console.log(errors)
  }
})()
