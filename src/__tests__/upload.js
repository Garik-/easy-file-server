const { expect } = require('chai')
const { describe, it } = require('mocha')
const fs = require('fs')
const path = require('path')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const { apiConstants } = require('../api')

require('dotenv').config()

const SERVER = `http://localhost:${process.env.PORT}`
const ENPOINT_UPLOAD = `${SERVER}/upload/`

describe('Check file upload', () => {
  function getFilesizeInBytes (filename) {
    const stats = fs.statSync(filename)
    const fileSizeInBytes = stats.size
    return fileSizeInBytes
  }

  const filename = path.join(__dirname, '/1.zip')
  const filesize = getFilesizeInBytes(filename)

  it(`upload: 1.zip`, async () => {
    const cmd = `curl -F "file=@${filename}" ${ENPOINT_UPLOAD}`
    const { stdout } = await exec(cmd)

    expect(stdout).to.be.a('string')
    const result = JSON.parse(stdout)

    /* eslint-disable no-unused-expressions */
    expect(result[apiConstants.ERROR]).to.be.undefined
    expect(result[apiConstants.RESPONSE]).to.be.true
  })

  it(`check upload file size: ${filesize}`, () => {
    const filename = path.join(__dirname, '../../uploads/1.zip')
    expect(filesize).to.equal(getFilesizeInBytes(filename))
  })

  it('no file', async () => {
    const cmd = `curl -F "test=123" ${ENPOINT_UPLOAD}`
    const { stdout } = await exec(cmd)

    expect(stdout).to.be.a('string')
    const result = JSON.parse(stdout)
    expect(result[apiConstants.ERROR]).to.equal(apiConstants.ERROR_FILE)
  })

  // Удаляем запись
  // Проверяем есть ли файл на серваке
})
