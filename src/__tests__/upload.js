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

  it(`upload: 1.zip`, async () => {
    const cmd = `curl -F "file=@${filename}" ${ENPOINT_UPLOAD}`
    const { stdout } = await exec(cmd)

    expect(stdout).to.be.a('string')
    const result = JSON.parse(stdout)

    expect(result[apiConstants.ERROR]).to.be.undefined
    expect(result[apiConstants.RESPONSE]).to.be.true
  })

/*   it(`Проверяем размер нашего и загруженного файла`, () => {

  })

  it(`Удаляем запись`, () => {

  })

  it(`Проверяем есть ли файл на серваке`, () => {

  }) */
})
