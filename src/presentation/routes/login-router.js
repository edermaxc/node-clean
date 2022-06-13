const httpResponse = require('../helper/http-response')

module.exports = class LoginRouter {
  constructor (authUseCase) {
    this.authUseCase = authUseCase
  }

  route (httpRequest) {
    if (!httpRequest || !httpRequest.body || !this.authUseCase || !this.authUseCase.auth) {
      return httpResponse.serverError()
    }

    const { email, password } = httpRequest.body

    if (!email) {
      return httpResponse.badParam('email')
    }
    if (!password) {
      return httpResponse.badParam('password')
    }

    const accessToken = this.authUseCase.auth(email, password)

    if (!accessToken) {
      return httpResponse.unauthorizedError()
    }
    return httpResponse.suceess({ accessToken })
  }
}
