class ExternalPage {
  constructor (url, title) {
    this._url = url
    this._title = title
    this._textSegments = []
  }

  set addTextSegment (textSegment) {
    this._textSegments.push(textSegment)
  }

  get textSegments () {
    return this._textSegments
  }
}

exports.ExternalPage = ExternalPage
