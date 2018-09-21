const apiConstants = {
  RESPONSE: 'response',
  ERROR: 'error',
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
  run: function (callback) {
    if (isFunction(callback)) {
      try {
        this.resObject[apiConstants.RESPONSE] = callback()
      } catch (e) {
        this.resObject[apiConstants.ERROR] = e.message
      }
    } else {
      this.resObject[apiConstants.ERROR] = apiConstants.ERROR_REQUEST
    }

    return this.resObject
  }
}

module.exports = {
  api,
  apiConstants
}
