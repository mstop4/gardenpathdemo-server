import express from 'express'
import datamuse from 'datamuse'
import Chance from 'chance'
import rClient from '../helpers/redisDb'
import sendResponse from '../helpers/sendResponse'

const router = express.Router()
const chance = new Chance()

router.get('/:format', (req, res) => {
  const queryLower = req.query.query.toLowerCase()

  // Check cache for word list first
  rClient.exists(`trigger:${queryLower}`, (err, reply) => {
    if (reply === 1) {
      fetchWordsFromRedis(res, req.params.format, queryLower, req.query.limit)
    } else {  
      fetchWordsFromDatamuse(res, req.params.format, queryLower, req.query.limit)
    }
  })
})

const fetchWordsFromRedis = (res, format, query, limit) => {
  // Payload container
  let data = {
    status: null
  }

  rClient.get(`trigger:${query}`, (err, reply) => {
    const wordList = JSON.parse(reply)
    const triggerWordsAll = wordList.triggerWords

    // Choose a random assortment of words
    const numWords = limit ? Math.min(limit, triggerWordsAll.length) : triggerWordsAll.length
    const choices = chance.unique(chance.integer, numWords, { min: 0, max: triggerWordsAll.length - 1 })
    let triggerWordsSome = []

    choices.forEach(index => {
      triggerWordsSome.push(triggerWordsAll[index])
    })

    data.triggerWords = triggerWordsSome

    sendResponse(res, format, data, 'pages/trigger')
  })
}

const fetchWordsFromDatamuse = (res, format, query, limit) => {
  let data = {
    status: null
  }

  const promises = [
    datamuse.words({
      rel_trg: query
    })
  ]

  Promise.all(promises)
    .then(json => {
      let wordList = {}

      // Create trigger word list
      let triggerWordsAll = []

      json[0].forEach(entry => {
        if (entry.word !== '.') {
          triggerWordsAll.push(entry.word)
        }
      })

      // Save word list to cache
      wordList.triggerWords = triggerWordsAll

      // Choose a random assortment of words
      const numWords = limit ? Math.min(limit, triggerWordsAll.length) : triggerWordsAll.length
      const choices = chance.unique(chance.integer, numWords, { min: 0, max: triggerWordsAll.length - 1 })
      let triggerWordsSome = []

      choices.forEach(index => {
        triggerWordsSome.push(triggerWordsAll[index])
      })

      data.triggerWords = triggerWordsSome

      rClient.set([`trigger:${query}`, JSON.stringify(wordList)], () => {
        console.log(query + ' set!')
      })

      sendResponse(res, format, data, 'pages/trigger')
    })
}

module.exports = router