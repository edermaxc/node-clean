const UnauthoriedError = require('./unauthorized-error')

module.exports = class httpResponse {
  static badParam (error) {
    return {
      statusCode: 400,
      body: error
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

  static suceess (data) {
    return {
      statusCode: 200,
      body: data
    }
  }
}
