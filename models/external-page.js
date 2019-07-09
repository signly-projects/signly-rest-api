class ExternalPage {
  constructor (url, title) {
    this.url = url
    this.title = title
    this.textSegments = []
    this.textSegmentCounter = 0
    this.wordCounter = 0
  }

  addTextSegment (textSegment) {
    if (!this.textSegments.includes(textSegment)) {
      this.textSegments.push(textSegment)
      this.textSegmentCounter += 1
      this.wordCounter += textSegment.split(' ').length
    }
  }

  textSegments () {
    return this.textSegments
  }
}

module.exports = ExternalPage
