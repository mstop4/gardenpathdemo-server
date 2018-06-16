import express from 'express'
import datamuse from 'datamuse'
const router = express.Router()

router.get('/:format', (req, res) => {
  datamuse.words({
    rel_bga: req.query.query,
    max: req.query.limit || 1
  })
    .then(json => {
      let words = []

      json.forEach(entry => {
        words.push(entry.word)
      })

      if (req.params.format === 'html') {
        res.status(200).render('pages/related', {
          data: words
        })
      } else if (req.params.format === 'json') {
        res.setHeader('Content-Type', 'application/json')
        res.status(200).send(JSON.stringify(words))
      } else {
        res.status(400).send('Error: Unknown format')
      }
    })
})

module.exports = router