import express from 'express'
import randomWords from 'random-words'
const router = express.Router()

router.get('/:format', (req, res) => {
  // Payload container
  let data = {
    status: null,
    seedWords: randomWords(parseInt(req.query.limit) || 1)
  }

  if (req.params.format === 'html') {
    data.status = 'ok'
    res.status(200).render('pages/seed', {
      data: data
    })
  } else if (req.params.format === 'json') {
    data.status = 'ok'
    res.setHeader('Content-Type', 'application/json')
    res.status(200).send(JSON.stringify(data))
  } else {
    res.status(400).send('Error: Unknown format')
  }
})

module.exports = router