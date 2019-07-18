class MediaBlock {
  constructor (textSegment) {
    this.rawText = textSegment
  }
}

class ExternalPage {
  constructor (uri, title) {
    this.uri = uri
    this.title = title
    this.mediaBlocks = []
  }

  addTextSegment (textSegment) {
    if (!this.mediaBlocks.some(mb => mb.rawText === textSegment)) {
      this.mediaBlocks.push(new MediaBlock(textSegment))
    }
  }

  mediaBlocks () {
    return this.mediaBlocks
  }
}

module.exports = ExternalPage
