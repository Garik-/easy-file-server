const { expect } = require('chai')
const { describe, it } = require('mocha')
const fs = require('fs')
const path = require('path')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const { apiConstants } = require('../api')

require('dotenv').config()

const SERVER = `http://localhost:${process.env.PORT}`
const ENDPOINT = {
  UPLOAD: `${SERVER}/upload/`,
  REMOVE: `${SERVER}/remove/`
}

const parse = async (cmd) => {
  const { stdout } = await exec(cmd)

  expect(stdout).to.be.a('string')
  return JSON.parse(stdout)
}

describe('Check file upload', () => {
  function getFilesizeInBytes (filename) {
    const stats = fs.statSync(filename)
    const fileSizeInBytes = stats.size
    return fileSizeInBytes
  }

  const filename = path.join(__dirname, '/1.zip')
  const filesize = getFilesizeInBytes(filename)
  let file

  it(`upload: 1.zip`, async () => {
    const cmd = `curl -F "file=@${filename}" ${ENDPOINT.UPLOAD}`
    const result = await parse(cmd)

    /* eslint-disable no-unused-expressions */
    expect(result[apiConstants.ERROR]).to.be.undefined
    expect(result[apiConstants.RESPONSE].name).to.equal('1.zip')
    expect(result[apiConstants.RESPONSE].id).to.be.a('string')

    file = result[apiConstants.RESPONSE]
  })

  it(`check upload file size: ${filesize}`, () => {
    const filename = path.join(__dirname, '../../uploads/', file.id)
    expect(filesize).to.equal(getFilesizeInBytes(filename))
  })

  it(`remove upload file`, async () => {
    const cmd = `curl --header "Content-Type: application/json" --request POST --data '${JSON.stringify(file)}' ${ENDPOINT.REMOVE}`
    const result = await parse(cmd)

    expect(result[apiConstants.ERROR]).to.be.undefined
    expect(result[apiConstants.RESPONSE]).to.equal(true)

    const filename = path.join(__dirname, '../../uploads/', file.id)
    expect(fs.existsSync(filename)).to.be.false
  })

  it('no file', async () => {
    const cmd = `curl -F "test=123" ${ENDPOINT.UPLOAD}`
    const result = await parse(cmd)
    expect(result[apiConstants.ERROR]).to.equal(apiConstants.ERROR_FILE)
  })
})
