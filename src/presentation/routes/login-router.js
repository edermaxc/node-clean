const uuid = require('uuid')
const httpResponse = require('../helper/http-response')

module.exports = class LoginRouter {
  constructor (authUseCase) {
    this.authUseCase = authUseCase
  }

  route (httpRequest) {
    try {
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
    } catch (e) {
      const guid = uuid.v4()
      // TODO: gerar log em ferramenta adequada
      console.error(e)
      console.error(guid)
      return httpResponse.serverError(guid)
    }
  }
}
