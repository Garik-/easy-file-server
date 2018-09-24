require('dotenv').config()
const http = require('http')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const upload = multer({ dest: process.env.UPLOAD_DIR })
const rimraf = require('rimraf')
const unzip = require('unzip')

// const urlencoded = bodyParser.urlencoded({ extended: true })
const db = require('./db')
const { apiConstants, createDefaultJson } = require('./api')

app.set('port', process.env.PORT || 5000)

// app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Загрузка файла и создание записи
app.post('/api/upload', upload.single('file'), function (req, res) {
  const promise = new Promise(function (resolve, reject) {
    if (!req.file) {
      reject(apiConstants.ERROR_FILE)
    }

    if (!req.body.slug) {
      reject(apiConstants.ERROR_PARAMS)
    }

    const file = {
      id: req.file.filename,
      name: req.file.originalname,
      slug: req.body.slug
    }

    const PATH = {
      file: path.join(process.env.UPLOAD_DIR, file.id),
      dest: path.join(process.env.UNPACK_DIR, file.slug)
    }

    // console.log(`unzip ${PATH.file} -d ${PATH.dest}`)
    // TODO: обязательна нужна директория unpack
    const stream = fs.createReadStream(PATH.file).pipe(unzip.Extract({ path: PATH.dest }))
    stream.on('close', () => {
      db.get('files').push(file).write()
      resolve(file)
    })
    stream.on('error', err => reject(err))
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

// Удаление файла и записи
app.post('/api/remove', function (req, res) {
  const promise = new Promise(function (resolve, reject) {
    if (req.body && req.body.id) {
      const file = db.get('files').find({ id: req.body.id }).value()
      // console.log(file)
      if (!file) {
        reject(apiConstants.ERROR_FILE)
      } else {
        const PATH = {
          upload: path.join(process.env.UPLOAD_DIR, file.id),
          unpack: path.join(process.env.UNPACK_DIR, file.slug)
        }

        // console.log(PATH)

        fs.unlink(PATH.upload, function (err) {
          if (err) {
            reject(err)
          } else {
            rimraf(PATH.unpack, function (err) {
              if (err) {
                reject(err)
              } else {
                db.get('files').remove({ id: file.id }).write()
                resolve(true)
              }
            })
          }
        })
      }
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
        resolve({ exist: !err })
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
