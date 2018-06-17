import express from 'express'
import datamuse from 'datamuse'
import Chance from 'chance'
//import rClient from '../helpers/redisDb'

const router = express.Router()
const chance = new Chance()

router.get('/:format', (req, res) => {
  // Check cache for word list first

  datamuse.words({
    rel_bga: req.query.query
  })
    .then(json => {
      // Payload container
      let data = {
        status: null
      }

      // Create next word list
      let nextListAll = []

      json.forEach(entry => {
        if (entry.word !== '.') {
          nextListAll.push(entry.word)
        }
      })

      // Choose a random assortment of owrds
      const numWords = req.query.limit ? Math.min(req.query.limit, nextListAll.length) : nextListAll.length
      const choices = chance.unique(chance.integer, numWords, {min: 0, max: nextListAll.length-1 })
      let nextListSome = []

      choices.forEach(index => {
        nextListSome.push(nextListAll[index])
      })

      data.nextList = nextListSome

      if (req.params.format === 'html') {
        data.status = 'ok'
        res.status(200).render('pages/related', {
          data: data
        })
      } else if (req.params.format === 'json') {
        data.status = 'ok'
        res.setHeader('Content-Type', 'application/json')
        res.status(200).send(JSON.stringify(nextListSome))
      } else {
        res.status(400).send('Error: Unknown format')
      }
    })
})

module.exports = router