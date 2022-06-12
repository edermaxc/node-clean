const MissingParamError = require('./missing-param-error')
const UnauthoriedError = require('./unauthorized-error')

module.exports = class httpResponse {
  static badParam (paramName) {
    return {
      statusCode: 400,
      body: new MissingParamError(paramName)
    }
  }

  static serverError () {
    return {
      statusCode: 500
    }
  }

  static unauthorizedError () {
    return {
      statusCode: 401,
      body: new UnauthoriedError()
    }
  }
}
