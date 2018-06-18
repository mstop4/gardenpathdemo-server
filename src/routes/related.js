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
  rClient.exists(`wordList:${queryLower}`, (err, reply) => {
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

  rClient.get(`wordList:${query}`, (err, reply) => {
    const wordList = JSON.parse(reply)
    const nextWordsAll = wordList.nextWords
    const triggerWordsAll = wordList.triggerWords

    // Choose a random assortment of words
    let numWords = limit ? Math.min(limit, nextWordsAll.length) : nextWordsAll.length
    let choices = chance.unique(chance.integer, numWords, { min: 0, max: nextWordsAll.length - 1 })
    let nextWordsSome = []

    choices.forEach(index => {
      nextWordsSome.push(nextWordsAll[index])
    })

    data.nextWords = nextWordsSome

    numWords = limit ? Math.min(limit, triggerWordsAll.length) : triggerWordsAll.length
    choices = chance.unique(chance.integer, numWords, { min: 0, max: triggerWordsAll.length - 1 })
    let triggerWordsSome = []

    choices.forEach(index => {
      triggerWordsSome.push(triggerWordsAll[index])
    })

    data.triggerWords = triggerWordsSome

    sendResponse(res, format, data, 'pages/related')
  })
}

const fetchWordsFromDatamuse = (res, format, query, limit) => {
  let data = {
    status: null
  }

  const promises = [
    datamuse.words({
      rel_bga: query
    }),
    datamuse.words({
      rel_trg: query
    })
  ]

  Promise.all(promises)
    .then(json => {
      let wordList = {}

      // Create next word list
      let nextWordsAll = []

      json[0].forEach(entry => {
        if (entry.word !== '.') {
          nextWordsAll.push(entry.word)
        }
      })

      // Save word list to cache
      wordList.nextWords = nextWordsAll

      // Choose a random assortment of words
      let numWords = limit ? Math.min(limit, nextWordsAll.length) : nextWordsAll.length
      let choices = chance.unique(chance.integer, numWords, { min: 0, max: nextWordsAll.length - 1 })
      let nextWordsSome = []

      choices.forEach(index => {
        nextWordsSome.push(nextWordsAll[index])
      })

      data.nextWords = nextWordsSome

      // Create trigger word list
      let triggerWordsAll = []

      json[1].forEach(entry => {
        if (entry.word !== '.') {
          triggerWordsAll.push(entry.word)
        }
      })

      // Save word list to cache
      wordList.triggerWords = triggerWordsAll

      // Choose a random assortment of words
      numWords = limit ? Math.min(limit, triggerWordsAll.length) : triggerWordsAll.length
      choices = chance.unique(chance.integer, numWords, { min: 0, max: triggerWordsAll.length - 1 })
      let triggerWordsSome = []

      choices.forEach(index => {
        triggerWordsSome.push(triggerWordsAll[index])
      })

      data.triggerWords = triggerWordsSome
      console.dir(triggerWordsSome)

      rClient.set([`wordList:${query}`, JSON.stringify(wordList)], () => {
        console.log(query + ' set!')
      })

      sendResponse(res, format, data, 'pages/related')
    })
}

module.exports = router