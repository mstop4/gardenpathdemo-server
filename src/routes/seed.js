import express from 'express'
import randomWords from 'random-words'
import sendResponse from '../helpers/sendResponse'

const router = express.Router()

router.get('/:format', (req, res) => {
  // Payload container
  let data = {
    status: null,
    seedWords: randomWords(parseInt(req.query.limit) || 1)
  }

  sendResponse(res, req.params.format, data, 'pages/seed')
})

module.exports = router