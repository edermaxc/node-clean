const uuid = require('uuid')
const httpResponse = require('../helper/response/http-response')
const { MissingParamError, InvalidParamError } = require('../../utils/error')

module.exports = class LoginRouter {
  constructor (authUseCase, emailValidator) {
    this.authUseCase = authUseCase
    this.emailValidator = emailValidator
  }

  async route (httpRequest) {
    try {
      const { email, password } = httpRequest.body

      if (!email) {
        return httpResponse.badParam(new MissingParamError('email'))
      }

      if (!this.emailValidator.isValid(email)) {
        return httpResponse.badParam(new InvalidParamError('email'))
      }

      if (!password) {
        return httpResponse.badParam(new MissingParamError('password'))
      }

      const accessToken = await this.authUseCase.auth(email, password)

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
