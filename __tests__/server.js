require('dotenv').config()
const { expect } = require('chai')
const { describe, it } = require('mocha')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const querystring = require('querystring')
const path = require('path')
const fs = require('fs')

const SERVER = `http://localhost:${process.env.PORT}`
const ENDPOINT = {
  UPLOAD: `${SERVER}/api/upload/`,
  REMOVE: `${SERVER}/api/remove/`
}

const { apiConstants } = require('./../src/api')

const curl = async (endpoint, params) => {
  let flag = '-F'

  if (params) {
    params = querystring.stringify(params)
    params = params.replace('%40', '@')
    params = params.replace(/%2F/g, '/')

    if (!/@/.test(params)) {
      flag = '-d'
    }
  }

  const { stdout } = await exec(`curl -X POST ${params ? ` ${flag} "${params}"` : null} ${endpoint}`)

  expect(stdout).to.be.a('string')

  try {
    const json = JSON.parse(stdout)
    return json
  } catch (e) {
    console.log(stdout)
    throw e
  }
}

function getFilesizeInBytes (filename) {
  const stats = fs.statSync(filename)
  const fileSizeInBytes = stats.size
  return fileSizeInBytes
}

const filename = path.join(__dirname, '/1.zip')
const filesize = getFilesizeInBytes(filename)

const checkServer = function (i) {
  describe(`Check file upload #${i + 1}`, () => {
    let file

    it(`upload: 1.zip`, async () => {
      const result = await curl(ENDPOINT.UPLOAD, { file: '@' + filename })
      // console.log(result)

      /* eslint-disable no-unused-expressions */
      expect(result[apiConstants.ERROR]).to.be.undefined
      expect(result[apiConstants.RESPONSE].name).to.equal('1.zip')
      expect(result[apiConstants.RESPONSE].id).to.be.a('string')

      file = result[apiConstants.RESPONSE]
      file.path = path.join(__dirname, '../', process.env.UPLOAD_DIR, file.id)
    })

    it(`check upload file size: ${filesize}`, () => {
      expect(filesize).to.equal(getFilesizeInBytes(file.path))
    })

    it(`no file`, async () => {
      const result = await curl(ENDPOINT.UPLOAD, { test: 123 })
      // // console.log(result)

      expect(result[apiConstants.ERROR]).to.equal(apiConstants.ERROR_FILE)
    })

    it(`remove upload file`, async () => {
      const result = await curl(ENDPOINT.REMOVE, { id: file.id })

      expect(result[apiConstants.ERROR]).to.be.undefined
      expect(result[apiConstants.RESPONSE]).to.equal(true)
      expect(fs.existsSync(file.path)).to.be.false
    })
  })
}

for (let i = 0; i < 10; i++) {
  checkServer(i)
}
