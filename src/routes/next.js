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
  rClient.exists(`next:${queryLower}`, (err, reply) => {
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

  console.log(`Fetching ${query} from cache`)
  rClient.get(`next:${query}`, (err, reply) => {
    if (err) {
      data.status = 'error'
      data.message = err

      console.log(`Can't fetch ${query} from cache`)
      sendResponse(res, format, data, 'pages/next')
    } else {
      const wordList = JSON.parse(reply)
      const nextWordsAll = wordList.nextWords

      // Choose a random assortment of words
      const numWords = limit ? Math.min(limit, nextWordsAll.length) : nextWordsAll.length
      const choices = chance.unique(chance.integer, numWords, { min: 0, max: nextWordsAll.length - 1 })
      let nextWordsSome = []

      choices.forEach(index => {
        nextWordsSome.push(nextWordsAll[index])
      })

      data.nextWords = nextWordsSome

      console.log(`Fetched ${query} from cache`)
      sendResponse(res, format, data, 'pages/next')
    }
  })
}

const fetchWordsFromDatamuse = (res, format, query, limit) => {
  let data = {
    status: null
  }

  console.log(`Fetching ${query} from Datamuse`)
  datamuse.words({
    rel_bga: query
  })
    .then(json => {
      let wordList = {}

      // Create next word list
      let nextWordsAll = []

      // get all words from list except periods and "I" (doesn't work for some reason)
      json.forEach(entry => {
        if (entry.word !== '.' && entry.word !== 'i') {
          nextWordsAll.push(entry.word)
        }
      })

      // Save word list to cache
      wordList.nextWords = nextWordsAll

      // Choose a random assortment of words
      const numWords = limit ? Math.min(limit, nextWordsAll.length) : nextWordsAll.length
      const choices = chance.unique(chance.integer, numWords, { min: 0, max: nextWordsAll.length - 1 })
      let nextWordsSome = []

      choices.forEach(index => {
        nextWordsSome.push(nextWordsAll[index])
      })

      data.nextWords = nextWordsSome

      rClient.set([`next:${query}`, JSON.stringify(wordList)], () => {
        console.log(query + ' set!')
      })

      console.log(`Fetched ${query} from Datamuse`)
      sendResponse(res, format, data, 'pages/next')
    })
    .catch(err => {
      data.status = 'error'
      data.message = err

      console.log(`Can't fetch ${query} from Datamuse`)
      sendResponse(res, format, data, 'pages/next')
    })
}

module.exports = router