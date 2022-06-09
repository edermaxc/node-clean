const httpResponse = require('../helper/http-response')

module.exports = class LoginRouter {
  route (httpRequest) {
    if (!httpRequest || !httpRequest.body) {
      return httpResponse.serverError()
    }

    const { email, password } = httpRequest.body

    if (!email) {
      return httpResponse.badParam('email')
    }
    if (!password) {
      return httpResponse.badParam('password')
    }
  }
}
