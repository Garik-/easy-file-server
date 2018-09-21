const apiConstants = {
  RESPONSE: 'response',
  ERROR: 'error'
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
      this.resObject[apiConstants.ERROR] = 'Error in the server request'
    }

    return this.resObject
  }
}

module.exports = {
  api,
  apiConstants
}
