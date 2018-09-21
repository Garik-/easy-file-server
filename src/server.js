require('dotenv').config()
const http = require('http')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const upload = multer({ dest: 'uploads/' })
const urlencoded = bodyParser.urlencoded({ extended: true })
const db = require('./db')
const { apiConstants, createDefaultJson } = require('./api')

app.set('port', process.env.PORT || 3000)

// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: true }))

app.post('/upload', upload.single('file'), function (req, res) {
  // req.file is the `file` file
  // req.body will hold the text fields, if there were any

  const result = createDefaultJson()
  if (!req.file) {
    result.error = apiConstants.ERROR_FILE
  } else {
    const file = {
      id: req.file.filename,
      name: req.file.originalname
    }

    db.get('files').push(file).write()
    result.response = file
  }

  if (result.error) {
    res.status(400)
  }

  res.type('json')
  res.json(result)
})

app.post('/remove', urlencoded, function (req, res) {
  const result = createDefaultJson()

  if (req.body && req.body.id) {
    const filepath = path.join(__dirname, '../uploads/', req.body.id)
    fs.unlinkSync(filepath)

    const isDeleted = !fs.existsSync(filepath)

    if (isDeleted) {
      db.get('files').remove({ id: req.body.id }).write()
    }

    result.response = isDeleted
  } else {
    result.error = apiConstants.ERROR_PARAMS
  }

  // console.log(req.body)
  if (result.error) {
    res.status(400)
  }

  res.type('json')
  res.json(result)
})

const server = http.createServer(app)
server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'))
})
