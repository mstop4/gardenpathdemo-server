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
    const nextListAll = wordList.nextList

    // Choose a random assortment of words
    const numWords = limit ? Math.min(limit, nextListAll.length) : nextListAll.length
    const choices = chance.unique(chance.integer, numWords, { min: 0, max: nextListAll.length - 1 })
    let nextListSome = []

    choices.forEach(index => {
      nextListSome.push(nextListAll[index])
    })

    data.nextList = nextListSome
    sendResponse(res, format, data, 'pages/seed')
  })
}

const fetchWordsFromDatamuse = (res, format, query, limit) => {
  let data = {
    status: null
  }

  datamuse.words({
    rel_bga: query
  })
    .then(json => {
      let wordList = {}

      // Create next word list
      let nextListAll = []

      json.forEach(entry => {
        if (entry.word !== '.') {
          nextListAll.push(entry.word)
        }
      })

      // Save word list to cache
      wordList.nextList = nextListAll
      rClient.set([`wordList:${query}`, JSON.stringify(wordList)], () => {
        console.log(query + ' set!')
      })

      // Choose a random assortment of words
      const numWords = limit ? Math.min(limit, nextListAll.length) : nextListAll.length
      const choices = chance.unique(chance.integer, numWords, { min: 0, max: nextListAll.length - 1 })
      let nextListSome = []

      choices.forEach(index => {
        nextListSome.push(nextListAll[index])
      })

      data.nextList = nextListSome
      sendResponse(res, format, data, 'pages/seed')
    })
}

module.exports = router