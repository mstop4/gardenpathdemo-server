import express from 'express'
import randomWords from 'random-words'
const router = express.Router()

router.get('/:format', (req, res) => {
  const words = randomWords(parseInt(req.query.limit) || 1)

  if (req.params.format === 'html') {
    res.status(200).render('pages/seed', {
      data: words
    })
  } else if (req.params.format === 'json') {
    res.setHeader('Content-Type', 'application/json')
    res.status(200).send(JSON.stringify(words))
  } else {
    res.status(400).send('Error: Unknown format')
  }
})

module.exports = router