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
  REMOVE: `${SERVER}/api/remove/`,
  SLUG: `${SERVER}/api/slug/`,
  UPDATE: `${SERVER}/api/update/`
}

const { apiConstants } = require('./../src/api')

const randomString = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

const curl = async (endpoint, params) => {
  if (params) {
    if (params.file) {
      let fields = []
      for (let name in params) {
        fields.push(`--form ${name}=${params[name]}`)
      }
      params = fields.join(' ')
    } else {
      params = `-X POST -d "${querystring.stringify(params)}"`
    }
  }
  // console.log(`curl ${params} ${endpoint}`)
  const { stdout } = await exec(`curl -X POST ${params} ${endpoint}`)

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

const filename = path.join(__dirname, '/img.zip')
const filesize = getFilesizeInBytes(filename)

const fileimage = path.join(__dirname, '/img.jpg')
const imagesize = getFilesizeInBytes(fileimage)

const filename2 = path.join(__dirname, '/img2.zip')
const filesize2 = getFilesizeInBytes(filename2)

const fileimage2 = path.join(__dirname, '/img2.jpg')
const imagesize2 = getFilesizeInBytes(fileimage2)

const checkServer = function (i) {
  describe(`Check file upload #${i + 1}`, () => {
    let file

    it(`upload: 1.zip`, async () => {
      const slug = randomString()
      const result = await curl(ENDPOINT.UPLOAD, { file: '@' + filename, slug })
      // console.log(result)

      /* eslint-disable no-unused-expressions */
      expect(result[apiConstants.ERROR]).to.be.undefined
      expect(result[apiConstants.RESPONSE].name).to.equal('img.zip')
      expect(result[apiConstants.RESPONSE].id).to.be.a('string')
      expect(result[apiConstants.RESPONSE].slug).to.equal(slug)

      file = result[apiConstants.RESPONSE]
      file.path = path.join(__dirname, '../', process.env.UPLOAD_DIR, file.id)
      file.unpack = path.join(__dirname, '../', process.env.UNPACK_DIR, file.slug, '/img.jpg')
    })

    it(`check upload file size: ${filesize}`, () => {
      expect(filesize).to.equal(getFilesizeInBytes(file.path))
    })

    it(`check unpack file size: ${imagesize}`, () => {
      expect(imagesize).to.equal(getFilesizeInBytes(file.unpack))
    })

    it(`update: 2.zip`, async () => {
      const result = await curl(ENDPOINT.UPDATE, { file: '@' + filename2, id: file.id })

      expect(result[apiConstants.ERROR]).to.be.undefined
      expect(result[apiConstants.RESPONSE].name).to.equal('img2.zip')
      expect(result[apiConstants.RESPONSE].slug).to.equal(file.slug)
      expect(result[apiConstants.RESPONSE].id).to.equal(file.id)

      file.unpack = path.join(__dirname, '../', process.env.UNPACK_DIR, file.slug, '/img2.jpg')
    })

    it(`check update file size: ${filesize2}`, () => {
      expect(filesize2).to.equal(getFilesizeInBytes(file.path))
    })

    it(`check update file size: ${imagesize2}`, () => {
      expect(imagesize2).to.equal(getFilesizeInBytes(file.unpack))
    })

    it(`remove file`, async () => {
      const result = await curl(ENDPOINT.REMOVE, { id: file.id })

      expect(result[apiConstants.ERROR]).to.be.undefined
      expect(result[apiConstants.RESPONSE]).to.equal(true)
      expect(fs.existsSync(file.path)).to.be.false
    })
  })

  describe(`Check errors #${i + 1}`, () => {
    it(`no file`, async () => {
      const result = await curl(ENDPOINT.UPLOAD, { test: randomString() })
      // // console.log(result)

      expect(result[apiConstants.ERROR]).to.equal(apiConstants.ERROR_FILE)
    })

    it('slug no exists', async () => {
      const result = await curl(ENDPOINT.SLUG, { slug: randomString() })

      expect(result[apiConstants.ERROR]).to.be.undefined
      expect(result[apiConstants.RESPONSE].exist).to.be.false
    })
  })
}

for (let i = 0; i < 10; i++) {
  checkServer(i)
}
