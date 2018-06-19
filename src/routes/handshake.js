import express from 'express'
const router = express.Router()

router.get('/', (req, res) => {
  res.status(200).send('Welcome to the Garden Path server!')
})

module.exports = router