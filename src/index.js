require('dotenv').config()
const express = require('express')
const formidable = require('express-formidable')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const { api, apiConstants } = require('./api')

const app = express()

app.use(cors())
app.use(formidable())

app.post('/upload', (req, res) => {
  const result = api.run(() => {
    if (!req.files || !req.files.file) {
      throw new Error(apiConstants.ERROR_FILE)
    }

    const oldpath = req.files.file.path
    const newpath = path.join(__dirname, '../uploads/', req.files.file.name)

    fs.renameSync(oldpath, newpath)

    return true
  })

  res.type('json')
  res.json(result)
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
