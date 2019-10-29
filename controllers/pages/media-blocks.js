const { Page } = require('~models/page')

exports.getPageMediaBlocks = async (req, res, next) => {
  const page = await Page.findById(req.params.id).populate('mediaBlocks')

  if (!page) {
    return res.status(404).send('Page with the given ID not found.')
  }

  res.status(200).send({ mediaBlocks: page.mediaBlocks })
}
