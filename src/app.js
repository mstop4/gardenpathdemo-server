import express from 'express'
import morgan from 'morgan'
import bodyParser from 'body-parser' 
import path from 'path'

const app = express()
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.set('port', process.env.PORT || 3001)

// Routes
import index from './routes/index'
import seed from './routes/seed'
import related from './routes/related'

app.use('/', index)
app.use('/seed', seed)
app.use('/related', related)

// eslint-disable-next-line no-unused-vars
const server = app.listen(app.get('port'), () => {
  console.log(`Garden Path Server listening on port ${app.get('port')}`)
})