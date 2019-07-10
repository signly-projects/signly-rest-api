class MediaBlock {
  constructor (textSegment) {
    this.rawText = textSegment
  }
}

class ExternalPage {
  constructor (url, title) {
    this.url = url
    this.title = title
    this.mediaBlocks = []
    this.textSegmentCounter = 0
    this.wordCounter = 0
  }

  addTextSegment (textSegment) {
    if (!this.mediaBlocks.some(mb => mb.textSegment === textSegment )) {
      this.mediaBlocks.push(new MediaBlock(textSegment))
      this.textSegmentCounter += 1
      this.wordCounter += textSegment.split(' ').length
    }
  }

  mediaBlocks () {
    return this.mediaBlocks
  }
}

module.exports = ExternalPage
