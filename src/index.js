require('dotenv').config()
const express = require('express')
const formidable = require('express-formidable')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const { api, apiConstants } = require('./api')
const db = require('./db')
const app = express()

const randomString = () => { return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) }

app.use(cors())
app.use(formidable())

app.post('/upload', (req, res) => {
  const result = api.run(() => {
    if (!req.files || !req.files.file) {
      throw new Error(apiConstants.ERROR_FILE)
    }

    const file = {
      id: randomString(),
      name: req.files.file.name,
      created: Date.now()
    }

    const oldpath = req.files.file.path
    const newpath = path.join(__dirname, '../uploads/', file.id)

    fs.renameSync(oldpath, newpath)

    db.get('files').push(file).write()
    return file
  })

  if (result.errno) {
    res.status(result.errno)
  }

  res.type('json')
  res.json(result)
  // res.end()
})

app.post('/remove', (req, res) => {
  const result = api.run(() => {
    if (!req.fields || !req.fields.id) {
      throw new Error(apiConstants.ERROR_PARAMS)
    }

    const filepath = path.join(__dirname, '../uploads/', req.fields.id)
    fs.unlinkSync(filepath)

    const isDeleted = !fs.existsSync(filepath)

    if (isDeleted) {
      db.get('files').remove({ id: req.fields.id }).write()
    }

    return isDeleted
  })

  if (result.errno) {
    res.status(result.errno)
  }

  res.type('json')
  res.json(result)
  // res.end()
})

// Listen for incoming HTTP requests
const listener = app.listen(process.env.PORT || undefined, () => {
  let host = listener.address().address
  if (host === '::') {
    host = 'localhost'
  }
  const port = listener.address().port
  // eslint-disable-next-line no-console
  console.log('Server is running on http://%s%s', host, port === 80 ? '' : ':' + port)
})
