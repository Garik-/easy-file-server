require('dotenv').config()
const http = require('http')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const upload = multer({ dest: process.env.UPLOAD_DIR })
// const urlencoded = bodyParser.urlencoded({ extended: true })
const db = require('./db')
const { apiConstants, createDefaultJson } = require('./api')

app.set('port', process.env.PORT || 5000)

// app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Загрузка файла и создание записи
app.post('/api/upload', upload.single('file'), function (req, res) {
  // req.file is the `file` file
  // req.body will hold the text fields, if there were any

  const result = createDefaultJson()
  if (!req.file || !req.body.slug) {
    res.status(400)
    result.error = apiConstants.ERROR_FILE
  } else {
    console.log(req.body.slug)

    const file = {
      id: req.file.filename,
      name: req.file.originalname
    }

    db.get('files').push(file).write()
    result.response = file
  }

  res.type('json')
  res.json(result)
})

// Удаление файла и записи
app.post('/api/remove', function (req, res) {
  const promise = new Promise(function (resolve, reject) {
    if (req.body && req.body.id) {
      const filepath = path.join(process.env.UPLOAD_DIR, req.body.id)
      fs.unlink(filepath, function (err) {
        if (err) {
          reject(err)
        } else {
          db.get('files').remove({ id: req.body.id }).write()
          resolve(true)
        }
      })
    } else {
      reject(apiConstants.ERROR_PARAMS)
    }
  })

  res.type('json')
  const json = createDefaultJson()

  promise.then(
    result => {
      json.response = result

      res.json(json)
    },
    error => {
      json.error = error

      res.status(400)
      res.json(json)
    }
  )
})

// Запрашиваем список файлов из базы для отладки
app.get('/api/list', function (req, res) {
  res.type('json')
  res.json(db.getState())
})

// Проверяем существует ли директория по имени slug
app.post('/api/slug', function (req, res) {
  const promise = new Promise(function (resolve, reject) {
    if (req.body && req.body.slug) {
      const filepath = path.join(process.env.UNPACK_DIR, req.body.slug)
      fs.access(filepath, fs.constants.F_OK, (err) => {
        resolve({ exist: err ? false : true })
      })
    } else {
      reject(apiConstants.ERROR_PARAMS)
    }
  })

  res.type('json')
  const json = createDefaultJson()

  promise.then(
    result => {
      json.response = result

      res.json(json)
    },
    error => {
      json.error = error

      res.status(400)
      res.json(json)
    }
  )
})

const server = http.createServer(app)
server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'))
})
