import express from 'express'
import randomWords from 'random-words'
const router = express.Router()

router.get('/', (req, res) => {
  const words = randomWords(5)
  res.status(200).render('pages/seed', {
    data: words
  })
})

module.exports = router