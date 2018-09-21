require('dotenv').config()
const express = require('express')
const formidable = require('express-formidable')
const cors = require('cors')
const path = require('path')
const fs = require('fs')

const app = express()

app.use(cors())
app.use(formidable())

const ApiConstants = {
  RESPONSE: 'response',
  ERROR: 'error'
}

const createDefaultJson = () => {
  const resObject = {}
  resObject[ApiConstants.RESPONSE] = {}
  return resObject
}

const isFunction = (functionToCheck) => {
  return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]'
}

class ApiEngine {
  constructor () {
    this.resObject = createDefaultJson()
  }

  run (callback_method) {
    if (isFunction(callback_method)) {
      try {
        this.resObject[ApiConstants.RESPONSE] = callback_method()
      } catch (e) {
        this.resObject[ApiConstants.ERROR] = e.message
      }
    } else {
      this.resObject[ApiConstants.ERROR] = 'Error in the server request'
    }

    return this.resObject
  }
}

const api = new ApiEngine()

app.post('/upload', (req, res) => {
  const result = api.run(() => {
    if (!req.files || !req.files.file) {
      throw new Error('No file')
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
