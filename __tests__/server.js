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
  SLUG: `${SERVER}/api/slug/`
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
      // expect(result[apiConstants.RESPONSE].slug).to.equal(slug)

      file = result[apiConstants.RESPONSE]
      file.path = path.join(__dirname, '../', process.env.UPLOAD_DIR, file.id)
      // file.unpack = path.join(__dirname, '../', process.env.UNPACK_DIR, file.slug, '/img.jpg')
    })

    it(`check upload file size: ${filesize}`, () => {
      expect(filesize).to.equal(getFilesizeInBytes(file.path))
    })

    /*  it(`check unpack file size: ${filesize}`, () => {
      expect(imagesize).to.equal(getFilesizeInBytes(file.unpack))
    }) */

    it(`no file`, async () => {
      const result = await curl(ENDPOINT.UPLOAD, { test: randomString() })
      // // console.log(result)

      expect(result[apiConstants.ERROR]).to.equal(apiConstants.ERROR_FILE)
    })

    it('no exist', async () => {
      const result = await curl(ENDPOINT.SLUG, { slug: randomString() })

      expect(result[apiConstants.ERROR]).to.be.undefined
      expect(result[apiConstants.RESPONSE].exist).to.be.false
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
