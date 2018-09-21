const apiConstants = {
  RESPONSE: 'response',
  ERROR: 'error',
  ERRNO: 'errno',
  ERROR_REQUEST: 'Error in the server request',
  ERROR_FILE: 'No file'
}

const createDefaultJson = () => {
  const resObject = {}
  resObject[apiConstants.RESPONSE] = {}
  return resObject
}

const isFunction = (functionToCheck) => {
  return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]'
}

const api = {
  resObject: createDefaultJson(),
  error: function (message, code = 400) {
    this.resObject[apiConstants.ERROR] = message
    this.resObject[apiConstants.ERRNO] = code
  },
  run: function (callback) {
    if (isFunction(callback)) {
      try {
        this.resObject[apiConstants.RESPONSE] = callback()
      } catch (e) {
        this.error(e.message)
      }
    } else {
      this.error(apiConstants.ERROR_REQUEST, 500)
    }

    return this.resObject
  }
}

module.exports = {
  api,
  apiConstants
}
