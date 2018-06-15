import express from 'express'
import morgan from 'morgan'

// Routes
import index from './routes/index'

const app = express()
app.use(morgan('dev'))

app.set('port', 3001)

app.use('/', index)

// eslint-disable-next-line no-unused-vars
const server = app.listen(app.get('port'), () => {
  console.log(`Garden Path Server listening on port ${app.get('port')}`)
})