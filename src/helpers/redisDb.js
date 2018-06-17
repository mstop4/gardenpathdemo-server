import dotenv from 'dotenv'
dotenv.config()
import redis from 'redis'

const client = redis.createClient(process.env.REDISCLOUD_URL, {no_ready_check: true})

client.on('connect', () => {
  console.log('Redis connected on port 6379')
})

module.exports = client